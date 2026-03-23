import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    type = 'text',
    ...props
  }, ref) => {
    const inputClasses = `
      block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset
      ${error
        ? 'ring-red-300 placeholder:text-red-400 focus:ring-2 focus:ring-inset focus:ring-red-500'
        : 'ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600'
      }
      ${leftIcon ? 'pl-10' : 'px-3'}
      ${rightIcon ? 'pr-10' : ''}
      sm:text-sm sm:leading-6
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">{leftIcon}</span>
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={inputClasses}
            {...props}
          />

          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">{rightIcon}</span>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
