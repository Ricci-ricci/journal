import React, { forwardRef } from "react";

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
    const inputClasses = [
      "block w-full rounded-md border-0 py-1.5 bg-transparent text-foreground shadow-sm ring-1 ring-inset",
      error
        ? "ring-destructive placeholder:text-destructive/50 focus:ring-2 focus:ring-inset focus:ring-destructive"
        : "ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring",
      leftIcon ? "pl-10" : "px-3",
      rightIcon ? "pr-10" : "",
      "sm:text-sm sm:leading-6",
      "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
      className,
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium leading-6 text-foreground mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-muted-foreground sm:text-sm">
                {leftIcon}
              </span>
            </div>
          )}

          <input ref={ref} type={type} className={inputClasses} {...props} />

          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-muted-foreground sm:text-sm">
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
