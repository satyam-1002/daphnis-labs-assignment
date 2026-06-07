import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { computeCommitHex, randomHex, sha256 } from "@/lib/crypto";

const schema = z.object({}).optional();

export async function POST() {
  try {
    const serverSeed = randomHex(32);
    const nonce = String(Math.floor(Math.random() * 1_000_000));
    const commitHex = computeCommitHex(serverSeed, nonce);
    const serverSeedHash = sha256(serverSeed);

    const round = await prisma.round.create({
      data: {
        nonce,
        commitHex,
        serverSeed, // stored server-side, NOT sent to client
        serverSeedHash,
        status: "CREATED",
      },
    });

    return NextResponse.json({
      roundId: round.id,
      commitHex: round.commitHex,
      nonce: round.nonce,
      serverSeedHash: round.serverSeedHash,
    });
  } catch (error) {
    console.error("commit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
