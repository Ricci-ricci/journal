import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

/* Shared look for every text-like control (input, select, textarea). */
export const fieldClasses =
  "block w-full h-9 rounded-lg border border-input bg-background/60 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/70 transition-[color,border-color,box-shadow] hover:border-foreground/25 focus:outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/25 disabled:opacity-50 disabled:cursor-not-allowed";
export const fieldErrorClasses =
  "border-loss/70 focus:border-loss focus:ring-loss/25";
export const fieldLabelClasses =
  "block text-[13px] font-medium text-foreground mb-1.5";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      type = "text",
      ...props
    },
    ref,
  ) => {
    const inputClasses = cn(
      fieldClasses,
      error && fieldErrorClasses,
      leftIcon ? "pl-9" : "px-3",
      rightIcon && "pr-9",
      className,
    );

    return (
      <div className="w-full">
        {label && (
          <label className={fieldLabelClasses}>
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-muted-foreground">
                {leftIcon}
              </span>
            </div>
          )}

          <input ref={ref} type={type} className={inputClasses} {...props} />

          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-muted-foreground">
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-loss" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
