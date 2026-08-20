import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import TaskDrawer from "../components/TaskDrawer";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import type {
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { fetchTasks } from "../services/boardApi";
import { useBoardStore } from "../store/boardStore";

const columns = [
  { id: "todo" as const, title: "To Do" },
  { id: "in-progress" as const, title: "In Progress" },
  { id: "review" as const, title: "Review" },
  { id: "done" as const, title: "Done" },
];

type ColumnId = (typeof columns)[number]["id"];

interface Task {
  id: number;
  title: string;
  completed: boolean;
  status: ColumnId;
  priority: "Low" | "Medium" | "High";
  assignee: string;
  dueDate: string;
}

/* =========================
   TASK CARD
========================= */

function TaskCard({
  task,
  overlay = false,
  onEdit,
  onDelete,
  onOpen,
}: {
  task: Task;
  overlay?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onOpen?: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(task.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={overlay ? undefined : setNodeRef}
      style={overlay ? undefined : style}
      {...(!overlay ? listeners : {})}
      {...(!overlay ? attributes : {})}
      onClick={() => {
        if (!overlay && !isDragging) {
          onOpen?.(task);
        }
      }}
      className={`rounded-xl bg-white p-4 shadow-sm ${
        overlay
          ? "rotate-2 cursor-grabbing shadow-xl"
          : "cursor-grab active:cursor-grabbing"
      } ${
        isDragging && !overlay
          ? "opacity-40"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-slate-900">
          {task.title}
        </h3>

        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
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

      <div className="mt-3 space-y-1 text-sm text-slate-500">
        <p>
          Assignee:{" "}
          <span className="font-medium text-slate-700">
            {task.assignee || "Unassigned"}
          </span>
        </p>

        <p>
          Due:{" "}
          <span className="font-medium text-slate-700">
            {task.dueDate || "Not set"}
          </span>
        </p>
      </div>

      {!overlay && (
        <div
          className="mt-4 flex gap-2"
          onPointerDown={(event) =>
            event.stopPropagation()
          }
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            onClick={() => onEdit?.(task)}
            className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            ✏️ Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(task.id)}
            className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </article>
  );
}

/* =========================
   COLUMN
========================= */

function DroppableColumn({
  id,
  title,
  tasks,
  onEdit,
  onDelete,
  onOpen,
}: {
  id: ColumnId;
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onOpen: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
  });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[500px] rounded-xl p-4 transition ${
        isOver
          ? "bg-blue-100 ring-2 ring-blue-400"
          : "bg-slate-200"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          {title}
        </h2>

        <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((task) =>
          String(task.id)
        )}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[420px] space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpen={onOpen}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}

/* =========================
   TASK MODAL
========================= */

function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}) {
  const isEditing = Boolean(task);

  const [title, setTitle] = useState(task?.title || "");
  const [priority, setPriority] =
    useState<Task["priority"]>(task?.priority || "Medium");
  const [assignee, setAssignee] = useState(task?.assignee || "");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) return;

    const updatedTask: Task = {
      id: task?.id || Date.now(),
      title: title.trim(),
      completed: task?.completed || false,
      status: task?.status || "todo",
      priority,
      assignee: assignee.trim() || "Unassigned",
      dueDate,
    };

    onSave(updatedTask);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? "Edit Task" : "Add Task"}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter task title"
          autoFocus
          required
        />

        <Select
          label="Priority"
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as Task["priority"])
          }
          options={[
            { value: "Low", label: "Low" },
            { value: "Medium", label: "Medium" },
            { value: "High", label: "High" },
          ]}
        />

        <Input
          label="Assignee"
          type="text"
          value={assignee}
          onChange={(event) => setAssignee(event.target.value)}
          placeholder="Enter assignee"
        />

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />

        <div className="flex justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button type="submit">
            {isEditing ? "Save Changes" : "Add Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* =========================
   BOARD
========================= */

function Board() {
  const tasks = useBoardStore(
    (state) => state.tasks
  );

  const setTasks = useBoardStore(
    (state) => state.setTasks
  );

  const moveTask = useBoardStore(
    (state) => state.moveTask
  );

  const reorderTasks = useBoardStore(
    (state) => state.reorderTasks
  );

  const addTask = useBoardStore(
    (state) => state.addTask
  );

  const updateTask = useBoardStore(
    (state) => state.updateTask
  );

  const deleteTask = useBoardStore(
    (state) => state.deleteTask
  );

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [activeTaskId, setActiveTaskId] =
    useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  /* =========================
     LOAD TASKS
  ========================= */

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error(
          "Failed to load tasks:",
          error
        );
      }
    };

    if (tasks.length === 0) {
      loadTasks();
    }
  }, [setTasks, tasks.length]);

  /* =========================
     DRAG START
  ========================= */

  const handleDragStart = (
    event: DragStartEvent
  ) => {
    setActiveTaskId(
      Number(event.active.id)
    );
  };

  /* =========================
     DRAG END
  ========================= */

  const handleDragEnd = (
    event: DragEndEvent
  ) => {
    const { active, over } = event;

    setActiveTaskId(null);

    if (!over) return;

    const activeId = Number(active.id);

    const activeTask = tasks.find(
      (task) => task.id === activeId
    );

    if (!activeTask) return;

    const overId = String(over.id);

    if (overId.startsWith("column-")) {
      const targetColumn =
        overId.replace(
          "column-",
          ""
        ) as ColumnId;

      if (
        columns.some(
          (column) =>
            column.id === targetColumn
        ) &&
        activeTask.status !== targetColumn
      ) {
        moveTask(
          activeId,
          targetColumn
        );
      }

      return;
    }

    const overTask = tasks.find(
      (task) =>
        task.id === Number(overId)
    );

    if (!overTask) return;

    if (
      activeTask.status ===
        overTask.status &&
      activeId !== overTask.id
    ) {
      reorderTasks(
        activeId,
        overTask.id
      );

      return;
    }

    if (
      activeTask.status !==
      overTask.status
    ) {
      moveTask(
        activeId,
        overTask.status
      );
    }
  };

  /* =========================
     ADD TASK
  ========================= */

  const handleAddTask = (
    task: Task
  ) => {
    addTask(task);
    setModalOpen(false);
    setEditingTask(null);
  };

  /* =========================
     EDIT TASK
  ========================= */

  const handleEditTask = (
    task: Task
  ) => {
    setSelectedTask(null);
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = (
    task: Task
  ) => {
    if (editingTask) {
      updateTask(task.id, {
        title: task.title,
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate,
      });
    } else {
      addTask(task);
    }

    setModalOpen(false);
    setEditingTask(null);
  };

  /* =========================
     DELETE TASK
  ========================= */

  const handleDeleteTask = (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    deleteTask(id);

    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
  };

  /* =========================
     OPEN DRAWER
  ========================= */

  const handleOpenTask = (
    task: Task
  ) => {
    if (activeTaskId !== null) return;

    setSelectedTask(task);
  };

  const activeTask =
    activeTaskId !== null
      ? tasks.find(
          (task) =>
            task.id === activeTaskId
        )
      : null;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Sprint Board
          </h1>

          <p className="mt-1 text-slate-500">
            Drag and drop tasks between columns
          </p>
        </div>

        <Button
  type="button"
  onClick={() => {
    setEditingTask(null);
    setModalOpen(true);
  }}
>
  + Add Task
</Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => {
            const columnTasks =
              tasks.filter(
                (task) =>
                  task.status ===
                  column.id
              );

            return (
              <DroppableColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={columnTasks}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onOpen={handleOpenTask}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              overlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
          onSave={
            editingTask
              ? handleSaveTask
              : handleAddTask
          }
        />
      )}

      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </main>
  );
}

export default Board;
