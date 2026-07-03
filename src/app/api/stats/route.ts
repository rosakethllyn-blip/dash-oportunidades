import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const sectorId = searchParams.get("sectorId");

    const where: Record<string, unknown> = {};
    if (year && year !== "all") where.year = parseInt(year);
    if (month && month !== "all") where.month = parseInt(month);
    if (sectorId && sectorId !== "all") where.sectorId = sectorId;

    // Determinar ano efetivo para "este mês" / "mês anterior"
    const effectiveYear = (year && year !== "all") ? parseInt(year) : new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [total, byMonth, byCategory, bySector, sectors] = await Promise.all([
      prisma.occurrence.aggregate({
        where,
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
      prisma.sector.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] }),
    ]);

    // Calcular "este mês" e "mês anterior" considerando filtros
    let thisMonthValue = 0;
    let lastMonthValue = 0;
    if (month && month !== "all") {
      thisMonthValue = (await prisma.occurrence.aggregate({
        where: { ...where, month: parseInt(month), year: effectiveYear },
        _sum: { quantity: true },
      }))._sum.quantity || 0;
      const prevMonth = parseInt(month) - 1;
      if (prevMonth >= 1) {
        lastMonthValue = (await prisma.occurrence.aggregate({
          where: { ...where, month: prevMonth, year: effectiveYear },
          _sum: { quantity: true },
        }))._sum.quantity || 0;
      }
    } else {
      // Sem filtro de mês: pegar o último mês com dados
      const lastMonthData = byMonth[0];
      if (lastMonthData) {
        thisMonthValue = lastMonthData._sum.quantity || 0;
        const prevDate = new Date(lastMonthData.year, lastMonthData.month - 1, 1);
        prevDate.setMonth(prevDate.getMonth() - 1);
        const prev = byMonth.find(
          (m) => m.month === prevDate.getMonth() + 1 && m.year === prevDate.getFullYear()
        );
        lastMonthValue = prev?._sum.quantity || 0;
      }
    }

    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const sectorMap = new Map(sectors.map((s) => [s.id, s]));

    const stats = {
      total: total._sum.quantity || 0,
      thisMonth: thisMonthValue,
      lastMonth: lastMonthValue,
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
    console.error("Erro stats:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}