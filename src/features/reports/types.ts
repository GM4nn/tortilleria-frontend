export interface TodaySummary {
  sales_count: number;
  sales_total: number;
  orders_completed_count: number;
  orders_completed_total: number;
  orders_pending_count: number;
  income_total: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
}

export interface TopCustomer {
  customer_name: string;
  total: number;
}

export interface MonthlyIncome {
  month: string;
  sales_total: number;
  orders_total: number;
  income_total: number;
}
