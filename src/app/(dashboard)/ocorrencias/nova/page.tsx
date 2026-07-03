"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useSession } from "next-auth/react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface Sector {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
}

export default function NewOccurrencePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [secRes, catRes] = await Promise.all([
          fetch("/api/sectors"),
          fetch("/api/categories"),
        ]);
        const [secData, catData] = await Promise.all([secRes.json(), catRes.json()]);
        setSectors(secData);
        setCategories(catData);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/occurrences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: parseInt(formData.get("month") as string),
          year: parseInt(formData.get("year") as string),
          sectorId: formData.get("sectorId"),
          categoryId: formData.get("categoryId"),
          quantity: parseInt(formData.get("quantity") as string),
          notes: formData.get("notes") || null,
        }),
      });

      if (res.ok) {
        router.push("/ocorrencias");
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao salvar");
      }
    } catch (err) {
      setError("Erro ao salvar ocorrência");
    } finally {
      setSubmitting(false);
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ocorrencias">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Ocorrência</h1>
          <p className="text-muted-foreground">
            Cadastre uma nova ocorrência no sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Ocorrência</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Mês *</Label>
                <Select name="month" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
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
                <Label htmlFor="year">Ano *</Label>
                <Select name="year" defaultValue="2025" required>
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
              <Label htmlFor="sectorId">Setor *</Label>
              <Select name="sectorId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADULTO" disabled className="font-bold">
                    ── ADULTO ──
                  </SelectItem>
                  {sectors
                    .filter((s) => s.type === "ADULTO")
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  <SelectItem value="INFANTIL" disabled className="font-bold">
                    ── INFANTIL ──
                  </SelectItem>
                  {sectors
                    .filter((s) => s.type === "INFANTIL")
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria *</Label>
              <Select name="categoryId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name.slice(0, 60)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="Número de ocorrências"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Observações adicionais (opcional)"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Ocorrência
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/ocorrencias">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
