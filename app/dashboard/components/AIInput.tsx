import { ArrowUp } from "lucide-react";
const AIInput = () => {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-end gap-2 rounded-3xl border border-gray-300 bg-white p-3 shadow-sm">
        <textarea
          rows={1}
          placeholder="Message AI Store Consultant..."
          className="
        flex-1
        resize-none
        border-none
        bg-transparent
        outline-none
        max-h-[200px]
      "
        />

        <button
          className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        bg-black
        text-white
      "
        >
          <ArrowUp />
        </button>
      </div>
    </div>
  );
};

export default AIInput;
