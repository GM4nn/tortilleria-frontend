import { api } from "@/lib/api-client";
import type { ScheduledOrder, ScheduledOrderInput } from "./types";

export const schedulesApi = {
  list: () => api.get<ScheduledOrder[]>("/scheduled-orders"),
  create: (data: ScheduledOrderInput) =>
    api.post<ScheduledOrder>("/scheduled-orders", data),
  update: (id: number, data: ScheduledOrderInput) =>
    api.put<ScheduledOrder>(`/scheduled-orders/${id}`, data),
  remove: (id: number) => api.del<void>(`/scheduled-orders/${id}`),
  generateToday: () =>
    api.post<{ created: number; skipped: number; weekday: number }>(
      "/scheduled-orders/generate-today"
    ),
};
