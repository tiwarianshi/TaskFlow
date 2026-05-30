import { useRef, useState } from "react";
import { Search, X } from "lucide-react";

export default function BoardSearch({ onSearch }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  function handleChange(e) {
    const v = e.target.value;
    setValue(v);
    onSearch(v); // debounce is in the hook
  }

  function handleClear() {
    setValue("");
    onSearch("");
    inputRef.current?.focus();
  }

  return (
    <div className="relative flex-1 min-w-0 max-w-sm">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search boards..."
        className="
          w-full pl-8 pr-8 py-2 text-sm rounded-lg
          bg-zinc-800/80 border border-zinc-700/60 text-zinc-200
          placeholder:text-zinc-600
          focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
          transition-all duration-150
        "
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
