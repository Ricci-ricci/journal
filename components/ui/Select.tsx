import React, { forwardRef } from "react";

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
    const selectClasses = [
      "block w-full rounded-md border py-1.5 pl-3 pr-10",
      "bg-background text-foreground",
      "shadow-sm sm:text-sm sm:leading-6",
      "transition-colors",
      error
        ? "border-destructive focus:ring-2 focus:ring-inset focus:ring-destructive"
        : "border-border focus:ring-2 focus:ring-inset focus:ring-ring",
      "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium leading-6 text-foreground mb-2">
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
                className="bg-background text-foreground"
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
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

Select.displayName = "Select";
