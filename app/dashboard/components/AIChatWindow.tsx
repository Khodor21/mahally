"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import AIMessage from "./AIMessage";
import AIThinking from "./AIThinking";
import AIEmptyState from "./AIEmptyState";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface AIChatWindowProps {
  storeId?: string; // Optional: pass store ID for personalized responses
}

export default function AIChatWindow({ storeId }: AIChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isMounted) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isMounted]);

  // Auto resize textarea (ChatGPT style)
  const handleInput = (value: string) => {
    setInput(value);

    if (!textareaRef.current) return;

    textareaRef.current.style.height = "auto";
    const scrollHeight = textareaRef.current.scrollHeight;
    textareaRef.current.style.height = Math.min(scrollHeight, 200) + "px";
  };

  // Send message to AI
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

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      // Call your backend API endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          storeId: storeId, // Pass store ID for context
          conversationHistory: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();

      if (!data.message) {
        throw new Error("No response from API");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat Error:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";

      setError(errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMessage}. Please try again or check your API configuration.`,
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

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col overflow-hidden bg-white"
    >
      {/* MESSAGES CONTAINER */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <AIEmptyState />
        ) : (
          <>
            {messages.map((msg) => (
              <AIMessage key={msg.id} role={msg.role} content={msg.content} />
            ))}

            {isLoading && <AIThinking />}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col gap-3">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 border border-red-200">
                <svg
                  className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-xs text-red-800 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Input Box */}
            <div className="flex items-end gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:border-gray-400 focus-within:border-blue-500 focus-within:shadow-md focus-within:ring-1 focus-within:ring-blue-200">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Message AI Store Consultant..."
                className="max-h-48 min-h-10 w-full resize-none border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                disabled={isLoading}
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-blue-600 text-white transition-all duration-200 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-gray-500">
              AI can make mistakes. Verify important information before acting
              on it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
