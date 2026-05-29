// src/components/task/TaskForm.jsx
// Controlled form for creating and editing tasks.
// Purely presentational — receives values and handlers from TaskModal.

import { AlertCircle } from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const PRIORITIES = [
  {
    value: "low",
    label: "Low",
    dot: "bg-sky-400",
    ring: "ring-sky-500/40",
    active: "bg-sky-500/10 border-sky-500/40 text-sky-300",
  },
  {
    value: "medium",
    label: "Medium",
    dot: "bg-amber-400",
    ring: "ring-amber-500/40",
    active: "bg-amber-500/10 border-amber-500/40 text-amber-300",
  },
  {
    value: "high",
    label: "High",
    dot: "bg-red-400",
    ring: "ring-red-500/40",
    active: "bg-red-500/10 border-red-500/40 text-red-300",
  },
];

const STATUSES = [
  { value: "todo", label: "Todo", dot: "bg-gray-400" },
  { value: "inprogress", label: "In Progress", dot: "bg-indigo-400" },
  { value: "done", label: "Done", dot: "bg-emerald-400" },
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = `
  w-full bg-gray-800/80 border border-gray-700 text-gray-100 text-sm
  rounded-lg px-3.5 py-2.5 placeholder-gray-600
  focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50
  transition-colors duration-150 disabled:opacity-50
`;

const labelCls =
  "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5";

/**
 * @param {Object}   values
 * @param {Function} onChange
 * @param {Object}   errors
 * @param {boolean}  isSubmitting
 * @param {boolean}  isEdit
 */
export default function TaskForm({
  values,
  onChange,
  errors,
  isSubmitting,
  isEdit,
}) {
  return (
    <div className="space-y-5">

      {/* ── Title ── */}
      <div>
        <label className={labelCls}>
          Title{" "}
          <span className="text-red-400 normal-case tracking-normal">*</span>
        </label>

        <input
          type="text"
          required
          value={values.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Design login screen"
          maxLength={100}
          disabled={isSubmitting}
          className={`${inputCls} ${
            errors?.title
              ? "border-red-500/60 focus:border-red-500"
              : ""
          }`}
        />

        {errors?.title && (
          <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
            <AlertCircle size={11} />
            {errors.title}
          </p>
        )}
      </div>

      {/* ── Description ── */}
      <div>
        <label className={labelCls}>
          Description
          <span className="text-gray-600 normal-case tracking-normal font-normal ml-1">
            (optional)
          </span>
        </label>

        <textarea
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Add more context about this task..."
          rows={3}
          maxLength={500}
          disabled={isSubmitting}
          className={`${inputCls} resize-none leading-relaxed`}
        />

        {/* Character counter */}
        <p className="text-right text-gray-700 text-[10px] mt-1">
          {values.description?.length || 0}/500
        </p>
      </div>

      {/* ── Priority selector ── */}
      <div>
        <label className={labelCls}>Priority</label>

        <div className="flex gap-2">
          {PRIORITIES.map((p) => {
            const isActive = values.priority === p.value;

            return (
              <button
                key={p.value}
                type="button"
                disabled={isSubmitting}
                onClick={() => onChange("priority", p.value)}
                className={`
                  flex-1 flex items-center justify-center gap-2
                  px-3 py-2 rounded-lg border text-xs font-semibold
                  transition-all duration-150
                  ${
                    isActive
                      ? `${p.active} ${p.ring} ring-1`
                      : "border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`}
                />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Status selector (edit only) ── */}
      {isEdit && (
        <div>
          <label className={labelCls}>Status</label>

          <div className="flex gap-2">
            {STATUSES.map((s) => {
              const isActive = values.status === s.value;

              return (
                <button
                  key={s.value}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onChange("status", s.value)}
                  className={`
                    flex-1 flex items-center justify-center gap-2
                    px-3 py-2 rounded-lg border text-xs font-semibold
                    transition-all duration-150
                    ${
                      isActive
                        ? "border-gray-500 bg-gray-700/60 text-gray-200 ring-1 ring-gray-500/40"
                        : "border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`}
                  />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Due date ── */}
      <div>
        <label className={labelCls}>
          Due Date{" "}
          <span className="text-gray-600 normal-case tracking-normal font-normal">
            (optional)
          </span>
        </label>

        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={values.dueDate}
          onChange={(e) => onChange("dueDate", e.target.value)}
          disabled={isSubmitting}
          className={`${inputCls} [color-scheme:dark]`}
        />
      </div>
    </div>
  );
}