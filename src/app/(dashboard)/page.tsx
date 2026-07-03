"use client";


import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { formatMonth } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

const COLORS = ["#1b2b4b", "#145799", "#408dcc", "#223978", "#8B5CF6", "#EC4899"];

interface Stats {
  total: number;
  thisMonth: number;
  lastMonth: number;
  byMonth: { month: number; year: number; total: number }[];
  byCategory: { categoryId: string; name: string; total: number }[];
  bySector: { sectorId: string; name: string; type: string; total: number }[];
}

interface Sector {
  id: string;
  name: string;
  type: string;
  year?: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  // Padrão: ano vigente (2026)
  const currentYear = new Date().getFullYear();
  const defaultYear = currentYear >= 2026 ? "2026" : String(currentYear);

  const [yearFilter, setYearFilter] = useState<string>(defaultYear);
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await fetch("/api/sectors");
        const data = await res.json();
        setSectors(data);
      } catch (err) {
        console.error("Erro setores:", err);
      }
    };
    fetchSectors();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (yearFilter !== "all") params.set("year", yearFilter);
        if (monthFilter !== "all") params.set("month", monthFilter);
        if (sectorFilter !== "all") params.set("sectorId", sectorFilter);

        const res = await fetch(`/api/stats?${params}`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [yearFilter, monthFilter, sectorFilter]);

  const evolution = stats?.lastMonth && stats.lastMonth > 0
    ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100
    : 0;

  const monthData = stats?.byMonth
    ?.map((m) => ({
      name: `${formatMonth(m.month)}/${m.year.toString().slice(-2)}`,
      total: m.total,
    }))
    .reverse()
    .slice(-12) || [];

  const categoryData = stats?.byCategory
    ?.filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((c) => ({ name: c.name.slice(0, 30), value: c.total })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das ocorrências em convênios
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-[#e9effa] p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1b2b4b]">Ano</label>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="z-10">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-50">
                <SelectItem value="all">Todos os anos</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1b2b4b]">Mês</label>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="z-10">
                <SelectValue placeholder="Todos os meses" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-50">
                <SelectItem value="all">Todos os meses</SelectItem>
                <SelectItem value="1">Janeiro</SelectItem>
                <SelectItem value="2">Fevereiro</SelectItem>
                <SelectItem value="3">Março</SelectItem>
                <SelectItem value="4">Abril</SelectItem>
                <SelectItem value="5">Maio</SelectItem>
                <SelectItem value="6">Junho</SelectItem>
                <SelectItem value="7">Julho</SelectItem>
                <SelectItem value="8">Agosto</SelectItem>
                <SelectItem value="9">Setembro</SelectItem>
                <SelectItem value="10">Outubro</SelectItem>
                <SelectItem value="11">Novembro</SelectItem>
                <SelectItem value="12">Dezembro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1b2b4b]">Setor</label>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="z-10">
                <SelectValue placeholder="Todos os setores" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-50">
                <SelectItem value="all">Todos os setores</SelectItem>
                <SelectItem value="__ADULTO__" disabled className="font-bold text-[#1b2b4b]">
                  ── ADULTO ──
                </SelectItem>
                {sectors.filter((s) => s.type === "ADULTO" && s.year === parseInt(yearFilter || defaultYear)).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
                <SelectItem value="__INFANTIL__" disabled className="font-bold text-[#1b2b4b]">
                  ── INFANTIL ──
                </SelectItem>
                {sectors.filter((s) => s.type === "INFANTIL" && s.year === parseInt(yearFilter || defaultYear)).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ocorrências</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1b2b4b]">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {yearFilter === "all" ? "Todos os anos" : `Ano ${yearFilter}`}
              {monthFilter !== "all" && ` • ${formatMonth(parseInt(monthFilter))}`}
              {sectorFilter !== "all" && ` • 1 setor`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período Selecionado</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#145799]">{stats?.thisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              {monthFilter !== "all" ? formatMonth(parseInt(monthFilter)) : "Último mês"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evolução</CardTitle>
            {evolution >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${evolution >= 0 ? "text-red-500" : "text-green-500"}`}>
              {evolution >= 0 ? "+" : ""}{evolution.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs. período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Ocorrências por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {monthData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado no período selecionado
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} />
                    <YAxis fontSize={12} tickLine={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#145799"
                      strokeWidth={2}
                      dot={{ fill: "#1b2b4b" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {categoryData.slice(0, 6).map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats?.bySector && stats.bySector.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.bySector.map((s) => ({
                      name: s.name.slice(0, 15),
                      total: s.total,
                      type: s.type,
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis dataKey="name" type="category" fontSize={10} width={100} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#145799" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Ocorrências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.byCategory
              ?.filter((c) => c.total > 0)
              .sort((a, b) => b.total - a.total)
              .slice(0, 10)
              .map((category) => (
                <div key={category.categoryId} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{category.name}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            ((category.total || 0) / (stats?.total || 1)) * 100
                          )}%`,
                          backgroundColor: "#145799",
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold w-10 text-right">
                      {category.total}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}