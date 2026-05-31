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
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (role === "user") {
    return (
      <div className="flex justify-end bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="group relative max-w-2xl">
          <div className="rounded-2xl bg-blue-600 px-4 py-2.5 text-white shadow-sm">
            <p className="break-words text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>

          <button
            onClick={copyMessage}
            className="absolute -left-10 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-all duration-200 hover:bg-gray-100 group-hover:opacity-100"
            title="Copy message"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" strokeWidth={2} />
            ) : (
              <Copy className="h-4 w-4 text-gray-500" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="border-b border-gray-100 bg-gray-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="group relative">
          <button
            onClick={copyMessage}
            className="absolute -left-10 top-0 rounded p-1 opacity-0 transition-all duration-200 hover:bg-gray-200 group-hover:opacity-100"
            title="Copy message"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" strokeWidth={2} />
            ) : (
              <Copy className="h-4 w-4 text-gray-500" strokeWidth={2} />
            )}
          </button>

          <div
            className="prose prose-sm prose-gray max-w-none leading-relaxed
              prose-p:m-0 prose-p:mb-3
              prose-headings:mt-4 prose-headings:mb-2
              prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
              prose-ul:my-2 prose-ul:pl-4
              prose-ol:my-2 prose-ol:pl-4
              prose-li:my-1
              prose-code:bg-gray-900 prose-code:text-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
              prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:text-gray-600 prose-blockquote:italic
              prose-a:text-blue-600 prose-a:hover:underline
            "
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
