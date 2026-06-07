import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const round = await prisma.round.findUnique({ where: { id: params.id } });
    if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

    // Don't expose serverSeed until revealed
    const { serverSeed, ...safeRound } = round;
    return NextResponse.json({
      ...safeRound,
      serverSeed: round.status === "REVEALED" ? serverSeed : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
