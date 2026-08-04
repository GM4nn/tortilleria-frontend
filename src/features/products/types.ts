export interface Product {
  id: number;
  icon: string;
  name: string;
  price: number;
  code?: string | null;
  is_default?: boolean;
}

export interface ProductInput {
  icon: string;
  name: string;
  price: number;
}
