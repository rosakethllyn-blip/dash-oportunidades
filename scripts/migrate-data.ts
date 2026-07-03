import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();

const SECTORS_CONFIG = [
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

const SHEET_CONFIG: Record<string, { type: "ADULTO" | "INFANTIL"; year: number; sectorStartRows: Record<string, number> }> = {
  "ADULTO 2025": { type: "ADULTO", year: 2025, sectorStartRows: {} },
  "ADULTO 2026": { type: "ADULTO", year: 2026, sectorStartRows: {} },
  " INFANTIL 2026": { type: "INFANTIL", year: 2026, sectorStartRows: {} },
};

async function getSectorId(sectorName: string, type: string, year: number): Promise<string | null> {
  const sector = await prisma.sector.findFirst({
    where: { name: sectorName, type: type as "ADULTO" | "INFANTIL", year },
  });
  return sector?.id || null;
}

async function getCategoryId(categoryName: string): Promise<string | null> {
  const category = await prisma.category.findFirst({
    where: { name: categoryName },
  });
  return category?.id || null;
}

async function main() {
  console.log("Iniciando migração dos dados...\n");

  // 1. Criar setores
  console.log("1. Criando setores...");
  for (const config of SECTORS_CONFIG) {
    await prisma.sector.upsert({
      where: { name_type_year: { name: config.name, type: config.type, year: config.year } },
      update: {},
      create: {
        name: config.name,
        type: config.type,
        year: config.year,
      },
    });
  }
  console.log(`   ${SECTORS_CONFIG.length} setores criados/atualizados\n`);

  // 2. Processar cada aba
  const xlsxPath = "C:\\Users\\NEP\\Downloads\\Cópia de Oportunidades  convênios .xlsx";
  console.log(`2. Lendo arquivo Excel: ${xlsxPath}`);

  const workbook = XLSX.readFile(xlsxPath);

  let totalMigrated = 0;

  for (const sheetName of workbook.SheetNames) {
    if (sheetName === "Check") continue; // Pular aba de verificação

    const config = SHEET_CONFIG[sheetName];
    if (!config) continue;

    console.log(`\n   Processando aba: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number | null)[][];

    // Encontrar linha do cabeçalho (com meses)
    let headerRow = -1;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row && row[1] && typeof row[1] === "string" && row[1].toUpperCase().includes("JANEIRO") ||
          (row[1] && typeof row[1] === "string" && row[1].toUpperCase().includes("MAIO"))) {
        headerRow = i;
        break;
      }
    }

    if (headerRow === -1) {
      console.log(`   Cabeçalho não encontrado, pulando...`);
      continue;
    }

    // Mapear meses
    const monthMap: Record<string, number> = {
      janeiro: 1, fevereiro: 2, março: 3, abril: 4,
      maio: 5, junho: 6, julho: 7, agosto: 8,
      setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
    };

    // Determinar anos disponíveis
    const months: { col: number; month: number }[] = [];
    const header = data[headerRow];
    for (let col = 1; col < header.length; col++) {
      const monthName = String(header[col] || "").toLowerCase().trim();
      if (monthMap[monthName]) {
        months.push({ col, month: monthMap[monthName] });
      }
    }

    // Determinar o ano principal da aba
    const year = sheetName.includes("2026") ? 2026 : 2025;

    // Encontrar setores na planilha
    const sectorRows: { name: string; startRow: number }[] = [];
    for (let i = headerRow + 1; i < data.length; i++) {
      const firstCell = String(data[i]?.[0] || "").trim();
      if (firstCell && !firstCell.includes(" ") && firstCell.length < 30) {
        // Verificar se é um nome de setor
        const sectorName = firstCell.replace(/^\d+\.\s*/, "").trim();
        if (sectorName && sectorName.length > 2 && !/^\d+$/.test(sectorName)) {
          sectorRows.push({ name: sectorName, startRow: i + 1 });
        }
      }
    }

    // Processar linhas de dados
    let currentSector = config.type === "ADULTO" ? "BLOCO I" : "MATERNIDADE";

    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;

      const firstCell = String(row[0]).trim();

      // Verificar se mudou de setor
      const matchedSector = sectorRows.find(s => s.startRow === i + 1);
      if (matchedSector) {
        currentSector = matchedSector.name;
      }

      // Ignorar se for nome de setor
      if (sectorRows.some(s => s.name === firstCell)) {
        continue;
      }

      const categoryName = firstCell;
      if (!categoryName || categoryName.length < 3) continue;

      // Buscar IDs
      const sectorId = await getSectorId(currentSector, config.type, year);
      const categoryId = await getCategoryId(categoryName);

      if (!sectorId) {
        console.log(`   Setor não encontrado: ${currentSector} (${config.type})`);
        continue;
      }

      // Criar categoria se não existir
      let catId = categoryId;
      if (!catId) {
        const newCat = await prisma.category.create({
          data: { name: categoryName },
        });
        catId = newCat.id;
        console.log(`   Nova categoria: ${categoryName.slice(0, 40)}`);
      }

      // Inserir ocorrências para cada mês
      for (const { col, month } of months) {
        const quantity = Number(row[col]) || 0;
        if (quantity > 0) {
          try {
            // Verificar se já existe
            const existing = await prisma.occurrence.findFirst({
              where: {
                month,
                year,
                sectorId,
                categoryId: catId,
              },
            });

            if (!existing) {
              await prisma.occurrence.create({
                data: {
                  month,
                  year,
                  quantity,
                  sectorId,
                  categoryId: catId,
                  userId: "system", // Placeholder
                },
              });
              totalMigrated++;
            }
          } catch (err) {
            // Ignorar erros de duplicate key
          }
        }
      }
    }

    console.log(`   Processado: ${sheetName}`);
  }

  console.log(`\nMigração concluída!`);
  console.log(`Total de ocorrências migradas: ${totalMigrated}`);

  // Estatísticas finais
  const stats = await prisma.$transaction([
    prisma.sector.count(),
    prisma.category.count(),
    prisma.occurrence.count(),
  ]);

  console.log(`\nEstatísticas:`);
  console.log(`   Setores: ${stats[0]}`);
  console.log(`   Categorias: ${stats[1]}`);
  console.log(`   Ocorrências: ${stats[2]}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
