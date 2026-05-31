import AIChatWindow from "../components/AIChatWindow";

export default function AIPage() {
  return (
    <div className="h-full w-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Store Consultant</h1>
        <p className="text-sm text-gray-500">
          Ask AI to analyze your store, write marketing content, and improve
          sales.
        </p>
      </div>

      <AIChatWindow />
    </div>
  );
}
