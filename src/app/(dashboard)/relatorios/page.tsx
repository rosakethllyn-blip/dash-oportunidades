"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMonth } from "@/lib/utils";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";

interface Occurrence {
  month: number;
  year: number;
  quantity: number;
  notes: string | null;
  sector: { name: string; type: string };
  category: { name: string };
}

interface Sector {
  id: string;
  name: string;
  type: string;
}

export default function ReportsPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: "all",
    month: "all",
    sectorType: "all",
    sectorId: "all",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.year !== "all") params.set("year", filters.year);

        const [occRes, secRes] = await Promise.all([
          fetch(`/api/occurrences?${params}`),
          fetch("/api/sectors"),
        ]);

        const [occData, secData] = await Promise.all([occRes.json(), secRes.json()]);

        setOccurrences(occData);
        setSectors(secData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.year]);

  const filteredOccurrences = occurrences.filter((occ) => {
    if (filters.month !== "all" && occ.month !== parseInt(filters.month)) return false;
    if (filters.sectorType !== "all" && occ.sector.type !== filters.sectorType) return false;
    if (filters.sectorId !== "all" && occ.sector.name !== filters.sectorId) return false;
    return true;
  });

  const exportToExcel = () => {
    const data = filteredOccurrences.map((occ) => ({
      Mês: `${formatMonth(occ.month)}/${occ.year}`,
      Ano: occ.year,
      Setor: occ.sector.name,
      Tipo: occ.sector.type,
      Categoria: occ.category.name,
      Quantidade: occ.quantity,
      Observações: occ.notes || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ocorrências");

    const colWidths = [
      { wch: 15 },
      { wch: 8 },
      { wch: 20 },
      { wch: 10 },
      { wch: 50 },
      { wch: 12 },
      { wch: 30 },
    ];
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `ocorrencias_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const totalQuantity = filteredOccurrences.reduce((sum, occ) => sum + occ.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Gere relatórios e exporte dados em diferentes formatos
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Ano</Label>
              <Select
                value={filters.year}
                onValueChange={(v) => setFilters({ ...filters, year: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mês</Label>
              <Select
                value={filters.month}
                onValueChange={(v) => setFilters({ ...filters, month: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {[
                    "Janeiro", "Fevereiro", "Março", "Abril",
                    "Maio", "Junho", "Julho", "Agosto",
                    "Setembro", "Outubro", "Novembro", "Dezembro",
                  ].map((m, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Setor</Label>
              <Select
                value={filters.sectorType}
                onValueChange={(v) => setFilters({ ...filters, sectorType: v, sectorId: "all" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ADULTO">Adulto</SelectItem>
                  <SelectItem value="INFANTIL">Infantil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Setor</Label>
              <Select
                value={filters.sectorId}
                onValueChange={(v) => setFilters({ ...filters, sectorId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {sectors
                    .filter((s) => filters.sectorType === "all" || s.type === filters.sectorType)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredOccurrences.length}</div>
            <p className="text-sm text-muted-foreground">Total de registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-sm text-muted-foreground">Total de ocorrências</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{sectors.length}</div>
            <p className="text-sm text-muted-foreground">Setores</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={exportToExcel} className="flex-1 sm:flex-none">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar para Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prévia dos Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Mês</th>
                  <th className="text-left py-3 px-2">Setor</th>
                  <th className="text-left py-3 px-2">Categoria</th>
                  <th className="text-right py-3 px-2">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {filteredOccurrences.slice(0, 50).map((occ, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3 px-2">
                      {formatMonth(occ.month)}/{occ.year}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          occ.sector.type === "ADULTO"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {occ.sector.name}
                      </span>
                    </td>
                    <td className="py-3 px-2 max-w-xs truncate">
                      {occ.category.name}
                    </td>
                    <td className="py-3 px-2 text-right font-bold">
                      {occ.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOccurrences.length > 50 && (
              <p className="text-center py-4 text-muted-foreground">
                Mostrando 50 de {filteredOccurrences.length} registros
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
