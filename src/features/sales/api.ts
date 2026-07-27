import { api } from "@/lib/api-client";
import type { Paginated, Sale, SaleCreate, SaleFilters } from "./types";

function buildQuery(filters: SaleFilters, offset: number, limit: number): string {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);
  params.set("offset", String(offset));
  params.set("limit", String(limit));
  return `?${params.toString()}`;
}

export const salesApi = {
  list: (filters: SaleFilters = {}, page = 1, pageSize = 15) =>
    api.get<Paginated<Sale>>(`/sales${buildQuery(filters, (page - 1) * pageSize, pageSize)}`),
  create: (data: SaleCreate) => api.post<Sale>("/sales", data),
  today: () => api.get<{ count: number; total: number }>("/sales/today"),
};
