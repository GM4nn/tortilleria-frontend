import { api } from "@/lib/api-client";
import type { Supply, SupplyInput, SupplyPurchase, SupplyPurchaseInput } from "./types";

export const suppliesApi = {
  list: () => api.get<Supply[]>("/supplies"),
  get: (id: number) => api.get<Supply>(`/supplies/${id}`),
  create: (data: SupplyInput) => api.post<Supply>("/supplies", data),
  update: (id: number, data: SupplyInput) => api.put<Supply>(`/supplies/${id}`, data),
  remove: (id: number) => api.del<void>(`/supplies/${id}`),
  purchases: (id: number) => api.get<SupplyPurchase[]>(`/supplies/${id}/purchases`),
  addPurchase: (id: number, data: SupplyPurchaseInput) =>
    api.post<SupplyPurchase>(`/supplies/${id}/purchases`, data),
};
