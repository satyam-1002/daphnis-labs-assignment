import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeCommitHex, computeCombinedSeed } from "@/lib/crypto";
import { runEngine } from "@/lib/engine";
import { prisma } from "@/lib/db";

const querySchema = z.object({
  serverSeed: z.string().min(1),
  clientSeed: z.string().min(1),
  nonce: z.string().min(1),
  dropColumn: z.coerce.number().int().min(0).max(12),
  roundId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters", details: parsed.error.flatten() }, { status: 400 });
    }

    const { serverSeed, clientSeed, nonce, dropColumn, roundId } = parsed.data;

    const commitHex = computeCommitHex(serverSeed, nonce);
    const combinedSeed = computeCombinedSeed(serverSeed, clientSeed, nonce);
    const { pegMap, pegMapHash, path, binIndex } = runEngine(combinedSeed, dropColumn);

    let storedRound = null;
    let matches = false;

    if (roundId) {
      storedRound = await prisma.round.findUnique({ where: { id: roundId } });
      if (storedRound && storedRound.status === "REVEALED") {
        matches =
          storedRound.commitHex === commitHex &&
          storedRound.pegMapHash === pegMapHash &&
          storedRound.binIndex === binIndex;
      }
    }

    return NextResponse.json({
      commitHex,
      combinedSeed,
      pegMapHash,
      binIndex,
      path,
      storedRound: storedRound
        ? {
            id: storedRound.id,
            commitHex: storedRound.commitHex,
            pegMapHash: storedRound.pegMapHash,
            binIndex: storedRound.binIndex,
          }
        : null,
      matches,
    });
  } catch (error) {
    console.error("verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
