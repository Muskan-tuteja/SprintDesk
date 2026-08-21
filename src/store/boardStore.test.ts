import { describe, expect, it, beforeEach } from "vitest";
import {
  useBoardStore,
} from "./boardStore";

import type {
  BoardTask,
} from "../services/boardApi";

const task1: BoardTask = {
  id: 1,
  title: "First Task",
  completed: false,
  status: "todo",
  priority: "High",
  assignee: "Muskan",
  dueDate: "",
};

const task2: BoardTask = {
  id: 2,
  title: "Second Task",
  completed: false,
  status: "todo",
  priority: "Medium",
  assignee: "User",
  dueDate: "",
};

describe("Board Store", () => {
  beforeEach(() => {
    useBoardStore.setState({
      tasks: [],
    });
  });

  it("adds a task", () => {
    const store =
      useBoardStore.getState();

    store.addTask(task1);

    const tasks =
      useBoardStore.getState().tasks;

    expect(tasks).toHaveLength(1);

    expect(tasks[0]).toEqual(task1);
  });

  it("moves a task to another column", () => {
    useBoardStore.setState({
      tasks: [task1],
    });

    useBoardStore
      .getState()
      .moveTask(1, "in-progress");

    const task =
      useBoardStore
        .getState()
        .tasks.find(
          (item) => item.id === 1
        );

    expect(task?.status).toBe(
      "in-progress"
    );

    expect(task?.completed).toBe(false);
  });

  it("moves task to done and marks completed", () => {
    useBoardStore.setState({
      tasks: [task1],
    });

    useBoardStore
      .getState()
      .moveTask(1, "done");

    const task =
      useBoardStore
        .getState()
        .tasks.find(
          (item) => item.id === 1
        );

    expect(task?.status).toBe("done");

    expect(task?.completed).toBe(true);
  });

  it("deletes a task", () => {
    useBoardStore.setState({
      tasks: [task1, task2],
    });

    useBoardStore
      .getState()
      .deleteTask(1);

    const tasks =
      useBoardStore.getState().tasks;

    expect(tasks).toHaveLength(1);

    expect(tasks[0].id).toBe(2);
  });
});