import { api } from "@/lib/api-client";
import type { Product, ProductInput } from "./types";

export const productsApi = {
  list: () => api.get<Product[]>("/products"),
  create: (data: ProductInput) => api.post<Product>("/products", data),
  update: (id: number, data: ProductInput) =>
    api.put<Product>(`/products/${id}`, data),
  remove: (id: number) => api.del<void>(`/products/${id}`),
};
