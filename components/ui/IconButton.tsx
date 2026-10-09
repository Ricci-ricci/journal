"use client";

import React from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconButtonVariant =
  | "default"
  | "edit"
  | "delete"
  | "add"
  | "success"
  | "warning"
  | "close";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
}

/* Row actions stay quiet until hovered; only then does the meaning show. */
const quiet = "text-muted-foreground hover:bg-accent hover:text-foreground";
const variantClasses: Record<IconButtonVariant, string> = {
  default: quiet,
  edit: quiet,
  delete: "text-muted-foreground hover:bg-loss/10 hover:text-loss",
  add: "bg-primary text-primary-foreground shadow-button hover:bg-primary/90",
  success: "text-muted-foreground hover:bg-profit/10 hover:text-profit",
  warning: "text-muted-foreground hover:bg-warn/10 hover:text-warn",
  close: "text-muted-foreground hover:bg-profit/10 hover:text-profit",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const iconSizeClasses: Record<IconButtonSize, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const tooltipPositionClasses: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
  left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
  right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  tooltip,
  variant = "default",
  size = "md",
  loading = false,
  tooltipPosition = "top",
  className,
  disabled,
  ...props
}) => {
  return (
    <span className="group/tip relative inline-flex">
      <button
        type="button"
        aria-label={tooltip}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden
            className="h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin"
          />
        ) : (
          <span className={cn("inline-flex", iconSizeClasses[size])}>
            {icon}
          </span>
        )}
      </button>

      {tooltip && !disabled && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-foreground shadow-pop",
            "group-hover/tip:block group-focus-within/tip:block",
            tooltipPositionClasses[tooltipPosition],
          )}
        >
          {tooltip}
        </span>
      )}
    </span>
  );
};

// ─── Pre-built icon buttons ───────────────────────────────────────────────────

type Preset = Omit<IconButtonProps, "icon" | "variant">;
const full = "w-full h-full";

export const EditIconButton: React.FC<Preset> = (props) => (
  <IconButton
    variant="edit"
    tooltip="Edit"
    icon={<Pencil className={full} />}
    {...props}
  />
);

export const DeleteIconButton: React.FC<Preset> = (props) => (
  <IconButton
    variant="delete"
    tooltip="Delete"
    icon={<Trash2 className={full} />}
    {...props}
  />
);

export const ViewIconButton: React.FC<Preset> = (props) => (
  <IconButton
    variant="default"
    tooltip="View"
    icon={<Eye className={full} />}
    {...props}
  />
);

export const CloseTradeIconButton: React.FC<Preset> = (props) => (
  <IconButton
    variant="close"
    tooltip="Close Trade"
    icon={<Check className={full} />}
    {...props}
  />
);

export const ActivateIconButton: React.FC<Preset & { isActive: boolean }> = ({
  isActive,
  ...props
}) => (
  <IconButton
    variant={isActive ? "warning" : "success"}
    tooltip={isActive ? "Deactivate" : "Activate"}
    icon={<Power className={full} />}
    {...props}
  />
);

export const ExpandIconButton: React.FC<Preset & { isExpanded: boolean }> = ({
  isExpanded,
  ...props
}) => (
  <IconButton
    variant="default"
    tooltip={isExpanded ? "Collapse" : "Expand"}
    icon={
      isExpanded ? <ChevronUp className={full} /> : <ChevronDown className={full} />
    }
    {...props}
  />
);
