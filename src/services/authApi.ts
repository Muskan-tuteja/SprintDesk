import { api } from "./api";
import type { LoginResponse, User } from "../types/auth";

interface LoginCredentials {
  username: string;
  password: string;
}

export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>("/auth/me");

  return response.data;
};