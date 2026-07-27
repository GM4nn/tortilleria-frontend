import { api } from "@/lib/api-client";
import type { Dealer, DealerInput } from "./types";

export const dealersApi = {
  list: () => api.get<Dealer[]>("/dealers"),
  create: (data: DealerInput) => api.post<Dealer>("/dealers", data),
  update: (id: number, data: DealerInput) => api.put<Dealer>(`/dealers/${id}`, data),
  remove: (id: number) => api.del<void>(`/dealers/${id}`),
};
