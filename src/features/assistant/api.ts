import { api } from "@/lib/api-client";

export const assistantApi = {
  ask: (question: string) => api.post<{ answer: string }>("/assistant/ask", { question }),
};
