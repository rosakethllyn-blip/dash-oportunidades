import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || "admin@oportunidades.com";
    const password = body.password || "admin123";

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        name: "Administrador",
        role: "ADMIN",
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      user: { email: user.email, role: user.role },
      message: "Usuário criado/atualizado com sucesso",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao criar usuário", details: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST para criar usuário admin",
    credentials: {
      email: "admin@oportunidades.com",
      password: "admin123",
    },
  });
}