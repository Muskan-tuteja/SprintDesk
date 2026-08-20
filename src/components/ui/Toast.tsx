
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success:
      "border-green-200 bg-green-50 text-green-700",
    error:
      "border-red-200 bg-red-50 text-red-700",
    info:
      "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className="fixed right-5 top-5 z-[100]">
      <div
        className={`flex min-w-[280px] items-center justify-between gap-4 rounded-lg border px-4 py-3 shadow-lg ${styles[type]}`}
        role="alert"
      >
        <p className="text-sm font-medium">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="text-lg font-bold opacity-70 hover:opacity-100"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Toast;

