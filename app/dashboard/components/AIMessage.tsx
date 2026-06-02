"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function AIMessage({ role, content }: AIMessageProps) {
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isUser = role === "user";

  return (
    <div
      className={`w-full flex ${
        isUser ? "justify-end" : "justify-start"
      } px-4 py-2`}
      dir="auto"
    >
      <div className="relative max-w-2xl group">
        <button
          onClick={copyMessage}
          className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser ? "bg-[#10a37f] text-white" : "text-gray-900"
          }`}
        >
          {isUser ? (
            content
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
