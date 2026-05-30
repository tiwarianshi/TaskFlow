import { useState } from "react";
import { X, KanbanSquare } from "lucide-react";

const COLORS = [
{ hex: "#6d28d9", label: "Violet" },
{ hex: "#0ea5e9", label: "Sky" },
{ hex: "#10b981", label: "Emerald" },
{ hex: "#f59e0b", label: "Amber" },
{ hex: "#ef4444", label: "Red" },
{ hex: "#ec4899", label: "Pink" },
{ hex: "#f97316", label: "Orange" },
{ hex: "#14b8a6", label: "Teal" },
];

export default function CreateBoardModal({
isOpen,
onClose,
onCreate,
}) {
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [color, setColor] = useState(COLORS[0].hex);
const [loading, setLoading] = useState(false);

if (!isOpen) return null;

async function handleSubmit(e) {
e.preventDefault();


if (!title.trim()) return;

setLoading(true);

try {
  await onCreate({
    title: title.trim(),
    description: description.trim(),
    color,
  });

  // reset form after success
  setTitle("");
  setDescription("");
  setColor(COLORS[0].hex);

  onClose();
} catch (err) {
  // toast handled in parent
} finally {
  setLoading(false);
}


}

function handleClose() {
if (loading) return;

setTitle("");
setDescription("");
setColor(COLORS[0].hex);

onClose();


}

return (
<div
className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
onClick={(e) => e.target === e.currentTarget && handleClose()}
> <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700/60 shadow-2xl">

    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}22` }}
        >
          <KanbanSquare size={14} style={{ color }} />
        </div>

        <h2 className="text-sm font-semibold text-zinc-100">
          New Board
        </h2>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
      >
        <X size={14} />
      </button>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="p-5 space-y-4">

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Board Title <span className="text-red-400">*</span>
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q3 Product Roadmap"
          autoFocus
          className="
            w-full px-3 py-2 text-sm rounded-lg
            bg-zinc-800/80 border border-zinc-700/60 text-zinc-100
            placeholder:text-zinc-600
            focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
            transition-all
          "
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Description <span className="text-zinc-600">(optional)</span>
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this board for?"
          rows={2}
          className="
            w-full px-3 py-2 text-sm rounded-lg resize-none
            bg-zinc-800/80 border border-zinc-700/60 text-zinc-100
            placeholder:text-zinc-600
            focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
            transition-all
          "
        />
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-2">
          Accent Color
        </label>

        <div className="flex flex-wrap gap-2">
          {COLORS.map(({ hex, label }) => (
            <button
              key={hex}
              type="button"
              onClick={() => setColor(hex)}
              title={label}
              className={`
                w-7 h-7 rounded-lg transition-all duration-150
                ${
                  color === hex
                    ? "ring-2 ring-offset-2 ring-offset-zinc-900 scale-110"
                    : "hover:scale-105 opacity-70 hover:opacity-100"
                }
              `}
              style={{
                backgroundColor: hex,
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 pt-1">

        <button
          type="button"
          onClick={handleClose}
          className="flex-1 px-4 py-2 text-sm rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="flex-1 px-4 py-2 text-sm rounded-lg font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: color }}
        >
          {loading ? "Creating…" : "Create Board"}
        </button>

      </div>
    </form>
  </div>
</div>

);
}
