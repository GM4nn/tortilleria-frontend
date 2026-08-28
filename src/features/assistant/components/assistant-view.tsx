"use client";

import { useState } from "react";
import { Send, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Markdown } from "@/components/ui/markdown";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import { useAskAssistant, useKeyStatus, useSetKey } from "../hooks";

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
  const keyStatus = useKeyStatus();
  const setKey = useSetKey();

  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [configOpen, setConfigOpen] = useState(false);
  const [keyInput, setKeyInput] = useState("");

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

  const saveKey = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    setKey.mutate(trimmed, {
      onSuccess: () => {
        setConfigOpen(false);
        setKeyInput("");
      },
    });
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Asistente IA"
        description="Pregunta sobre tu negocio en lenguaje natural"
        action={
          <Button
            variant="outline"
            size="icon"
            title="Configurar API key"
            onClick={() => setConfigOpen(true)}
          >
            <Settings />
          </Button>
        }
      />

      <Card className="flex min-h-0 flex-1 flex-col">
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
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "whitespace-pre-wrap bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.role === "assistant" ? (
                    <Markdown>{message.text}</Markdown>
                  ) : (
                    message.text
                  )}
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

      {/* Configuración de la API key de Anthropic */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configuración del asistente</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">API key de Anthropic</label>
            <Input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder={
                keyStatus.data?.configured ? "•••••••• (ya configurada)" : "sk-ant-..."
              }
              onKeyDown={(e) => e.key === "Enter" && saveKey()}
            />
            <p className="text-xs text-muted-foreground">
              {keyStatus.data?.configured
                ? "Ya hay una API key configurada. Escribe una nueva para reemplazarla."
                : "No hay API key configurada. El asistente no funciona sin ella."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveKey} disabled={!keyInput.trim() || setKey.isPending}>
              {setKey.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
