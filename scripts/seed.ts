import { PrismaClient } from "@prisma/client";
import { hash } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return hash("sha256", password, "hex");
}

async function main() {
  console.log("Iniciando seed do banco de dados...\n");

  // Criar usuário admin
  const adminEmail = "admin@oportunidades.com";
  const adminPassword = "admin123";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrador",
      role: "ADMIN",
      password: hashPassword(adminPassword),
    },
  });

  console.log(`Admin criado: ${admin.email}`);
  console.log(`Senha temporária: ${adminPassword}\n`);

  // Criar usuário sistema para migração
  const systemUser = await prisma.user.upsert({
    where: { email: "system@oportunidades.com" },
    update: {},
    create: {
      email: "system@oportunidades.com",
      name: "Sistema",
      role: "OPERATOR",
    },
  });

  console.log(`Usuário sistema criado: ${systemUser.email}`);
  console.log("(Este usuário é usado para ocorrências migradas)\n");

  // Criar setores padrão
  const sectors = [
    // ADULTO
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
    // INFANTIL
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

  console.log(`${sectors.length} setores criados/atualizados\n`);

  // Criar algumas categorias padrão
  const categories = [
    "Prescrição médica incompleta",
    "Falta prescrição de Curativo",
    "Erro na escrita de medicamento",
    "Erro de horário de aprazamento",
    "Duplicidade de checagem",
    "Falta de checagem",
    "Erro de SADT",
    "Falta de SADT",
    "Assinatura do profissional",
    "Falta de resultado de exames",
    "Falta de evolução",
    "Rasuras",
    "Falta de autorização",
    "Falta de laudo",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`${categories.length} categorias criadas\n`);

  console.log("Seed concluído com sucesso!");
  console.log("\nPróximos passos:");
  console.log("1. Execute 'npm run db:migrate:data' para migrar os dados da planilha");
  console.log("2. Inicie o servidor com 'npm run dev'");
  console.log("3. Acesse http://localhost:3000/login");
  console.log(`4. Use as credenciais: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
