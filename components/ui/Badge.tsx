import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";

  const variantClasses = {
    default: "bg-white/10 text-foreground ring-1 ring-white/15",
    success: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25",
    warning: "bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/25",
    danger: "bg-red-500/15 text-red-400 ring-1 ring-red-500/25",
    info: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/25",
    secondary: "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/25",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-sm",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return <span className={classes}>{children}</span>;
};
