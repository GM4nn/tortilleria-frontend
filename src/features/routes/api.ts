import { api } from "@/lib/api-client";
import type { Route, RouteInput } from "./types";

export const routesApi = {
  list: () => api.get<Route[]>("/routes"),
  create: (data: RouteInput) => api.post<Route>("/routes", data),
  update: (id: number, data: RouteInput) => api.put<Route>(`/routes/${id}`, data),
  remove: (id: number) => api.del<void>(`/routes/${id}`),
};
