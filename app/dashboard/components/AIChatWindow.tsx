"use client";

import { useEffect, useRef, useState } from "react";
import AIMessage from "./AIMessage";
import AIThinking from "./AIThinking";
import AIEmptyState from "./AIEmptyState";
import { ArrowUp } from "lucide-react";
import { useDashboard } from "../DashboardContext";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface AIChatWindowProps {
  storeId?: string;
}

export default function AIChatWindow({ storeId }: AIChatWindowProps) {
  const { lang } = useDashboard();

  const dir = lang === "ar" ? "rtl" : "ltr";

  const t = {
    placeholder:
      lang === "ar"
        ? "اسأل ChatGPT عن متجرك..."
        : "Ask ChatGPT about your store...",

    error: lang === "ar" ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong",

    emptyError: lang === "ar" ? "خطأ في التحميل" : "Error loading data",
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (isMounted) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isMounted]);

  const handleInput = (value: string) => {
    setInput(value);

    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 180) + "px";
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          storeId,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Request failed");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.error;

      setError(errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-full flex-col bg-[#f7f7f8]" dir={dir}>
      {/* MAIN AREA */}
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-3xl px-4">
            <AIEmptyState />

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-[#10a37f]">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => handleInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.placeholder}
                    className="flex-1 resize-none bg-transparent text-sm outline-none max-h-40"
                    dir={dir}
                    rows={1}
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="rounded-full bg-[#0f0f0f] p-2 text-white text-sm disabled:opacity-40 hover:bg-[#0e8f6f] transition"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="py-6">
              {messages.map((msg) => (
                <AIMessage key={msg.id} role={msg.role} content={msg.content} />
              ))}

              {isLoading && <AIThinking />}
            </div>

            <div ref={messagesEndRef} />
          </div>

          <div className="bg-gradient-to-t from-[#f7f7f8] via-[#f7f7f8] p-4">
            <div className="mx-auto max-w-3xl">
              {error && (
                <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-[#10a37f]">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => handleInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  className="flex-1 resize-none bg-transparent text-sm outline-none max-h-40"
                  dir={dir}
                  rows={1}
                />

                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="rounded-full bg-[#0f0f0f] p-2 text-white text-sm disabled:opacity-40 hover:bg-[#0e8f6f] transition"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
