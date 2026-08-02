"use client";

import { useQuery } from "@tanstack/react-query";

import { metaApi } from "./api";

export const CUSTOMER_CATEGORY_MOSTRADOR = "Mostrador";

export function useMeta() {
  return useQuery({
    queryKey: ["meta"],
    queryFn: metaApi.get,
    staleTime: Infinity, // los enums casi nunca cambian
  });
}
