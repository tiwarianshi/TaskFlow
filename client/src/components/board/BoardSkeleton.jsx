export default function BoardSkeleton() {
    return (
      <div className="flex flex-col rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 animate-pulse">
        {/* Accent strip */}
        <div className="h-1.5 w-full bg-zinc-700" />
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-zinc-800 rounded-full w-3/4" />
              <div className="h-2.5 bg-zinc-800/60 rounded-full w-1/2" />
            </div>
          </div>
          {/* Stats */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between">
              <div className="h-2 bg-zinc-800 rounded-full w-24" />
              <div className="h-2 bg-zinc-800 rounded-full w-8" />
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full w-full" />
          </div>
          {/* Footer */}
          <div className="flex justify-between pt-3 border-t border-zinc-800/60">
            <div className="h-2 bg-zinc-800 rounded-full w-16" />
            <div className="h-2 bg-zinc-800 rounded-full w-8" />
          </div>
        </div>
      </div>
    );
  }
  