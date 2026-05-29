// src/components/task/TaskModal.jsx
// Single modal that handles create + edit + delete flows.

import { useState, useEffect } from "react";
import {
  X,
  Trash2,
  Loader2,
  AlertTriangle,
  Plus,
 Save,
} from "lucide-react";
import toast from "react-hot-toast";

import TaskForm from "./TaskForm";
import {
  createTask,
  updateTask,
  deleteTask,
} from "../../api/taskApi";

// ─────────────────────────────────────────────────────────────
// Empty form factory
// ─────────────────────────────────────────────────────────────
function emptyForm(defaultStatus = "todo") {
  return {
    title: "",
    description: "",
    priority: "medium",
    status: defaultStatus,
    dueDate: "",
  };
}

export default function TaskModal({
  isOpen,
  onClose,
  task = null,
  boardId,
  defaultStatus = "todo",
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
}) {
  const isEdit = Boolean(task);

  // ───────────────────────────────────────────────────────────
  // State
  // ───────────────────────────────────────────────────────────
  const [form, setForm] = useState(emptyForm(defaultStatus));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ───────────────────────────────────────────────────────────
  // Populate form on modal open
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && task) {
      setForm({
        title: task.title ?? "",
        description: task.description ?? "",
        priority: task.priority ?? "medium",
        status: task.status ?? "todo",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setForm(emptyForm(defaultStatus));
    }

    setErrors({});
    setShowDeleteConfirm(false);
  }, [isOpen, task, isEdit, defaultStatus]);

  // ───────────────────────────────────────────────────────────
  // Don't render when closed
  // ───────────────────────────────────────────────────────────
  if (!isOpen) return null;

  // ───────────────────────────────────────────────────────────
  // Handle field changes
  // ───────────────────────────────────────────────────────────
  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  }

  // ───────────────────────────────────────────────────────────
  // Validation
  // ───────────────────────────────────────────────────────────
  function validate() {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Title is required.";
    }

    if (form.title.trim().length > 100) {
      newErrors.title = "Title must be under 100 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  // ───────────────────────────────────────────────────────────
  // Create / Update
  // ───────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate || null,

      // IMPORTANT FIX
      ...(isEdit ? {} : { board: boardId }),
    };

    try {
      setIsSubmitting(true);

      if (isEdit) {
        const updatedTask = await updateTask(task._id, payload);

        onTaskUpdated?.(updatedTask);

        toast.success("Task updated.");
      } else {
        const createdTask = await createTask(payload);

        onTaskCreated?.(createdTask);

        toast.success(`"${createdTask.title}" created!`);
      }

      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} task.`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ───────────────────────────────────────────────────────────
  // Delete task
  // ───────────────────────────────────────────────────────────
  async function handleDelete() {
    try {
      setIsDeleting(true);

      await deleteTask(task._id);

      onTaskDeleted?.(task._id);

      toast.success("Task deleted.");

      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to delete task."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  // ───────────────────────────────────────────────────────────
  // Close on backdrop click
  // ───────────────────────────────────────────────────────────
  function handleBackdropClick(e) {
    if (
      e.target === e.currentTarget &&
      !isSubmitting &&
      !isDeleting
    ) {
      onClose();
    }
  }

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────
  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/70 backdrop-blur-sm px-4 py-6"
    >
      <div
        className="w-full max-w-md bg-gray-900 border border-gray-700/80
                   rounded-2xl shadow-2xl shadow-black/60
                   flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {isEdit ? (
              <Save size={16} className="text-indigo-400" />
            ) : (
              <Plus size={16} className="text-indigo-400" />
            )}

            <h2 className="text-white font-semibold text-base">
              {isEdit ? "Edit task" : "New task"}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {/* Delete button */}
            {isEdit && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400
                           hover:bg-red-400/10 transition-colors duration-150
                           disabled:opacity-40"
              >
                <Trash2 size={15} />
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300
                         hover:bg-gray-800 transition-colors duration-150
                         disabled:opacity-40"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {showDeleteConfirm ? (
            <div className="flex flex-col items-center text-center py-6">
              <div
                className="w-14 h-14 rounded-2xl bg-red-500/10
                           border border-red-500/20
                           flex items-center justify-center mb-4"
              >
                <AlertTriangle
                  size={24}
                  className="text-red-400"
                />
              </div>

              <h3 className="text-white font-semibold text-base mb-1">
                Delete this task?
              </h3>

              <p className="text-gray-500 text-sm mb-6 max-w-[260px] leading-relaxed">
                <span className="text-gray-300 font-medium">
                  "{task.title}"
                </span>{" "}
                will be permanently removed.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-400
                             hover:text-white hover:bg-gray-800
                             rounded-lg border border-gray-700
                             transition-colors duration-150"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2
                             px-4 py-2.5 bg-red-600 hover:bg-red-500
                             text-white text-sm font-medium rounded-lg"
                >
                  {isDeleting && (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  {isDeleting
                    ? "Deleting..."
                    : "Yes, delete"}
                </button>
              </div>
            </div>
          ) : (
            <TaskForm
              values={form}
              onChange={handleChange}
              errors={errors}
              isSubmitting={isSubmitting}
              isEdit={isEdit}
            />
          )}
        </div>

        {/* Footer */}
        {!showDeleteConfirm && (
          <div
            className="flex items-center justify-end gap-3
                       px-6 py-4 border-t border-gray-800
                       flex-shrink-0"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-gray-500
                         hover:text-white hover:bg-gray-800
                         rounded-lg transition-colors duration-150"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting || !form.title.trim()
              }
              className="flex items-center gap-2 px-5 py-2
                         bg-indigo-600 hover:bg-indigo-500
                         disabled:opacity-50
                         disabled:cursor-not-allowed
                         text-white text-sm font-medium
                         rounded-lg transition-colors duration-150"
            >
              {isSubmitting && (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              )}

              {isSubmitting
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                ? "Save changes"
                : "Create task"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}