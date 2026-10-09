import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldClasses, fieldErrorClasses, fieldLabelClasses } from "./Input";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      className = "",
      ...props
    },
    ref,
  ) => {
    const selectClasses = cn(
      fieldClasses,
      "appearance-none pl-3 pr-9",
      error && fieldErrorClasses,
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
          <select ref={ref} className={selectClasses} {...props}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-popover text-foreground"
              >
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
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

Select.displayName = "Select";
