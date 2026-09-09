export interface ScheduleItem {
  weekday: number; // 0=lunes ... 6=domingo
  product_id: number;
  quantity: number;
}

export interface ScheduledOrder {
  id: number;
  customer_id: number;
  customer_name: string;
  delivery_time: string | null;
  default_dealer: string | null;
  active: boolean;
  items: ScheduleItem[];
}

export interface ScheduledOrderInput {
  customer_id: number;
  delivery_time: string | null;
  default_dealer: string | null;
  active: boolean;
  items: ScheduleItem[];
}
