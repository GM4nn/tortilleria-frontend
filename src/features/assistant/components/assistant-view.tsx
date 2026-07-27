"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import { useAskAssistant } from "../hooks";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "¿Cuántos ingresos generé este mes?",
  "¿Cuáles son los productos más vendidos?",
  "¿Qué repartidor entregó más pedidos?",
];

export function AssistantView() {
  const ask = useAskAssistant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || ask.isPending) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setQuestion("");
    ask.mutate(trimmed, {
      onSuccess: (data) =>
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]),
    });
  };

  return (
    <>
      <PageHeader
        title="Asistente IA"
        description="Pregunta sobre tu negocio en lenguaje natural"
      />

      <Card className="flex h-[calc(100vh-11rem)] flex-col">
        <CardContent className="flex-1 space-y-3 overflow-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">Prueba preguntando:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => send(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))
          )}
          {ask.isPending ? (
            <div className="flex justify-start">
              <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                Pensando...
              </div>
            </div>
          ) : null}
        </CardContent>

        <div className="flex gap-2 border-t p-3">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="min-h-0 resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(question);
              }
            }}
          />
          <Button
            className="h-auto"
            onClick={() => send(question)}
            disabled={ask.isPending}
          >
            <Send />
          </Button>
        </div>
      </Card>
    </>
  );
}
