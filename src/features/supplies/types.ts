export interface Supply {
  id: number;
  supply_name: string;
  supplier_id: number | null;
  unit: string;
  is_default: boolean;
}

export interface SupplyInput {
  supply_name: string;
  supplier_id: number | null;
  unit: string;
}

export interface SupplyPurchase {
  id: number;
  supply_id: number;
  supplier_id: number;
  purchase_date: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  remaining: number;
  notes: string | null;
  created_at: string | null;
}

export interface SupplyPurchaseInput {
  supplier_id: number;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  remaining: number;
  purchase_date?: string | null;
  notes?: string | null;
}

export interface SupplyPeriod {
  from_date: string | null;
  to_date: string | null;
  compra: number;
  sobrante: number;
  disponible: number;
  consumido: number;
  restante: number;
  pct: number;
}

export interface Pagination {
  total_data: number;
  total_pages: number;
  current_page: number;
  next_page: number;
  prev_page: number;
  last_page: number;
  first_page: number;
}

export interface Paginated<T> {
  pagination: Pagination;
  data: T[];
}

export interface PaginatedPeriods extends Paginated<SupplyPeriod> {
  current: SupplyPeriod | null;
  inventory: number;
}
