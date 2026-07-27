"use client";

import { useQuery } from "@tanstack/react-query";

import { reportsApi } from "./api";

export function useTodaySummary() {
  return useQuery({ queryKey: ["reports", "today"], queryFn: reportsApi.today });
}

export function useMonthlyIncome() {
  return useQuery({ queryKey: ["reports", "monthly"], queryFn: reportsApi.monthlyIncome });
}

export function useTopProducts(limit = 5) {
  return useQuery({
    queryKey: ["reports", "top-products", limit],
    queryFn: () => reportsApi.topProducts(limit),
  });
}

export function useTopCustomers(limit = 5) {
  return useQuery({
    queryKey: ["reports", "top-customers", limit],
    queryFn: () => reportsApi.topCustomers(limit),
  });
}
