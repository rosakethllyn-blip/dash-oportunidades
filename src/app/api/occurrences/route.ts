import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const sectorId = searchParams.get("sectorId");
    const categoryId = searchParams.get("categoryId");

    const where: Record<string, unknown> = {};
    if (year) where.year = parseInt(year);
    if (sectorId) where.sectorId = sectorId;
    if (categoryId) where.categoryId = categoryId;

    const occurrences = await prisma.occurrence.findMany({
      where,
      include: {
        sector: true,
        category: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json(occurrences);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar ocorrências" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { month, year, quantity, notes, sectorId, categoryId } = body;

    if (!month || !year || !quantity || !sectorId || !categoryId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const occurrence = await prisma.occurrence.create({
      data: {
        month: parseInt(month),
        year: parseInt(year),
        quantity: parseInt(quantity),
        notes,
        userId: session.user.id,
        sectorId,
        categoryId,
      },
      include: {
        sector: true,
        category: true,
      },
    });

    return NextResponse.json(occurrence, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar ocorrência" }, { status: 500 });
  }
}
