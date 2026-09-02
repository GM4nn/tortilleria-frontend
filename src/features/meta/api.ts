import { api } from "@/lib/api-client";

export interface Meta {
  customer_categories: string[];
  product_icons: string[];
}

export const metaApi = {
  get: () => api.get<Meta>("/meta"),
};
