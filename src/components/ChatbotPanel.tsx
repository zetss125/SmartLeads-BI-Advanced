"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, X, ExternalLink, CheckCircle2, RotateCcw } from "lucide-react";

interface ChatAction {
  type: "FILTER" | "UPDATE_STATUS" | "RESET_FILTERS" | "NONE";
  payload?: any;
}

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  isError?: boolean;
  actions?: ChatAction[];
}

export default function ChatbotPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your AI assistant. I can answer questions and execute commands like filtering leads, marking contacts, and more.",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const executeAction = useCallback(async (action: ChatAction) => {
    switch (action.type) {
      case "FILTER": {
        if (action.payload?.field && action.payload?.operator && action.payload?.value !== undefined) {
          const params = new URLSearchParams();
          params.set(action.payload.field, String(action.payload.value));
          const op = action.payload.operator;
          if (op === "gt") params.set("minScore", String(action.payload.value));
          else if (op === "lt") params.set("maxScore", String(action.payload.value));
          router.push(`/leads?${params.toString()}`);
        } else {
          router.push("/leads");
        }
        break;
      }
      case "UPDATE_STATUS": {
        if (action.payload?.ids && action.payload?.contacted !== undefined) {
          for (const id of action.payload.ids) {
            await fetch("/api/leads", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, contacted: !!action.payload.contacted }),
            });
          }
        }
        break;
      }
      case "RESET_FILTERS": {
        router.push("/leads");
        break;
      }
    }
  }, [router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isBot: false,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage.text,
          history: messages.slice(-6).map((m) => ({
            role: m.isBot ? "assistant" : "user",
            content: m.text,
          })),
        }),
      });
      const data = await response.json();

      const botMessage: Message = {
        id: Date.now(),
        text: data.message || "I couldn't process your request.",
        isBot: true,
        actions: data.actions?.filter((a: ChatAction) => a.type !== "NONE") || [],
      };
      setMessages((prev) => [...prev, botMessage]);

      if (data.actions) {
        for (const action of data.actions) {
          await executeAction(action);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, I couldn't process your request.",
          isBot: true,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden dark:bg-slate-800 dark:border-slate-700">
      <div className="bg-emerald-600 px-4 py-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold text-sm">AI Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-emerald-700 p-1 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.isBot
                  ? msg.isError
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
                    : "bg-white border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                  : "bg-emerald-600 text-white"
              }`}
            >
              <p>{msg.text}</p>
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {msg.actions.map((action, i) => (
                    <div key={i}>
                      {action.type === "FILTER" && (
                        <button
                          onClick={() => executeAction(action)}
                          className="flex items-center gap-1.5 text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1.5 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors w-full"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Apply filter and view results
                        </button>
                      )}
                      {action.type === "UPDATE_STATUS" && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Contacts updated: {action.payload?.ids?.length || 0} lead(s)
                        </div>
                      )}
                      {action.type === "RESET_FILTERS" && (
                        <button
                          onClick={() => executeAction(action)}
                          className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors w-full"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset filters
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="p-3 border-t border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:bg-slate-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
