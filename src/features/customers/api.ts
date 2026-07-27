import { api } from "@/lib/api-client";
import type { Customer, CustomerInput } from "./types";

export interface CustomerPrice {
  product_id: number;
  custom_price: number;
}

export const customersApi = {
  list: () => api.get<Customer[]>("/customers"),
  create: (data: CustomerInput) => api.post<Customer>("/customers", data),
  update: (id: number, data: CustomerInput) =>
    api.put<Customer>(`/customers/${id}`, data),
  remove: (id: number) => api.del<void>(`/customers/${id}`),
  prices: (id: number) => api.get<CustomerPrice[]>(`/customers/${id}/prices`),
  setPrice: (id: number, productId: number, price: number) =>
    api.put<CustomerPrice>(`/customers/${id}/prices`, { product_id: productId, price }),
};
