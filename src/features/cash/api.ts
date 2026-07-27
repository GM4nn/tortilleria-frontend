import { api } from "@/lib/api-client";
import type {
  CashCut,
  CashCutCreate,
  CashFilters,
  CashSummary,
  Paginated,
} from "./types";

function buildQuery(filters: CashFilters, offset: number, limit: number): string {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);
  params.set("offset", String(offset));
  params.set("limit", String(limit));
  return `?${params.toString()}`;
}

export const cashApi = {
  summary: () => api.get<CashSummary>("/cash/summary"),
  today: () => api.get<CashCut | null>("/cash/today"),
  list: (filters: CashFilters = {}, page = 1, pageSize = 15) =>
    api.get<Paginated<CashCut>>(`/cash${buildQuery(filters, (page - 1) * pageSize, pageSize)}`),
  create: (data: CashCutCreate) => api.post<CashCut>("/cash", data),
};
