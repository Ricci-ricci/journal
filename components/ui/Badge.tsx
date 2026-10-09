import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/* Quiet tags: tinted text on a faint wash. Only gain/loss/warn carry colour. */
const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-muted text-muted-foreground",
  secondary: "bg-muted text-muted-foreground",
  info: "bg-muted text-foreground",
  success: "bg-profit/10 text-profit",
  warning: "bg-warn/10 text-warn",
  danger: "bg-loss/10 text-loss",
};

const sizeClasses: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-1.5 py-px text-[11px]",
  md: "px-1.5 py-0.5 text-xs",
  lg: "px-2 py-0.5 text-[13px]",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded font-medium whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  );
};
