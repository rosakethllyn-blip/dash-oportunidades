import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMonth(month: number): string {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[month - 1] || "";
}

export function getMonthNumber(monthName: string): number {
  const months: Record<string, number> = {
    janeiro: 1, fevereiro: 2, março: 3, abril: 4,
    maio: 5, junho: 6, julho: 7, agosto: 8,
    setembro: 9, outubro: 10, novembro: 11, dezembro: 12
  };
  return months[monthName.toLowerCase()] || 0;
}
