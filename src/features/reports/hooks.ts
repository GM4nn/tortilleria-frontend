"use client";

import { useQuery } from "@tanstack/react-query";

import { reportsApi } from "./api";

export function useTodaySummary() {
  return useQuery({ queryKey: ["reports", "today"], queryFn: reportsApi.today });
}

export function useMonthlyIncome() {
  return useQuery({ queryKey: ["reports", "monthly"], queryFn: reportsApi.monthlyIncome });
}

export function useLossesTotal() {
  return useQuery({ queryKey: ["reports", "losses-total"], queryFn: reportsApi.lossesTotal });
}

export function useOrdersBreakdown() {
  return useQuery({
    queryKey: ["reports", "orders-breakdown"],
    queryFn: reportsApi.ordersBreakdown,
  });
}

export function useFinance() {
  return useQuery({ queryKey: ["reports", "finance"], queryFn: reportsApi.finance });
}
