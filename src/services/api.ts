import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { refreshAccessToken } from "./refreshApi";

export const api = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    try {
      const tokenData = await refreshAccessToken(refreshToken);

      // New access token memory me update
      useAuthStore
        .getState()
        .updateAccessToken(tokenData.accessToken);

      // New refresh token save
      localStorage.setItem(
        "refreshToken",
        tokenData.refreshToken
      );

      // Original request ko new token ke saath retry
      originalRequest.headers.Authorization =
        `Bearer ${tokenData.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();

      return Promise.reject(refreshError);
    }
  }
);