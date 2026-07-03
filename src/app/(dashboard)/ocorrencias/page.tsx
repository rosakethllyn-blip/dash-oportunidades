"use client";


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMonth } from "@/lib/utils";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import Link from "next/link";

interface Occurrence {
  id: string;
  month: number;
  year: number;
  quantity: number;
  notes: string | null;
  sector: { id: string; name: string; type: string };
  category: { id: string; name: string };
}

interface Sector {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
}

export default function OccurrencesPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Occurrence | null>(null);
  const [deleting, setDeleting] = useState<Occurrence | null>(null);

  const [filters, setFilters] = useState({
    year: "all",
    sectorId: "all",
    categoryId: "all",
  });

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.year !== "all") params.set("year", filters.year);
      if (filters.sectorId !== "all") params.set("sectorId", filters.sectorId);
      if (filters.categoryId !== "all") params.set("categoryId", filters.categoryId);

      const [occRes, secRes, catRes] = await Promise.all([
        fetch(`/api/occurrences?${params}`),
        fetch("/api/sectors"),
        fetch("/api/categories"),
      ]);

      const [occData, secData, catData] = await Promise.all([
        occRes.json(),
        secRes.json(),
        catRes.json(),
      ]);

      setOccurrences(occData);
      setSectors(secData);
      setCategories(catData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const res = await fetch(`/api/occurrences/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: formData.get("month"),
          year: formData.get("year"),
          quantity: formData.get("quantity"),
          notes: formData.get("notes"),
          sectorId: formData.get("sectorId"),
          categoryId: formData.get("categoryId"),
        }),
      });

      if (res.ok) {
        setEditing(null);
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao editar:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      const res = await fetch(`/api/occurrences/${deleting.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleting(null);
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Ocorrências</h1>
          <p className="text-muted-foreground">
            Gerencie todas as ocorrências registradas
          </p>
        </div>
        <Button asChild>
          <Link href="/ocorrencias/nova">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Ocorrência
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Ano</Label>
              <Select
                value={filters.year}
                onValueChange={(v) => setFilters({ ...filters, year: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
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
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {sectors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={filters.categoryId}
                onValueChange={(v) => setFilters({ ...filters, categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name.slice(0, 40)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({ year: "all", sectorId: "all", categoryId: "all" })
                }
              >
                <Search className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros ({occurrences.length})</CardTitle>
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
                  <th className="text-left py-3 px-2">Observações</th>
                  <th className="text-right py-3 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {occurrences.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma ocorrência encontrada
                    </td>
                  </tr>
                ) : (
                  occurrences.map((occ) => (
                    <tr key={occ.id} className="border-b hover:bg-gray-50">
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
                      <td className="py-3 px-2 max-w-xs truncate text-muted-foreground">
                        {occ.notes || "-"}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(occ)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleting(occ)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ocorrência</DialogTitle>
            <DialogDescription>
              Atualize os dados da ocorrência
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select name="month" defaultValue={editing.month.toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label>Ano</Label>
                  <Select name="year" defaultValue={editing.year.toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select name="sectorId" defaultValue={editing.sector.id}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select name="categoryId" defaultValue={editing.category.id}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name.slice(0, 50)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue={editing.quantity}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input name="notes" defaultValue={editing.notes || ""} />
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Ocorrência</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta ocorrência? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
