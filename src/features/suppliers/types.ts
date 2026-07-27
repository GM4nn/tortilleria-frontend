export interface Supplier {
  id: number;
  supplier_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  product_type: string | null;
  notes: string | null;
  is_default: boolean;
}

export interface SupplierInput {
  supplier_name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  product_type?: string | null;
  notes?: string | null;
}
