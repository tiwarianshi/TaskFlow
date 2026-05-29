import { useState } from "react";
import { X, Loader2 } from "lucide-react";

const COLOR_OPTIONS = [
  { index: 0, from: "#6366f1", to: "#7c3aed" },
  { index: 1, from: "#f43f5e", to: "#db2777" },
  { index: 2, from: "#10b981", to: "#0d9488" },
  { index: 3, from: "#f59e0b", to: "#ea580c" },
  { index: 4, from: "#0ea5e9", to: "#06b6d4" },
  { index: 5, from: "#a855f7", to: "#d946ef" },
];

export default function CreateBoardModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);

  if (!isOpen) return null;

  function resetForm() {
    setTitle("");
    setDescription("");
    setSelectedColor(0);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      color: selectedColor,
    });

    resetForm();
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-0">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">
            Create new board
          </h2>

          <button
            type="button"
            onClick={() => {
              if (!isLoading) handleClose();
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Board title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Marketing Campaign"
              maxLength={60}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this board for?"
              rows={3}
              maxLength={200}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2.5">
              Board color
            </label>

            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.index}
                  type="button"
                  onClick={() => setSelectedColor(c.index)}
                  className={`w-8 h-8 rounded-lg transition-all duration-150 ${
                    selectedColor === c.index
                      ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={() => {
                if (!isLoading) handleClose();
              }}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-150"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-150"
            >
              {isLoading && (
                <Loader2 size={15} className="animate-spin" />
              )}

              {isLoading ? "Creating..." : "Create board"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}