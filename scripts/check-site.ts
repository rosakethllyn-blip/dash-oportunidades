// Verificar se API responde
const res = await fetch("https://dash-oportunidades-qsd8.vercel.app/api/stats?year=2026");
const data = await res.json();
console.log("Status:", res.status);
console.log("Total:", data.total);
console.log("Erro:", data.error || "nenhum");
