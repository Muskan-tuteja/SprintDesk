import { useState } from "react";

interface Toast {
  id: number;
  message: string;
}

const TOAST_DURATION = 3000;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: number) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  };

  const showToast = (message: string) => {
    const id = Date.now();

    setToasts((current) => [
      ...current,
      {
        id,
        message,
      },
    ]);

    setTimeout(() => {
      removeToast(id);
    }, TOAST_DURATION);
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
}