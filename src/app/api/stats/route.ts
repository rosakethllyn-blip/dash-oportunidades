import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");

    const where: Record<string, unknown> = {};
    if (year) where.year = parseInt(year);

    const [total, thisMonth, lastMonth, byMonth, byCategory, bySector] = await Promise.all([
      prisma.occurrence.aggregate({
        where,
        _sum: { quantity: true },
      }),
      prisma.occurrence.aggregate({
        where: { ...where, year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
        _sum: { quantity: true },
      }),
      prisma.occurrence.aggregate({
        where: { ...where, year: new Date().getFullYear(), month: new Date().getMonth() },
        _sum: { quantity: true },
      }),
      prisma.occurrence.groupBy({
        by: ["month", "year"],
        where,
        _sum: { quantity: true },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      }),
      prisma.occurrence.groupBy({
        by: ["categoryId"],
        where,
        _sum: { quantity: true },
      }),
      prisma.occurrence.groupBy({
        by: ["sectorId"],
        where,
        _sum: { quantity: true },
      }),
    ]);

    const categories = await prisma.category.findMany();
    const sectors = await prisma.sector.findMany();

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const sectorMap = new Map(sectors.map((s) => [s.id, s]));

    const stats = {
      total: total._sum.quantity || 0,
      thisMonth: thisMonth._sum.quantity || 0,
      lastMonth: lastMonth._sum.quantity || 0,
      byMonth: byMonth.map((m) => ({
        month: m.month,
        year: m.year,
        total: m._sum.quantity || 0,
      })),
      byCategory: byCategory.map((c) => ({
        categoryId: c.categoryId,
        name: categoryMap.get(c.categoryId)?.name || "",
        total: c._sum.quantity || 0,
      })),
      bySector: bySector.map((s) => ({
        sectorId: s.sectorId,
        name: sectorMap.get(s.sectorId)?.name || "",
        type: sectorMap.get(s.sectorId)?.type || "",
        total: s._sum.quantity || 0,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
