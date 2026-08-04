import { api } from "@/lib/api-client";
import type {
  Paginated,
  PaginatedPeriods,
  Supply,
  SupplyInput,
  SupplyPurchase,
  SupplyPurchaseInput,
} from "./types";

export const suppliesApi = {
  list: () => api.get<Supply[]>("/supplies"),
  get: (id: number) => api.get<Supply>(`/supplies/${id}`),
  create: (data: SupplyInput) => api.post<Supply>("/supplies", data),
  update: (id: number, data: SupplyInput) => api.put<Supply>(`/supplies/${id}`, data),
  remove: (id: number) => api.del<void>(`/supplies/${id}`),
  purchases: (id: number, offset = 0, limit = 6) =>
    api.get<Paginated<SupplyPurchase>>(
      `/supplies/${id}/purchases?offset=${offset}&limit=${limit}`
    ),
  periods: (id: number, offset = 0, limit = 6) =>
    api.get<PaginatedPeriods>(`/supplies/${id}/periods?offset=${offset}&limit=${limit}`),
  purchase: (id: number, purchaseId: number) =>
    api.get<SupplyPurchase>(`/supplies/${id}/purchases/${purchaseId}`),
  referencePurchase: (id: number, exclude?: number) =>
    api.get<SupplyPurchase | null>(
      `/supplies/${id}/reference-purchase${exclude != null ? `?exclude=${exclude}` : ""}`
    ),
  addPurchase: (id: number, data: SupplyPurchaseInput) =>
    api.post<SupplyPurchase>(`/supplies/${id}/purchases`, data),
  updatePurchase: (id: number, purchaseId: number, data: SupplyPurchaseInput) =>
    api.put<SupplyPurchase>(`/supplies/${id}/purchases/${purchaseId}`, data),
};
