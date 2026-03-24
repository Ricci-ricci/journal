"use client";

import React, { useState } from "react";

type IconButtonVariant =
  | "default"
  | "edit"
  | "delete"
  | "add"
  | "success"
  | "warning";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
}

const variantClasses: Record<IconButtonVariant, string> = {
  default:
    "bg-card text-muted-foreground border border-border hover:bg-accent hover:text-foreground",
  edit: "bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/50",
  delete:
    "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50",
  add: "bg-blue-600 text-white border border-blue-600 hover:bg-blue-500 hover:border-blue-500",
  success:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/50",
  warning:
    "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 hover:text-yellow-300 hover:border-yellow-500/50",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-11 h-11",
};

const iconSizeClasses: Record<IconButtonSize, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const tooltipPositionClasses: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const tooltipArrowClasses: Record<string, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent border-4",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent border-4",
  left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent border-4",
  right:
    "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent border-4",
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  tooltip,
  variant = "default",
  size = "md",
  loading = false,
  tooltipPosition = "top",
  className = "",
  disabled,
  ...props
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex items-center justify-center">
      <button
        type="button"
        disabled={disabled || loading}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={[
          "relative inline-flex items-center justify-center rounded-lg transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-background focus:ring-ring",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading ? (
          <svg
            className={`animate-spin ${iconSizeClasses[size]}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <span className={iconSizeClasses[size]}>{icon}</span>
        )}
      </button>

      {/* Tooltip */}
      {tooltip && showTooltip && !disabled && (
        <div
          className={[
            "absolute z-50 pointer-events-none",
            tooltipPositionClasses[tooltipPosition],
          ].join(" ")}
        >
          <div className="relative bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg border border-white/10">
            {tooltip}
            <span
              className={[
                "absolute",
                tooltipArrowClasses[tooltipPosition],
              ].join(" ")}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Pre-built icon buttons ───────────────────────────────────────────────────

export const EditIconButton: React.FC<
  Omit<IconButtonProps, "icon" | "variant">
> = (props) => (
  <IconButton
    variant="edit"
    tooltip="Edit"
    icon={
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="w-full h-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
             m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    }
    {...props}
  />
);

export const DeleteIconButton: React.FC<
  Omit<IconButtonProps, "icon" | "variant">
> = (props) => (
  <IconButton
    variant="delete"
    tooltip="Delete"
    icon={
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="w-full h-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
             m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    }
    {...props}
  />
);

export const AddIconButton: React.FC<
  Omit<IconButtonProps, "icon" | "variant">
> = (props) => (
  <IconButton
    variant="add"
    tooltip="Add"
    icon={
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="w-full h-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    }
    {...props}
  />
);

export const ViewIconButton: React.FC<
  Omit<IconButtonProps, "icon" | "variant">
> = (props) => (
  <IconButton
    variant="default"
    tooltip="View"
    icon={
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="w-full h-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5
             c4.478 0 8.268 2.943 9.542 7
             -1.274 4.057-5.064 7-9.542 7
             -4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    }
    {...props}
  />
);

export const ActivateIconButton: React.FC<
  Omit<IconButtonProps, "icon" | "variant"> & { isActive: boolean }
> = ({ isActive, ...props }) => (
  <IconButton
    variant={isActive ? "warning" : "success"}
    tooltip={isActive ? "Deactivate" : "Activate"}
    icon={
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="w-full h-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
        />
      </svg>
    }
    {...props}
  />
);

export const ExpandIconButton: React.FC<
  Omit<IconButtonProps, "icon" | "variant"> & { isExpanded: boolean }
> = ({ isExpanded, ...props }) => (
  <IconButton
    variant="default"
    tooltip={isExpanded ? "Collapse" : "Expand"}
    icon={
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="w-full h-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
        />
      </svg>
    }
    {...props}
  />
);
