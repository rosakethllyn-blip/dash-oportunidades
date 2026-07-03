"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Loader2 } from "lucide-react";

type Tab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email ou senha inválidos");
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Erro ao fazer login");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
        setIsLoading(false);
        return;
      }

      setSuccess("Conta criada com sucesso! Fazendo login...");

      // Auto login após criar conta
      setTimeout(async () => {
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        router.push("/");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError("Erro ao criar conta");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hmsvp-gradient">
      <Card className="w-full max-w-md hmsvp-card">
        <CardHeader className="space-y-4 text-center pb-2">
          {/* Logo HMSVP completa */}
          <div className="flex justify-center">
            <img
              src="/logo-hmsvp-completo.svg"
              alt="Hospital Maternidade São Vicente de Paulo"
              className="h-24 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#1b2b4b]">
              Oportunidades
            </CardTitle>
            <CardDescription className="text-[#223978] mt-1">
              Sistema de Monitoramento de Ocorrências em Convênios
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Tabs */}
          <div className="flex mb-6 bg-[#e9effa] rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                activeTab === "login"
                  ? "bg-white text-[#1b2b4b] shadow-sm"
                  : "text-[#223978] hover:text-[#1b2b4b]"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                activeTab === "register"
                  ? "bg-white text-[#1b2b4b] shadow-sm"
                  : "text-[#223978] hover:text-[#1b2b4b]"
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg mb-4">
              {success}
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#1b2b4b]">Email Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#145799]" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="pl-10 border-[#e9effa] focus:border-[#145799] focus:ring-[#145799]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#1b2b4b]">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#145799]" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••"
                    required
                    className="pl-10 border-[#e9effa] focus:border-[#145799] focus:ring-[#145799]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full hmsvp-gradient hover:opacity-90 text-white font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name" className="text-[#1b2b4b]">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-[#145799]" />
                  <Input
                    id="reg-name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    required
                    minLength={3}
                    className="pl-10 border-[#e9effa] focus:border-[#145799] focus:ring-[#145799]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-[#1b2b4b]">Email Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#145799]" />
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="pl-10 border-[#e9effa] focus:border-[#145799] focus:ring-[#145799]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-[#1b2b4b]">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#145799]" />
                  <Input
                    id="reg-password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="pl-10 border-[#e9effa] focus:border-[#145799] focus:ring-[#145799]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm" className="text-[#1b2b4b]">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#145799]" />
                  <Input
                    id="reg-confirm"
                    name="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    required
                    minLength={6}
                    className="pl-10 border-[#e9effa] focus:border-[#145799] focus:ring-[#145799]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full hmsvp-gradient hover:opacity-90 text-white font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#e9effa] text-center text-xs text-[#223978]">
            Hospital Maternidade São Vicente de Paulo
          </div>
        </CardContent>
      </Card>
    </div>
  );
}