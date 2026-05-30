import { X, Clock } from "lucide-react";
import ActivityItem from "./ActivityItem";
import { groupByDay } from "../../utils/collaborationUtils";

function ActivitySkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-xl bg-zinc-800 flex-shrink-0" />

      <div className="flex-1 space-y-1.5 pb-4">
        <div className="h-2.5 w-3/4 bg-zinc-800 rounded-full" />
        <div className="h-2 w-1/2 bg-zinc-800/60 rounded-full" />
      </div>
    </div>
  );
}

export default function ActivityTimeline({
  activity = [],
  loading = false,
  onClose,
}) {
  const groups = groupByDay(activity || []) || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="
          fixed top-0 right-0 bottom-0 z-50
          w-full sm:w-80 md:w-96
          bg-zinc-950 border-l border-zinc-800
          flex flex-col shadow-2xl
          animate-in slide-in-from-right duration-200
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-zinc-500" />

            <h3 className="text-sm font-semibold text-zinc-100">
              Activity
            </h3>
          </div>

          <button
            onClick={onClose}
            className="
              w-7 h-7 rounded-lg flex items-center justify-center
              text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800
              transition-all
            "
          >
            <X size={14} />
          </button>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Loading */}
          {loading && (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <ActivitySkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && activity.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Clock size={28} className="text-zinc-800" />

              <p className="text-xs text-zinc-600">
                No activity yet
              </p>
            </div>
          )}

          {/* Activity groups */}
          {!loading &&
            groups.map(({ day, label, items }) => (
              <div key={day} className="mb-5">
                {/* Day label */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px bg-zinc-800" />

                  <span
                    className="
                      text-[10px] font-medium text-zinc-600
                      px-2 uppercase tracking-wider whitespace-nowrap
                    "
                  >
                    {label}
                  </span>

                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {items.map((item, i) => (
                    <ActivityItem
                      key={item._id || i}
                      activity={item}
                      isLast={i === items.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}