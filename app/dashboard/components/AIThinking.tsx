"use client";

export default function AIThinking() {
  return (
    <div className="border-b border-gray-100 bg-gray-50 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center gap-4">
          {/* Animated dots */}
          <div className="flex gap-1">
            <span
              className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>

          {/* Thinking text */}
          <span className="text-sm text-gray-600 font-medium">
            AI Store Consultant is thinking...
          </span>
        </div>
      </div>
    </div>
  );
}
