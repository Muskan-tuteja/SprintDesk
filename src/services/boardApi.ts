import axios from "axios";

const boardApi = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});

export interface BoardTask {
  id: number;
  title: string;
  completed: boolean;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "Low" | "Medium" | "High";
  assignee: string;
  dueDate: string;
}

export const fetchTasks = async (): Promise<BoardTask[]> => {
  const response = await boardApi.get("/todos?_limit=30");

  return response.data.map(
    (task: {
      id: number;
      title: string;
      completed: boolean;
    }) => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
      status: task.completed ? "done" : "todo",
      priority: "Medium",
      assignee: "Unassigned",
      dueDate: "",
    })
  );
};