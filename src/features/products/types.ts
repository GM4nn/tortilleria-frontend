export interface Product {
  id: number;
  icon: string;
  name: string;
  price: number;
  code?: string | null;
  is_default?: boolean;
  display_order?: number;
  order_price?: number | null;
}

export interface ProductInput {
  icon: string;
  name: string;
  price: number;
}
