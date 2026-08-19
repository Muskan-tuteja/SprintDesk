
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "rounded-lg px-4 py-2.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  const variantStyles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    danger:
      "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

export default Button;

