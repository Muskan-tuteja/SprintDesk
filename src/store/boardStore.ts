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

const STORAGE_KEY = "sprint-board-tasks";

const saveTasks = (tasks: BoardTask[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(tasks)
    );
  } catch (error) {
    console.error(
      "Failed to save tasks:",
      error
    );
  }
};

const getSavedTasks = (): BoardTask[] => {
  try {
    const savedTasks =
      localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {
      return [];
    }

    return JSON.parse(savedTasks);
  } catch (error) {
    console.error(
      "Failed to load saved tasks:",
      error
    );

    return [];
  }
};

export const useBoardStore = create<BoardState>(
  (set) => ({
    // Load tasks from localStorage when store starts
    tasks: getSavedTasks(),

    // =========================
    // SET TASKS
    // =========================

    setTasks: (tasks) =>
      set((state) => {
        /*
         * Important:
         * API se tasks tabhi set honge
         * jab localStorage empty ho.
         */
        const savedTasks = getSavedTasks();

        if (savedTasks.length > 0) {
          return state;
        }

        saveTasks(tasks);

        return {
          tasks,
        };
      }),

    // =========================
    // ADD TASK
    // =========================

    addTask: (task) =>
      set((state) => {
        const newTasks = [
          ...state.tasks,
          task,
        ];

        saveTasks(newTasks);

        return {
          tasks: newTasks,
        };
      }),

    // =========================
    // UPDATE TASK
    // =========================

    updateTask: (id, updates) =>
      set((state) => {
        const newTasks = state.tasks.map(
          (task) =>
            task.id === id
              ? {
                  ...task,
                  ...updates,
                }
              : task
        );

        saveTasks(newTasks);

        return {
          tasks: newTasks,
        };
      }),

    // =========================
    // DELETE TASK
    // =========================

    deleteTask: (id) =>
      set((state) => {
        const newTasks =
          state.tasks.filter(
            (task) => task.id !== id
          );

        saveTasks(newTasks);

        return {
          tasks: newTasks,
        };
      }),

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

        if (task.status === status) {
          return state;
        }

        const remainingTasks =
          state.tasks.filter(
            (item) => item.id !== taskId
          );

        const movedTask: BoardTask = {
          ...task,
          status,
          completed:
            status === "done",
        };

        let insertIndex =
          remainingTasks.length;

        for (
          let i =
            remainingTasks.length - 1;
          i >= 0;
          i--
        ) {
          if (
            remainingTasks[i].status ===
            status
          ) {
            insertIndex = i + 1;
            break;
          }
        }

        const newTasks = [
          ...remainingTasks,
        ];

        newTasks.splice(
          insertIndex,
          0,
          movedTask
        );

        saveTasks(newTasks);

        return {
          tasks: newTasks,
        };
      }),

    // =========================
    // REORDER SAME COLUMN
    // =========================

    reorderTasks: (activeId, overId) =>
      set((state) => {
        const activeTask =
          state.tasks.find(
            (task) =>
              task.id === activeId
          );

        const overTask =
          state.tasks.find(
            (task) =>
              task.id === overId
          );

        if (
          !activeTask ||
          !overTask
        ) {
          return state;
        }

        if (
          activeTask.status !==
          overTask.status
        ) {
          return state;
        }

        const columnTasks =
          state.tasks.filter(
            (task) =>
              task.status ===
              activeTask.status
          );

        const oldIndex =
          columnTasks.findIndex(
            (task) =>
              task.id === activeId
          );

        const newIndex =
          columnTasks.findIndex(
            (task) =>
              task.id === overId
          );

        if (
          oldIndex === -1 ||
          newIndex === -1 ||
          oldIndex === newIndex
        ) {
          return state;
        }

        const reorderedColumn =
          arrayMove(
            columnTasks,
            oldIndex,
            newIndex
          );

        let columnIndex = 0;

        const newTasks =
          state.tasks.map(
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

        saveTasks(newTasks);

        return {
          tasks: newTasks,
        };
      }),
  })
);