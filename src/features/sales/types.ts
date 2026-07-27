export interface SaleDetail {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  date: string | null;
  total: number;
  customer_id: number;
  details: SaleDetail[];
}

export interface SaleItemInput {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface SaleCreate {
  customer_id: number;
  items: SaleItemInput[];
}

export interface SaleFilters {
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
