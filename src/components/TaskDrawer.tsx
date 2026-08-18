
import { useEffect, useState } from "react";
import type { BoardTask } from "../services/boardApi";

interface TaskDrawerProps {
  task: BoardTask;
  onClose: () => void;
}

interface SavedComment {
  id: number;
  text: string;
  createdAt: string;
}

function TaskDrawer({
  task,
  onClose,
}: TaskDrawerProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<SavedComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const storageKey = `task-comments-${String(task.id)}`;

  /*
   * LOAD COMMENTS
   *
   * Whenever a task is opened, read its comments
   * from localStorage.
   */
  useEffect(() => {
    setCommentsLoaded(false);

    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setComments(parsed as SavedComment[]);
        } else {
          setComments([]);
        }
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error(
        "Failed to load comments:",
        error
      );

      setComments([]);
    }

    setComment("");

    // Important:
    // Allow saving only AFTER localStorage has been loaded.
    setCommentsLoaded(true);
  }, [storageKey]);

  /*
   * SAVE COMMENTS
   *
   * Do not save until the initial localStorage
   * loading has completed.
   */
  useEffect(() => {
    if (!commentsLoaded) return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(comments)
      );

      console.log(
        "Comments saved:",
        storageKey,
        comments
      );
    } catch (error) {
      console.error(
        "Failed to save comments:",
        error
      );
    }
  }, [
    comments,
    commentsLoaded,
    storageKey,
  ]);

  /*
   * ADD COMMENT
   */
  const handleAddComment = () => {
    const trimmedComment = comment.trim();

    if (!trimmedComment) return;

    const newComment: SavedComment = {
      id: Date.now(),
      text: trimmedComment,
      createdAt: new Date().toLocaleString(),
    };

    setComments((previousComments) => [
      ...previousComments,
      newComment,
    ]);

    setComment("");
  };

  /*
   * DELETE COMMENT
   */
  const handleDeleteComment = (
    commentId: number
  ) => {
    setComments((previousComments) =>
      previousComments.filter(
        (item) => item.id !== commentId
      )
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/30"
      onClick={onClose}
    >
      <aside
        className="absolute right-0 top-0 flex h-full w-[420px] max-w-[92vw] flex-col overflow-hidden bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =========================
            HEADER
        ========================= */}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
          <div className="min-w-0 pr-3">
            <p className="text-sm text-slate-500">
              Task Details
            </p>

            <h2 className="mt-1 break-words text-xl font-bold text-slate-900">
              {task.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-3 py-2 text-2xl text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        {/* =========================
            CONTENT
        ========================= */}

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="space-y-5 p-5">

            {/* Status */}
            <div>
              <p className="text-sm text-slate-500">
                Status
              </p>

              <p className="mt-1 font-medium capitalize text-slate-900">
                {task.status.replace("-", " ")}
              </p>
            </div>

            {/* Priority */}
            <div>
              <p className="text-sm text-slate-500">
                Priority
              </p>

              <span
                className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                  task.priority === "High"
                    ? "bg-red-100 text-red-700"
                    : task.priority === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {task.priority}
              </span>
            </div>

            {/* Assignee */}
            <div>
              <p className="text-sm text-slate-500">
                Assignee
              </p>

              <p className="mt-1 break-words font-medium text-slate-900">
                {task.assignee || "Unassigned"}
              </p>
            </div>

            {/* Due Date */}
            <div>
              <p className="text-sm text-slate-500">
                Due Date
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {task.dueDate || "Not set"}
              </p>
            </div>

            {/* =========================
                COMMENTS
            ========================= */}

            <div className="border-t border-slate-200 pt-5">

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Comments
                </h3>

                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {comments.length}
                </span>
              </div>

              {/* Existing comments */}

              {comments.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {comments.map((item) => (
                    <div
                      key={item.id}
                      className="min-w-0 overflow-hidden rounded-lg bg-slate-50 p-3"
                    >
                      <div className="flex min-w-0 items-start gap-3">

                        <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
                          {item.text}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteComment(
                              item.id
                            )
                          }
                          className="shrink-0 whitespace-nowrap text-xs font-medium text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>

                      </div>

                      <p className="mt-2 break-words text-xs text-slate-400">
                        {item.createdAt}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  No comments yet.
                </p>
              )}

              {/* Add comment */}

              <div className="mt-4">
                <textarea
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                  placeholder="Write a comment..."
                  rows={4}
                  className="block w-full max-w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="button"
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Comment
              </button>

            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default TaskDrawer;

