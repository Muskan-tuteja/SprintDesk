
interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

function Skeleton({
  width = "w-full",
  height = "h-4",
  className = "",
  rounded = "md",
}: SkeletonProps) {
  const roundedStyles = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={`animate-pulse bg-slate-200 ${width} ${height} ${roundedStyles[rounded]} ${className}`}
      aria-hidden="true"
    />
  );
}

export default Skeleton;

