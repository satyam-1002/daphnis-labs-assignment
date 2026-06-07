import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 50);

    const rounds = await prisma.round.findMany({
      where: { status: "REVEALED" },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        status: true,
        commitHex: true,
        serverSeed: true,
        clientSeed: true,
        combinedSeed: true,
        pegMapHash: true,
        nonce: true,
        dropColumn: true,
        binIndex: true,
        payoutMultiplier: true,
        betCents: true,
        rows: true,
        revealedAt: true,
      },
    });

    return NextResponse.json({ rounds });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
