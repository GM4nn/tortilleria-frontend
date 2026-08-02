import { api } from "@/lib/api-client";

export interface Meta {
  customer_categories: string[];
  supply_units: string[];
  supplier_product_types: string[];
  product_icons: string[];
}

export const metaApi = {
  get: () => api.get<Meta>("/meta"),
};
