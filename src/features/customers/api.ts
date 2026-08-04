import { api } from "@/lib/api-client";
import type { Customer, CustomerInput, Paginated } from "./types";

export interface CustomerPrice {
  product_id: number;
  custom_price: number;
}

export const customersApi = {
  list: () => api.get<Customer[]>("/customers"),
  listPaginated: (offset = 0, limit = 10) =>
    api.get<Paginated<Customer>>(`/customers/paginated?offset=${offset}&limit=${limit}`),
  create: (data: CustomerInput) => api.post<Customer>("/customers", data),
  update: (id: number, data: CustomerInput) =>
    api.put<Customer>(`/customers/${id}`, data),
  remove: (id: number) => api.del<void>(`/customers/${id}`),
  prices: (id: number) => api.get<CustomerPrice[]>(`/customers/${id}/prices`),
  setPrice: (id: number, productId: number, price: number) =>
    api.put<CustomerPrice>(`/customers/${id}/prices`, { product_id: productId, price }),
};
