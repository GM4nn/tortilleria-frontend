import { api } from "@/lib/api-client";
import type { Supplier, SupplierInput } from "./types";

export const suppliersApi = {
  list: () => api.get<Supplier[]>("/suppliers"),
  create: (data: SupplierInput) => api.post<Supplier>("/suppliers", data),
  update: (id: number, data: SupplierInput) =>
    api.put<Supplier>(`/suppliers/${id}`, data),
  remove: (id: number) => api.del<void>(`/suppliers/${id}`),
};
