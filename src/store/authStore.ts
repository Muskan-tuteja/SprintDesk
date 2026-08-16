import { create } from "zustand";
import type { User } from "../types/auth";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  setAuth: (accessToken: string, user: User) => void;
  updateAccessToken: (accessToken: string) => void;
  setInitializing: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  // Initial session checking
  isInitializing: true,

  setAuth: (accessToken, user) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
    }),

  updateAccessToken: (accessToken) =>
    set({
      accessToken,
      isAuthenticated: true,
    }),

  setInitializing: (value) =>
    set({
      isInitializing: value,
    }),

  logout: () => {
    localStorage.removeItem("refreshToken");

    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  },
}));