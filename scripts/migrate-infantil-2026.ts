import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as XLSX from "xlsx";

const connectionString = "postgresql://postgres.hhnbqcxcdpszrtxlaoif:Hmsvp@2026Nep@aws-1-us-east-2.pooler.supabase.com:5432/postgres";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);
const XLSX_PATH = "C:/Users/NEP/Downloads/Cópia de Oportunidades  convênios .xlsx";

const SECTOR_ORDER = ["MATERNIDADE", "UCINCO", "UTI NEO", "CCMI", "UTI PED", "PSI", "BLOCO III", "ONCOLOGIA PEDIÁTRICA"];
const MONTHS_MAP: Record<string, number> = {
  JANEIRO: 1, FEVEREIRO: 2, MARCO: 3, ABRIL: 4, MAIO: 5, JUNHO: 6,
  JULHO: 7, AGOSTO: 8, SETEMBRO: 9, OUTUBRO: 10, NOVEMBRO: 11, DEZEMBRO: 12,
};

async function main() {
  console.log("Migrando INFANTIL 2026...\n");
  const workbook = XLSX.readFile(XLSX_PATH);

  // Encontrar aba que contém "INFANTIL 2026" (com espaço)
  const sheetName = workbook.SheetNames.find(n => n.trim().includes("INFANTIL 2026"));
  if (!sheetName) {
    console.error("Aba INFANTIL 2026 não encontrada!");
    process.exit(1);
  }
  console.log(`Aba encontrada: "${sheetName}"`);

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) { console.error("Admin não encontrado!"); process.exit(1); }

  // Encontrar cabeçalho
  let headerRow = -1;
  for (let i = 0; i < data.length; i++) {
    const firstCol = String(data[i]?.[0] || "").trim();
    if (SECTOR_ORDER.includes(firstCol)) {
      headerRow = i;
      break;
    }
  }
  if (headerRow === -1) { console.error("Cabeçalho não encontrado"); process.exit(1); }
  console.log(`Cabeçalho na linha ${headerRow}`);

  // Mapear meses (somente Jan-Abr)
  const monthCols: { month: number; col: number }[] = [];
  const monthHeader = data[headerRow] as string[];
  for (let col = 1; col < monthHeader.length; col++) {
    const monthName = String(monthHeader[col] || "").toUpperCase().replace(/Ç/g, "C").trim();
    if (MONTHS_MAP[monthName] && MONTHS_MAP[monthName] <= 4) {
      monthCols.push({ month: MONTHS_MAP[monthName], col });
    }
  }
  console.log(`Meses: ${monthCols.map(m => `${m.month}`).join(", ")}`);

  let currentSector = SECTOR_ORDER[0];
  let inserted = 0;

  for (let i = headerRow + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;
    const firstCell = String(row[0]).trim();
    if (SECTOR_ORDER.includes(firstCell)) { currentSector = firstCell; continue; }
    const categoryName = firstCell;
    if (!categoryName || categoryName.length < 3) continue;
    if (categoryName.toUpperCase().includes("TOTAL")) continue;

    let category = await prisma.category.findFirst({ where: { name: categoryName } });
    if (!category) category = await prisma.category.create({ data: { name: categoryName } });

    const sector = await prisma.sector.findFirst({ where: { name: currentSector, type: "INFANTIL", year: 2026 } });
    if (!sector) continue;

    for (const { month, col } of monthCols) {
      const quantity = Number(row[col]) || 0;
      if (quantity > 0) {
        const existing = await prisma.occurrence.findFirst({
          where: { month, year: 2026, sectorId: sector.id, categoryId: category.id },
        });
        if (!existing) {
          await prisma.occurrence.create({
            data: { month, year: 2026, quantity, sectorId: sector.id, categoryId: category.id, userId: admin.id },
          });
          inserted++;
        }
      }
    }
  }

  console.log(`\n✅ ${inserted} ocorrências inseridas para INFANTIL 2026`);
}

main().catch(console.error).finally(() => { prisma.$disconnect(); pool.end(); });
