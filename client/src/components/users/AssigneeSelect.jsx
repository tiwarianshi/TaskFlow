import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, UserCircle2 } from "lucide-react";
import UserAvatar from "../users/UserAvatar";

/**
 * AssigneeSelect
 * @param {Array}  members   — board member list
 * @param {string} value     — selected member _id
 * @param {fn}     onChange  — (memberId | null) => void
 */
export default function AssigneeSelect({
  members = [],
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected =
    members.find((m) => m._id === value) || null;

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs
          bg-zinc-800/80 border border-zinc-700/60 text-zinc-300
          hover:border-zinc-600
          focus:outline-none focus:border-violet-500/60
          focus:ring-1 focus:ring-violet-500/20
          transition-all
        "
      >
        {selected ? (
          <>
            <UserAvatar user={selected} size="xs" />

            <span className="flex-1 text-left truncate">
              {selected.name}
            </span>

            {/* FIXED: span instead of nested button */}
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(null);
                }
              }}
              className="
                text-zinc-500 hover:text-zinc-300
                flex-shrink-0 cursor-pointer
              "
            >
              <X size={11} />
            </span>
          </>
        ) : (
          <>
            <UserCircle2
              size={13}
              className="text-zinc-600"
            />

            <span className="flex-1 text-left text-zinc-600">
              Assign to...
            </span>

            <ChevronDown
              size={11}
              className="text-zinc-600"
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute top-full left-0 right-0 mt-1 z-50
            bg-zinc-900 border border-zinc-700/60
            rounded-xl shadow-2xl overflow-hidden
          "
        >
          <div className="p-1">
            {/* Unassign */}
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="
                w-full flex items-center gap-2 px-3 py-2
                rounded-lg text-xs text-left
                text-zinc-500 hover:bg-zinc-800
                hover:text-zinc-300 transition-colors
              "
            >
              <div
                className="
                  w-5 h-5 rounded-full
                  border border-dashed border-zinc-600
                  flex items-center justify-center
                "
              >
                <X size={9} />
              </div>

              Unassigned
            </button>

            {/* Members */}
            {members.map((member) => (
              <button
                key={member._id}
                type="button"
                onClick={() => {
                  onChange(member._id);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2
                  px-3 py-2 rounded-lg text-xs text-left
                  transition-colors
                  ${
                    value === member._id
                      ? "bg-violet-500/10 text-violet-300"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }
                `}
              >
                <UserAvatar user={member} size="xs" />

                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">
                    {member.name}
                  </p>
                </div>

                {value === member._id && (
                  <div
                    className="
                      w-1.5 h-1.5 rounded-full
                      bg-violet-400 flex-shrink-0
                    "
                  />
                )}
              </button>
            ))}

            {/* Empty state */}
            {members.length === 0 && (
              <p className="px-3 py-4 text-xs text-zinc-600 text-center">
                No members yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}