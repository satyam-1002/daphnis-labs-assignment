import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { computeCombinedSeed } from "@/lib/crypto";
import { runEngine, getPayoutMultiplier } from "@/lib/engine";

const startSchema = z.object({
  clientSeed: z.string().min(1).max(256),
  betCents: z.number().int().min(1).max(1_000_000),
  dropColumn: z.number().int().min(0).max(12),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = startSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { clientSeed, betCents, dropColumn } = parsed.data;

    const round = await prisma.round.findUnique({ where: { id: params.id } });
    if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });
    if (round.status !== "CREATED") return NextResponse.json({ error: "Round already started" }, { status: 409 });
    if (!round.serverSeed) return NextResponse.json({ error: "Server seed missing" }, { status: 500 });

    const combinedSeed = computeCombinedSeed(round.serverSeed, clientSeed, round.nonce);
    const { pegMap, pegMapHash, path, binIndex } = runEngine(combinedSeed, dropColumn);
    const payoutMultiplier = getPayoutMultiplier(binIndex);

    await prisma.round.update({
      where: { id: params.id },
      data: {
        status: "STARTED",
        clientSeed,
        combinedSeed,
        pegMapHash,
        dropColumn,
        binIndex,
        betCents,
        payoutMultiplier,
        pathJson: path as any,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      roundId: params.id,
      pegMapHash,
      rows: 12,
      binIndex,
      payoutMultiplier,
      path,
    });
  } catch (error) {
    console.error("start error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
