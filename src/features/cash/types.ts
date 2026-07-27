export interface CashSummary {
  sales_count: number;
  sales_total: number;
  orders_count: number;
  orders_total: number;
  expected_total: number;
}

export interface CashCut {
  id: number;
  opened_at: string | null;
  closed_at: string | null;
  sales_count: number;
  orders_count: number;
  sales_total: number;
  orders_total: number;
  expected_total: number;
  declared_cash: number;
  declared_card: number;
  declared_transfer: number;
  declared_total: number;
  difference: number;
  notes: string | null;
}

export interface CashCutCreate {
  opened_at: string;
  sales_count: number;
  orders_count: number;
  sales_total: number;
  orders_total: number;
  expected_total: number;
  declared_cash: number;
  declared_card: number;
  declared_transfer: number;
  declared_total: number;
  difference: number;
  notes?: string | null;
}

export interface CashFilters {
  dateFrom?: string;
  dateTo?: string;
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
