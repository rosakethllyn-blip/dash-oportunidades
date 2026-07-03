import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  try {
    // Tentar contar usuários
    const count = await prisma.user.count();

    // Se não existir, criar admin
    const adminEmail = "admin@oportunidades.com";
    const adminPassword = "admin123";
    const hashedPassword = crypto
      .createHash("sha256")
      .update(adminPassword)
      .digest("hex");

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: hashedPassword },
      create: {
        email: adminEmail,
        name: "Administrador",
        role: "ADMIN",
        password: hashedPassword,
      },
    });

    // Criar setores padrão
    const sectors = [
      { name: "BLOCO I", type: "ADULTO" as const, year: 2025 },
      { name: "BLOCO II", type: "ADULTO" as const, year: 2025 },
      { name: "ALA A (ONCO)", type: "ADULTO" as const, year: 2025 },
      { name: "UTI I", type: "ADULTO" as const, year: 2025 },
      { name: "CENTRO CIRÚRGICO", type: "ADULTO" as const, year: 2025 },
      { name: "BLOCO V", type: "ADULTO" as const, year: 2025 },
      { name: "PSA", type: "ADULTO" as const, year: 2025 },
      { name: "UTI II", type: "ADULTO" as const, year: 2025 },
      { name: "BLOCO I", type: "ADULTO" as const, year: 2026 },
      { name: "BLOCO II", type: "ADULTO" as const, year: 2026 },
      { name: "ALA A (ONCO)", type: "ADULTO" as const, year: 2026 },
      { name: "UTI I", type: "ADULTO" as const, year: 2026 },
      { name: "CENTRO CIRÚRGICO", type: "ADULTO" as const, year: 2026 },
      { name: "BLOCO V", type: "ADULTO" as const, year: 2026 },
      { name: "PSA", type: "ADULTO" as const, year: 2026 },
      { name: "UTI II", type: "ADULTO" as const, year: 2026 },
      { name: "MATERNIDADE", type: "INFANTIL" as const, year: 2025 },
      { name: "UCINCO", type: "INFANTIL" as const, year: 2025 },
      { name: "UTI NEO", type: "INFANTIL" as const, year: 2025 },
      { name: "CCMI", type: "INFANTIL" as const, year: 2025 },
      { name: "UTI PED", type: "INFANTIL" as const, year: 2025 },
      { name: "PSI", type: "INFANTIL" as const, year: 2025 },
      { name: "BLOCO III", type: "INFANTIL" as const, year: 2025 },
      { name: "ONCOLOGIA PEDIÁTRICA", type: "INFANTIL" as const, year: 2025 },
      { name: "MATERNIDADE", type: "INFANTIL" as const, year: 2026 },
      { name: "UCINCO", type: "INFANTIL" as const, year: 2026 },
      { name: "UTI NEO", type: "INFANTIL" as const, year: 2026 },
      { name: "CCMI", type: "INFANTIL" as const, year: 2026 },
      { name: "UTI PED", type: "INFANTIL" as const, year: 2026 },
      { name: "PSI", type: "INFANTIL" as const, year: 2026 },
      { name: "BLOCO III", type: "INFANTIL" as const, year: 2026 },
      { name: "ONCOLOGIA PEDIÁTRICA", type: "INFANTIL" as const, year: 2026 },
    ];

    for (const sector of sectors) {
      await prisma.sector.upsert({
        where: { name_type_year: { name: sector.name, type: sector.type, year: sector.year } },
        update: {},
        create: sector,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Banco de dados inicializado com sucesso!",
      userCount: count,
      adminCreated: admin.email,
      sectorsCount: sectors.length,
      credentials: {
        email: "admin@oportunidades.com",
        password: "admin123",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      {
        error: "Erro ao inicializar banco",
        details: message,
        hint: "Verifique se a DATABASE_URL está correta e se o Supabase permite conexões",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET();
}