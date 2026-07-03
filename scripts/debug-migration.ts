import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as XLSX from "xlsx";

const connectionString = "postgresql://postgres.hhnbqcxcdpszrtxlaoif:Hmsvp@2026Nep@aws-1-us-east-2.pooler.supabase.com:5432/postgres";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);
const XLSX_PATH = "C:/Users/NEP/Downloads/Cópia de Oportunidades  convênios .xlsx";

async function main() {
  const workbook = XLSX.readFile(XLSX_PATH);
  const sheet = workbook.Sheets["ADULTO 2025"];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
  
  console.log("=== Primeiras 5 linhas da aba ADULTO 2025 ===");
  for (let i = 0; i < 5; i++) {
    console.log(`Linha ${i}:`, data[i]);
  }
}

main().finally(() => { prisma.$disconnect(); pool.end(); });
