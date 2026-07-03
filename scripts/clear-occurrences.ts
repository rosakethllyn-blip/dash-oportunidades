import { PrismaClient } from "@prisma/client";
const connectionString = "postgresql://postgres.hhnbqcxcdpszrtxlaoif:Hmsvp@2026Nep@aws-1-us-east-2.pooler.supabase.com:5432/postgres";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);
async function main() {
  const deleted = await prisma.occurrence.deleteMany({});
  console.log(`Ocorrências removidas: ${deleted.count}`);
  const cat = await prisma.category.deleteMany({ where: { NOT: {} } });
  console.log(`Categorias removidas: ${cat.count}`);
}
main().finally(() => { prisma.$disconnect(); pool.end(); });
