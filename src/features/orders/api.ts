import { api } from "@/lib/api-client";
import type {
  CompleteOrderInput,
  Order,
  OrderCreate,
  OrderFilters,
  Paginated,
} from "./types";

function buildQuery(filters: OrderFilters, offset: number, limit: number): string {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);
  if (filters.status) params.set("status", filters.status);
  if (filters.paymentStatus) params.set("payment_status", filters.paymentStatus);
  if (filters.dealer) params.set("dealer", filters.dealer);
  if (filters.customerId != null) params.set("customer_id", String(filters.customerId));
  if (filters.hasRefunds != null) params.set("has_refunds", String(filters.hasRefunds));
  params.set("offset", String(offset));
  params.set("limit", String(limit));
  return `?${params.toString()}`;
}

export const ordersApi = {
  // El cliente trabaja en páginas; aquí se traduce a offset/limit para el API.
  list: (filters: OrderFilters = {}, page = 1, pageSize = 10) =>
    api.get<Paginated<Order>>(
      `/orders${buildQuery(filters, (page - 1) * pageSize, pageSize)}`
    ),
  get: (id: number) => api.get<Order>(`/orders/${id}`),
  create: (data: OrderCreate) => api.post<Order>("/orders", data),
  pay: (id: number, amount: number) =>
    api.post<Order>(`/orders/${id}/payment`, { amount }),
  complete: (id: number, data: CompleteOrderInput) =>
    api.post<Order>(`/orders/${id}/complete`, data),
  cancel: (id: number) => api.post<Order>(`/orders/${id}/cancel`),
};
