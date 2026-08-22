import { useState } from "react";
import type { FormEvent } from "react";
import type { BoardTask } from "../services/boardApi";

interface AddTaskModalProps {
  onClose: () => void;
  onAdd: (task: BoardTask) => void;
}

function AddTaskModal({
  onClose,
  onAdd,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] =
    useState<BoardTask["priority"]>("Medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    const newTask: BoardTask = {
      id: Date.now(),
      title: title.trim(),
      completed: false,
      status: "todo",
      priority,
      assignee: assignee.trim() || "Unassigned",
      dueDate,
    };

    onAdd(newTask);

    // Form reset
    setTitle("");
    setPriority("Medium");
    setAssignee("");
    setDueDate("");

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Add Task
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create a new task for your sprint.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-2xl text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Task Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Task Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter task title"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              autoFocus
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Priority
            </label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value as BoardTask["priority"]
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Assignee
            </label>

            <input
              type="text"
              value={assignee}
              onChange={(event) =>
                setAssignee(event.target.value)
              }
              placeholder="Enter assignee name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskModal;