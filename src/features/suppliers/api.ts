import { api } from "@/lib/api-client";
import type { Paginated, Supplier, SupplierInput } from "./types";

export const suppliersApi = {
  list: () => api.get<Supplier[]>("/suppliers"),
  listPaginated: (offset = 0, limit = 10) =>
    api.get<Paginated<Supplier>>(`/suppliers/paginated?offset=${offset}&limit=${limit}`),
  create: (data: SupplierInput) => api.post<Supplier>("/suppliers", data),
  update: (id: number, data: SupplierInput) =>
    api.put<Supplier>(`/suppliers/${id}`, data),
  remove: (id: number) => api.del<void>(`/suppliers/${id}`),
};
