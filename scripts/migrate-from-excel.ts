import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as XLSX from "xlsx";

const connectionString = "postgresql://postgres.hhnbqcxcdpszrtxlaoif:Hmsvp@2026Nep@aws-1-us-east-2.pooler.supabase.com:5432/postgres";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);
const XLSX_PATH = "C:/Users/NEP/Downloads/Cópia de Oportunidades  convênios .xlsx";

const SHEET_SECTORS: Record<string, { type: "ADULTO" | "INFANTIL"; year: number; sectorOrder: string[] }> = {
  "ADULTO 2025": { type: "ADULTO", year: 2025, sectorOrder: ["BLOCO I", "BLOCO II", "ALA A (ONCO)", "UTI I", "CENTRO CIRÚRGICO", "BLOCO V", "PSA", "UTI II"] },
  "ADULTO 2026": { type: "ADULTO", year: 2026, sectorOrder: ["BLOCO I", "BLOCO II", "ALA A (ONCO)", "UTI I", "CENTRO CIRÚRGICO", "BLOCO V", "PSA", "UTI II"] },
  "INFANTIL 2025": { type: "INFANTIL", year: 2025, sectorOrder: ["MATERNIDADE", "UCINCO", "UTI NEO", "CCMI", "UTI PED", "PSI", "BLOCO III", "ONCOLOGIA PEDIÁTRICA"] },
  "INFANTIL 2026": { type: "INFANTIL", year: 2026, sectorOrder: ["MATERNIDADE", "UCINCO", "UTI NEO", "CCMI", "UTI PED", "PSI", "BLOCO III", "ONCOLOGIA PEDIÁTRICA"] },
};

const MONTHS_MAP: Record<string, number> = {
  JANEIRO: 1, FEVEREIRO: 2, MARCO: 3, MARÇO: 3, ABRIL: 4, MAIO: 5, JUNHO: 6,
  JULHO: 7, AGOSTO: 8, SETEMBRO: 9, OUTUBRO: 10, NOVEMBRO: 11, DEZEMBRO: 12,
};

async function main() {
  console.log("Iniciando migração da planilha Excel...\n");
  const workbook = XLSX.readFile(XLSX_PATH);
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) { console.error("Admin não encontrado!"); process.exit(1); }

  let totalInserted = 0;

  for (const sheetName of workbook.SheetNames) {
    if (sheetName === "Check") continue;
    const config = SHEET_SECTORS[sheetName.trim().replace(/^s+/, "")];
    if (!config) { console.log(`⚠️ Aba ignorada: ${sheetName}`); continue; }

    console.log(`\n📄 Processando: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Encontrar linha do cabeçalho (que tem o nome do primeiro setor na col 0)
    let headerRow = -1;
    for (let i = 0; i < data.length; i++) {
      const firstCol = String(data[i]?.[0] || "").trim();
      if (config.sectorOrder.includes(firstCol)) {
        headerRow = i;
        break;
      }
    }

    if (headerRow === -1) { console.log("   ❌ Cabeçalho não encontrado"); continue; }
    console.log(`   Cabeçalho na linha ${headerRow}`);

    // Mapear colunas dos meses
    const monthCols: { month: number; col: number }[] = [];
    const monthHeader = data[headerRow] as string[];
    for (let col = 1; col < monthHeader.length; col++) {
      const monthName = String(monthHeader[col] || "").toUpperCase().replace(/Ç/g, "C").trim();
      if (MONTHS_MAP[monthName]) {
        // Validar se é o ano correto
        if (config.year === 2025 && MONTHS_MAP[monthName] >= 5) {
          monthCols.push({ month: MONTHS_MAP[monthName], col });
        } else if (config.year === 2026) {
          monthCols.push({ month: MONTHS_MAP[monthName], col });
        }
      }
    }
    console.log(`   Meses: ${monthCols.map(m => `col${m.col}=${m.month}`).join(", ")}`);

    let currentSector = config.sectorOrder[0];
    let sheetInserted = 0;

    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;
      const firstCell = String(row[0]).trim();
      if (config.sectorOrder.includes(firstCell)) { currentSector = firstCell; continue; }
      const categoryName = firstCell;
      if (!categoryName || categoryName.length < 3) continue;
      if (categoryName.toUpperCase().includes("TOTAL")) continue;

      let category = await prisma.category.findFirst({ where: { name: categoryName } });
      if (!category) category = await prisma.category.create({ data: { name: categoryName } });

      const sector = await prisma.sector.findFirst({ where: { name: currentSector, type: config.type, year: config.year } });
      if (!sector) continue;

      for (const { month, col } of monthCols) {
        const quantity = Number(row[col]) || 0;
        if (quantity > 0) {
          const existing = await prisma.occurrence.findFirst({
            where: { month, year: config.year, sectorId: sector.id, categoryId: category.id },
          });
          if (!existing) {
            await prisma.occurrence.create({
              data: { month, year: config.year, quantity, sectorId: sector.id, categoryId: category.id, userId: admin.id },
            });
            sheetInserted++;
            totalInserted++;
          }
        }
      }
    }
    console.log(`   ✅ ${sheetInserted} ocorrências inseridas`);
  }

  console.log(`\n🎉 Migração concluída! Total: ${totalInserted} ocorrências`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
