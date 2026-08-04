import { api } from "@/lib/api-client";
import type {
  FinanceReport,
  LossesTotal,
  MonthlyIncome,
  OrdersBreakdown,
  TodaySummary,
} from "./types";

export const reportsApi = {
  today: () => api.get<TodaySummary>("/reports/today"),
  monthlyIncome: () => api.get<MonthlyIncome>("/reports/monthly-income"),
  lossesTotal: () => api.get<LossesTotal>("/reports/losses-total"),
  ordersBreakdown: () => api.get<OrdersBreakdown>("/reports/orders-breakdown"),
  finance: () => api.get<FinanceReport>("/reports/finance"),
};
