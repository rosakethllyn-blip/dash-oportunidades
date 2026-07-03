"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ocorrencias", label: "Ocorrências", icon: FileText },
  { href: "/ocorrencias/nova", label: "Nova Ocorrência", icon: PlusCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white border-[#e9effa]"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "linear-gradient(180deg, #1b2b4b 0%, #145799 100%)" }}
      >
        <div className="flex flex-col h-full text-white">
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-center">
              <img
                src="/logo-hmsvp-branco.svg"
                alt="HMSVP"
                className="h-14 w-auto"
              />
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isActive
                      ? "bg-white text-[#1b2b4b] font-semibold shadow-md"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="mb-4 px-4">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || session?.user?.email}
              </p>
              <p className="text-xs text-white/70">
                {session?.user?.role === "ADMIN" ? "Administrador" : "Operador"}
              </p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}