export interface Customer {
  id: number;
  customer_name: string;
  customer_direction: string | null;
  customer_category: string | null;
  customer_photo: string | null;
  customer_phone: string | null;
}

export interface CustomerInput {
  customer_name: string;
  customer_direction?: string | null;
  customer_category?: string | null;
  customer_photo?: string | null;
  customer_phone?: string | null;
}
