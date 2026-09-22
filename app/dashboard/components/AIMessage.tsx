"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface AIMessageProps {
  role: "user" | "assistant";
  content: string;
  isLast?: boolean;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-950 text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <span className="text-xs text-gray-400 font-mono">
          {language || "code"}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-gray-100 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function AIMessage({ role, content, isLast }: AIMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const copyMessage = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const markdownComponents: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const isBlock = !props.node?.position || String(children).includes("\n");

      if (isBlock) {
        return (
          <CodeBlock
            language={match?.[1] ?? ""}
            code={String(children).replace(/\n$/, "")}
          />
        );
      }

      return (
        <code
          className="bg-gray-100 text-gray-800 rounded px-1.5 py-0.5 text-[0.82em] font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    p({ children }) {
      return <p className="mb-3 last:mb-0 leading-7">{children}</p>;
    },
    ul({ children }) {
      return <ul className="mb-3 list-disc ps-5 space-y-1">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="mb-3 list-decimal ps-5 space-y-1">{children}</ol>;
    },
    li({ children }) {
      return <li className="leading-7">{children}</li>;
    },
    h1({ children }) {
      return (
        <h1 className="text-lg font-semibold mb-2 mt-4 first:mt-0">
          {children}
        </h1>
      );
    },
    h2({ children }) {
      return (
        <h2 className="text-base font-semibold mb-2 mt-4 first:mt-0">
          {children}
        </h2>
      );
    },
    h3({ children }) {
      return (
        <h3 className="text-sm font-semibold mb-1 mt-3 first:mt-0">
          {children}
        </h3>
      );
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-s-2 border-gray-300 ps-4 text-gray-600 my-3">
          {children}
        </blockquote>
      );
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-3">
          <table className="min-w-full text-sm border-collapse border border-gray-200 rounded-lg overflow-hidden">
            {children}
          </table>
        </div>
      );
    },
    th({ children }) {
      return (
        <th className="bg-gray-50 border border-gray-200 px-3 py-2 text-start font-medium text-gray-700">
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="border border-gray-200 px-3 py-2 text-gray-600">
          {children}
        </td>
      );
    },
    hr() {
      return <hr className="border-gray-200 my-4" />;
    },
    strong({ children }) {
      return (
        <strong className="font-semibold text-gray-900">{children}</strong>
      );
    },
  };

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-2" dir="auto">
        <div className="relative group max-w-[75%]">
          <div className="rounded-2xl rounded-br-sm bg-gray-900 text-white px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
          <button
            onClick={copyMessage}
            className="absolute -bottom-5 end-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3" dir="auto">
      <div className="relative group max-w-none">
        {/* AI avatar dot */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-900">
            <span className="text-[10px] text-white font-bold">م</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-800">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {content}
              </ReactMarkdown>
            </div>
            {/* Copy button below assistant message */}
            <button
              onClick={copyMessage}
              className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              {copied ? (
                <>
                  <Check size={12} />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>نسخ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
