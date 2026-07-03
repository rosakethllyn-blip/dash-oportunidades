import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const occurrence = await prisma.occurrence.findUnique({
      where: { id },
      include: { sector: true, category: true, user: true },
    });

    if (!occurrence) {
      return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
    }

    return NextResponse.json(occurrence);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar ocorrência" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { month, year, quantity, notes, sectorId, categoryId } = body;

    const occurrence = await prisma.occurrence.update({
      where: { id },
      data: {
        month: parseInt(month),
        year: parseInt(year),
        quantity: parseInt(quantity),
        notes,
        sectorId,
        categoryId,
      },
      include: { sector: true, category: true },
    });

    return NextResponse.json(occurrence);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.occurrence.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
