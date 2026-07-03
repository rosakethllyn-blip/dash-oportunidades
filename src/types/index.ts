export type Role = "ADMIN" | "OPERATOR";
export type UnitType = "ADULTO" | "INFANTIL";

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
}

export interface Sector {
  id: string;
  name: string;
  type: UnitType;
  year: number;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface Occurrence {
  id: string;
  month: number;
  year: number;
  quantity: number;
  notes: string | null;
  userId: string;
  sectorId: string;
  categoryId: string;
  sector?: Sector;
  category?: Category;
}

export interface DashboardStats {
  total: number;
  thisMonth: number;
  lastMonth: number;
  byMonth: { month: number; year: number; total: number }[];
  byCategory: { categoryId: string; name: string; total: number }[];
  bySector: { sectorId: string; name: string; type: UnitType; total: number }[];
}
