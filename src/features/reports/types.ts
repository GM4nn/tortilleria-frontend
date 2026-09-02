export interface TodaySummary {
  sales_count: number;
  sales_total: number;
  orders_completed_count: number;
  orders_completed_total: number;
  orders_pending_count: number;
  income_total: number;
}

export interface LossesTotal {
  name: string | null;
  icon: string | null;
  price: number;
  today: number;
  month: number;
  total: number;
}

export interface TopCustomer {
  customer_name: string;
  total: number;
}

export interface MonthlyIncome {
  month: string;
  sales_total: number;
  orders_total: number;
  orders_count: number;
  income_total: number;
}

export interface PeriodCount {
  today: number;
  month: number;
}

export interface OrdersBreakdown {
  by_status: {
    pendiente: PeriodCount;
    completado: PeriodCount;
    cancelado: PeriodCount;
  };
  by_payment: {
    unpaid: PeriodCount;
    partial: PeriodCount;
    paid: PeriodCount;
  };
}
