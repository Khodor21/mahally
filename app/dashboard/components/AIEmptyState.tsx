"use client";

import { Sparkles, Lightbulb, Target, TrendingUp } from "lucide-react";

export default function AIEmptyState() {
  const suggestions = [
    {
      icon: TrendingUp,
      title: "Boost Sales",
      description: "Get strategies to increase revenue",
    },
    {
      icon: Target,
      title: "Marketing Ideas",
      description: "Ideas to promote your products",
    },
    {
      icon: Lightbulb,
      title: "Product Tips",
      description: "Optimize your product listings",
    },
    {
      icon: Sparkles,
      title: "Business Advice",
      description: "General store optimization tips",
    },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-3">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          AI Store Consultant
        </h1>

        <p className="mx-auto max-w-md text-base text-gray-600">
          Your intelligent assistant for store management. Ask anything about
          sales, marketing, products, or optimization strategies.
        </p>
      </div>

      {/* Suggestion Cards */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <div
              key={suggestion.title}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:bg-gray-50 cursor-pointer group"
            >
              <Icon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 group-hover:text-blue-700" />

              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 group-hover:text-gray-900">
                  {suggestion.title}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {suggestion.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <p className="mt-8 text-xs text-gray-500 text-center max-w-sm">
        AI responses are powered by advanced language models. Always verify
        important business decisions.
      </p>
    </div>
  );
}
