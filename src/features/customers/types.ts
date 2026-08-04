export interface Customer {
  id: number;
  customer_name: string;
  customer_direction: string | null;
  customer_category: string | null;
  customer_photo: string | null;
  customer_phone: string | null;
}

export interface CustomerInput {
  customer_name: string;
  customer_direction?: string | null;
  customer_category?: string | null;
  customer_photo?: string | null;
  customer_phone?: string | null;
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
