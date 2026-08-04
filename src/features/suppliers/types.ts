export interface Supplier {
  id: number;
  supplier_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  product_type: string | null;
  notes: string | null;
  is_default: boolean;
}

export interface SupplierInput {
  supplier_name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  product_type?: string | null;
  notes?: string | null;
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
