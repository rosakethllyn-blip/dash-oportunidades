import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sectors = await prisma.sector.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(sectors);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar setores" }, { status: 500 });
  }
}
