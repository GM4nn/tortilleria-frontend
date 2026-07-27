import { api } from "@/lib/api-client";
import type { MonthlyIncome, TodaySummary, TopCustomer, TopProduct } from "./types";

export const reportsApi = {
  today: () => api.get<TodaySummary>("/reports/today"),
  monthlyIncome: () => api.get<MonthlyIncome>("/reports/monthly-income"),
  topProducts: (limit = 5) => api.get<TopProduct[]>(`/reports/top-products?limit=${limit}`),
  topCustomers: (limit = 5) => api.get<TopCustomer[]>(`/reports/top-customers?limit=${limit}`),
};
