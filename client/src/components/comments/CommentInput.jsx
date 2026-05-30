import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export default function CommentInput({ onSubmit, loading = false }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;

    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  function handleKeyDown(e) {
    // Ctrl + Enter OR Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  async function handleSubmit() {
    const trimmed = value.trim();

    if (!trimmed || loading) return;

    try {
      await onSubmit?.(trimmed);

      setValue("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  }

  return (
    <div className="flex gap-2 items-end mt-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a comment… (Ctrl + Enter to send)"
        rows={1}
        disabled={loading}
        className="
          flex-1 px-3 py-2 text-xs rounded-xl resize-none
          bg-zinc-800/80 border border-zinc-700/60 text-zinc-200
          placeholder:text-zinc-600
          focus:outline-none focus:border-violet-500/50
          focus:ring-1 focus:ring-violet-500/15
          transition-all leading-relaxed
          overflow-hidden
          disabled:opacity-50
        "
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!value.trim() || loading}
        className="
          w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
          bg-violet-600 hover:bg-violet-500 text-white
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-all duration-150
        "
      >
        <Send size={12} />
      </button>
    </div>
  );
}