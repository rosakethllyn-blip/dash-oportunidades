import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
const cs = "postgresql://postgres.hhnbqcxcdpszrtxlaoif:Hmsvp@2026Nep@aws-1-us-east-2.pooler.supabase.com:5432/postgres";
const pool = new Pool({ connectionString: cs });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any);
(async () => {
  const total = await prisma.occurrence.count();
  const por2026 = await prisma.occurrence.count({ where: { year: 2026 } });
  const infantil2026 = await prisma.occurrence.findMany({
    where: { year: 2026, sector: { type: "INFANTIL" } },
    take: 5,
    include: { sector: true, category: true }
  });
  console.log(`Total: ${total}`);
  console.log(`2026: ${por2026}`);
  console.log(`\nAmostra INFANTIL 2026 (${infantil2026.length}):`);
  infantil2026.forEach(o => console.log(`  - ${o.sector.name} / ${o.category.name.slice(0,40)} = ${o.quantity} (mês ${o.month})`));
  await prisma.$disconnect(); await pool.end();
})();
