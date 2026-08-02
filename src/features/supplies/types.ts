export interface Supply {
  id: number;
  supply_name: string;
  supplier_id: number;
  unit: string;
  is_default: boolean;
}

export interface SupplyInput {
  supply_name: string;
  supplier_id: number;
  unit: string;
}

export interface SupplyPurchase {
  id: number;
  supply_id: number;
  supplier_id: number;
  purchase_date: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  remaining: number;
  notes: string | null;
  created_at: string | null;
}

export interface SupplyPurchaseInput {
  supplier_id: number;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  remaining: number;
  purchase_date?: string | null;
  notes?: string | null;
}
