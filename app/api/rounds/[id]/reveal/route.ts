import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const round = await prisma.round.findUnique({ where: { id: params.id } });
    if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });
    if (round.status === "REVEALED") {
      return NextResponse.json({ serverSeed: round.serverSeed });
    }
    if (round.status !== "STARTED") {
      return NextResponse.json({ error: "Round not started" }, { status: 409 });
    }

    const updated = await prisma.round.update({
      where: { id: params.id },
      data: { status: "REVEALED", revealedAt: new Date() },
    });

    return NextResponse.json({ serverSeed: updated.serverSeed });
  } catch (error) {
    console.error("reveal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
