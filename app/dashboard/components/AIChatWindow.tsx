"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import AIMessage from "./AIMessage";
import AIThinking from "./AIThinking";
import AIEmptyState from "./AIEmptyState";
import { ArrowUp, Square } from "lucide-react";
import { useDashboard } from "../DashboardContext";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface AIChatWindowProps {
  storeId?: string;
}

const STORAGE_KEY = (storeId?: string) =>
  `mahally_chat_${storeId ?? "default"}`;

export default function AIChatWindow({ storeId }: AIChatWindowProps) {
  const { lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const t = {
    placeholder:
      lang === "ar"
        ? "اسأل مساعد محلي عن متجرك..."
        : "Ask Mahalli about your store...",
    error: lang === "ar" ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong",
    stop: lang === "ar" ? "إيقاف" : "Stop",
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY(storeId));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [storeId]);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY(storeId), JSON.stringify(messages));
    } catch {
      // ignore quota errors
    }
  }, [messages, storeId, isMounted]);

  // Smart auto-scroll: only scroll if user is near bottom
  const scrollToBottom = useCallback(
    (force = false) => {
      if (force || isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [isAtBottom],
  );

  useEffect(() => {
    if (isMounted) scrollToBottom();
  }, [messages, isLoading, isMounted, scrollToBottom]);

  // Track scroll position to determine isAtBottom
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distFromBottom < 80);
  }, []);

  const handleInput = (value: string) => {
    setInput(value);
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 180) + "px";
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
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
    setIsAtBottom(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: userMessage.content,
          storeId,
          conversationHistory: messages
            .filter((m) => !m.content.startsWith("⚠️"))
            .slice(-6)
            .map((m) => ({
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
          content: data.reply,
        },
      ]);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const errorMessage = err instanceof Error ? err.message : t.error;
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `⚠️ ${errorMessage}`,
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

  // CHANGED: Converted from a Component to a function returning JSX
  const renderInputBar = () => (
    <div className="relative flex items-end gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-gray-400 transition-colors">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t.placeholder}
        maxLength={500}
        className="flex-1 resize-none bg-transparent text-sm outline-none max-h-44 leading-relaxed text-gray-800 placeholder:text-gray-400"
        dir={dir}
        rows={1}
      />
      {isLoading ? (
        <button
          onClick={stopGeneration}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors flex-shrink-0"
          title={t.stop}
        >
          <Square className="h-3 w-3 fill-white" />
        </button>
      ) : (
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white disabled:opacity-30 hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-white" dir={dir}>
      {messages.length === 0 ? (
        // Empty state
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="w-full max-w-2xl">
            <AIEmptyState
              onSuggestionClick={(s) => {
                setInput(s);
                setTimeout(() => textareaRef.current?.focus(), 0);
              }}
            />
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="mt-6">
              {/* CHANGED: Call the function instead of rendering as a component */}
              {renderInputBar()}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Messages list */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
          >
            <div className="mx-auto max-w-2xl py-8 pb-4">
              {messages.map((msg, i) => (
                <AIMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  isLast={i === messages.length - 1}
                />
              ))}
              {isLoading && <AIThinking />}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Sticky input */}
          <div className="border-t border-gray-100 bg-white px-4 py-4">
            <div className="mx-auto max-w-2xl">
              {error && (
                <div className="mb-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {/* CHANGED: Call the function instead of rendering as a component */}
              {renderInputBar()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
