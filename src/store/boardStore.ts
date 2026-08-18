import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import type { BoardTask } from "../services/boardApi";

interface BoardState {
  tasks: BoardTask[];

  setTasks: (tasks: BoardTask[]) => void;

  addTask: (task: BoardTask) => void;

  updateTask: (
    id: number,
    updates: Partial<BoardTask>
  ) => void;

  deleteTask: (id: number) => void;

  moveTask: (
    taskId: number,
    status: BoardTask["status"]
  ) => void;

  reorderTasks: (
    activeId: number,
    overId: number
  ) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  tasks: [],

  // =========================
  // SET TASKS
  // =========================

  setTasks: (tasks) =>
    set({
      tasks,
    }),

  // =========================
  // ADD TASK
  // =========================

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  // =========================
  // UPDATE TASK
  // =========================

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
            }
          : task
      ),
    })),

  // =========================
  // DELETE TASK
  // =========================

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter(
        (task) => task.id !== id
      ),
    })),

  // =========================
  // MOVE TASK
  // =========================

  moveTask: (taskId, status) =>
    set((state) => {
      const task = state.tasks.find(
        (item) => item.id === taskId
      );

      if (!task) {
        return state;
      }

      // Same column -> nothing to do
      if (task.status === status) {
        return state;
      }

      // Remove task from old column
      const remainingTasks = state.tasks.filter(
        (item) => item.id !== taskId
      );

      // Update task
      const movedTask: BoardTask = {
        ...task,
        status,
        completed: status === "done",
      };

      /*
       * Find the last task of target column.
       * We will put the moved task AFTER it.
       */
      let insertIndex = remainingTasks.length;

      for (
        let i = remainingTasks.length - 1;
        i >= 0;
        i--
      ) {
        if (
          remainingTasks[i].status === status
        ) {
          insertIndex = i + 1;
          break;
        }
      }

      // If target column has no task,
      // put it at the end.
      if (insertIndex > remainingTasks.length) {
        insertIndex = remainingTasks.length;
      }

      const newTasks = [...remainingTasks];

      newTasks.splice(
        insertIndex,
        0,
        movedTask
      );

      return {
        tasks: newTasks,
      };
    }),

  // =========================
  // REORDER SAME COLUMN
  // =========================

  reorderTasks: (activeId, overId) =>
    set((state) => {
      const activeTask = state.tasks.find(
        (task) => task.id === activeId
      );

      const overTask = state.tasks.find(
        (task) => task.id === overId
      );

      if (!activeTask || !overTask) {
        return state;
      }

      // Reorder only inside same column
      if (
        activeTask.status !==
        overTask.status
      ) {
        return state;
      }

      const columnTasks = state.tasks.filter(
        (task) =>
          task.status === activeTask.status
      );

      const oldIndex =
        columnTasks.findIndex(
          (task) => task.id === activeId
        );

      const newIndex =
        columnTasks.findIndex(
          (task) => task.id === overId
        );

      if (
        oldIndex === -1 ||
        newIndex === -1 ||
        oldIndex === newIndex
      ) {
        return state;
      }

      // Reorder only this column
      const reorderedColumn = arrayMove(
        columnTasks,
        oldIndex,
        newIndex
      );

      let columnIndex = 0;

      // Put reordered column tasks
      // back into the complete task array
      const newTasks = state.tasks.map(
        (task) => {
          if (
            task.status !==
            activeTask.status
          ) {
            return task;
          }

          return reorderedColumn[
            columnIndex++
          ];
        }
      );

      return {
        tasks: newTasks,
      };
    }),
}));