import axios from "axios";

export interface NotificationPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const notificationApi = axios.create({
  baseURL:
    "https://jsonplaceholder.typicode.com",
});

export const fetchNotificationPosts =
  async (): Promise<NotificationPost[]> => {
    const response =
      await notificationApi.get<NotificationPost[]>(
        "/posts?_limit=5"
      );

    return response.data;
  };