export interface OrderDetail {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderRefund {
  product_id: number;
  product_name: string;
  quantity: number;
  comments: string | null;
  created_at: string | null;
}

export interface Order {
  id: number;
  date: string | null;
  total: number;
  customer_id: number;
  status: string;
  completed_at: string | null;
  notes: string | null;
  amount_paid: number;
  payment_status: string;
  default_dealer: string | null;
  details: OrderDetail[];
  refunds?: OrderRefund[];
}

export interface OrderItemInput {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface OrderCreate {
  customer_id: number;
  notes?: string | null;
  amount_paid?: number;
  default_dealer?: string | null;
  items: OrderItemInput[];
}

export interface RefundItemInput {
  product_id: number;
  quantity: number;
  comments?: string | null;
}

export interface CompleteOrderInput {
  refund_items: RefundItemInput[];
  final_payment: number;
}

export interface OrderFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  paymentStatus?: string;
  dealer?: string;
  customerId?: number;
  hasRefunds?: boolean;
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
