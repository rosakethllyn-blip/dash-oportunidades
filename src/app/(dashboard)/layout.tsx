import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Se não estiver logado, redirecionar para login
  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
