import { useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";

import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import { useTaskComments } from "../../hooks/useTaskComments";

function CommentSkeleton() {
  return (
    <div className="flex gap-2.5 animate-pulse">
      <div className="w-6 h-6 rounded-full bg-zinc-800 flex-shrink-0 mt-0.5" />

      <div className="flex-1 space-y-1.5">
        <div className="flex gap-2">
          <div className="h-2.5 w-16 bg-zinc-800 rounded-full" />
          <div className="h-2.5 w-10 bg-zinc-800/50 rounded-full" />
        </div>

        <div className="h-2.5 w-3/4 bg-zinc-800 rounded-full" />
        <div className="h-2.5 w-1/2 bg-zinc-800/60 rounded-full" />
      </div>
    </div>
  );
}

export default function TaskComments({ taskId }) {
  const {
    comments,
    loading,
    posting,
    postComment,
    deleteComment,
  } = useTaskComments(taskId);

  const listRef = useRef(null);

  // Auto-scroll to latest comment
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments]);

  return (
    <div className="border-t border-zinc-800 pt-4 mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={13} className="text-zinc-500" />

        <span className="text-xs font-semibold text-zinc-400">
          Comments
        </span>

        {comments.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
            {comments.length}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-4">
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      ) : (
        <>
          {/* Empty state */}
          {comments.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-zinc-600">
                No comments yet. Be the first!
              </p>
            </div>
          ) : (
            <div
              ref={listRef}
              className="
                space-y-4
                max-h-56
                overflow-y-auto
                pr-1
                scrollbar-thin
                scrollbar-thumb-zinc-700
                scrollbar-track-transparent
              "
            >
              {comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onDelete={deleteComment}
                  canDelete={true}
                />
              ))}
            </div>
          )}

          {/* Input */}
          <div className="mt-4">
            <CommentInput
              onSubmit={postComment}
              loading={posting}
            />
          </div>
        </>
      )}
    </div>
  );
}