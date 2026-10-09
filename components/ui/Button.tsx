import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-button hover:bg-primary/90",
  secondary:
    "bg-secondary text-secondary-foreground shadow-button hover:bg-accent",
  outline:
    "border border-input bg-card text-foreground shadow-xs hover:bg-accent",
  ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
  danger: "border border-loss/30 bg-loss/10 text-loss hover:bg-loss/20",
  success:
    "border border-profit/30 bg-profit/10 text-profit hover:bg-profit/20",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-[15px]",
};

export const buttonClasses = (
  variant: ButtonProps["variant"] = "primary",
  size: ButtonProps["size"] = "md",
  className?: string,
) =>
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin"
        />
      )}
      {children}
    </button>
  );
};
