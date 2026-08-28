import { api } from "@/lib/api-client";

export const assistantApi = {
  ask: (question: string) => api.post<{ answer: string }>("/assistant/ask", { question }),
  getKeyStatus: () => api.get<{ configured: boolean }>("/meta/anthropic-key"),
  setKey: (key: string) =>
    api.put<{ configured: boolean }>("/meta/anthropic-key", { key }),
};
