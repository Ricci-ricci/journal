"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/contexts/AccountsContext";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
      </svg>
    ),
  },
  {
    href: "/trades",
    label: "My Trades",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  },
  {
    href: "/journal",
    label: "Trading Journal",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    href: "/strategies",
    label: "Strategies",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    href: "/accounts",
    label: "Accounts",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
];

const quickActions: SidebarItem[] = [
  {
    href: "/trades/new",
    label: "New Trade",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    ),
  },
  {
    href: "/journal/new",
    label: "Add Journal Entry",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
];

const accountTypeDot: Record<string, string> = {
  LIVE: "bg-red-400",
  DEMO: "bg-yellow-400",
  PAPER: "bg-muted-foreground/60",
};

const accountTypeBadgeColor: Record<string, string> = {
  LIVE: "text-red-400",
  DEMO: "text-yellow-400",
  PAPER: "text-muted-foreground",
};

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  className = "",
  isCollapsed,
  onToggle,
}) => {
  const pathname = usePathname();
  const { accounts, activeAccount, activeAccountId, setActiveAccountId } =
    useAccounts();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActivePath = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div
      className={cn(
        "relative flex flex-col bg-sidebar border-r border-border transition-all duration-300 ease-in-out h-full",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* ── Logo header ── */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TJ</span>
            </div>
            <span className="ml-3 text-lg font-semibold text-foreground">
              Trading Journal
            </span>
          </Link>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">TJ</span>
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            "p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
            isCollapsed && "hidden",
          )}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Floating expand button (collapsed state) */}
      {isCollapsed && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 bg-card border border-border rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-10"
        >
          <svg
            className="w-3 h-3 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* ── Account Switcher ── */}
      {!isCollapsed ? (
        <div className="flex-shrink-0 px-2 pt-3 pb-2 border-b border-border relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  activeAccount
                    ? accountTypeDot[activeAccount.accountType]
                    : "bg-muted-foreground/40",
                )}
              />
              <div className="min-w-0 text-left">
                <p className="text-xs font-medium text-foreground truncate leading-tight">
                  {activeAccount ? activeAccount.name : "All Accounts"}
                </p>
                {activeAccount && (
                  <p className="text-xs text-muted-foreground leading-tight">
                    {formatCurrency(
                      activeAccount.currentBalance,
                      activeAccount.currency,
                    )}
                  </p>
                )}
              </div>
            </div>
            <svg
              className={cn(
                "w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-150",
                dropdownOpen && "rotate-180",
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute left-2 right-2 top-full mt-1 z-50 rounded-lg border border-border bg-card shadow-xl overflow-hidden">
              {/* All Accounts */}
              <button
                onClick={() => {
                  setActiveAccountId(null);
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-accent transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                <span
                  className={cn(
                    "flex-1 text-left",
                    !activeAccountId
                      ? "text-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  All Accounts
                </span>
                {!activeAccountId && (
                  <svg
                    className="w-3.5 h-3.5 text-blue-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              {accounts.length > 0 && <div className="h-px bg-border" />}

              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setActiveAccountId(acc.id);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-accent transition-colors"
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      accountTypeDot[acc.accountType],
                    )}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p
                      className={cn(
                        "truncate leading-tight",
                        activeAccountId === acc.id
                          ? "text-foreground font-medium"
                          : "text-foreground",
                      )}
                    >
                      {acc.name}
                    </p>
                    <p className="text-muted-foreground leading-tight flex items-center gap-1">
                      <span
                        className={cn(
                          "text-xs",
                          accountTypeBadgeColor[acc.accountType],
                        )}
                      >
                        {acc.accountType}
                      </span>
                      <span>·</span>
                      <span>
                        {formatCurrency(acc.currentBalance, acc.currency)}
                      </span>
                      {acc.totalPnL !== 0 && (
                        <span
                          className={
                            acc.totalPnL >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }
                        >
                          ({acc.totalPnL >= 0 ? "+" : ""}
                          {formatCurrency(acc.totalPnL, acc.currency)})
                        </span>
                      )}
                    </p>
                  </div>
                  {activeAccountId === acc.id && (
                    <svg
                      className="w-3.5 h-3.5 text-blue-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Collapsed: dot indicator */
        <div className="flex justify-center pt-2 pb-2.5 border-b border-border flex-shrink-0">
          <span
            title={activeAccount ? activeAccount.name : "All Accounts"}
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              activeAccount
                ? accountTypeDot[activeAccount.accountType]
                : "bg-muted-foreground/40",
            )}
          />
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = isActivePath(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md text-sm font-medium transition-colors",
                  isCollapsed ? "justify-center p-2" : "px-3 py-2",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <span
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive
                      ? "text-accent-foreground"
                      : "text-muted-foreground group-hover:text-accent-foreground",
                  )}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="ml-3 transition-opacity duration-200">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div
          className={cn(
            "pt-6 mt-6 border-t border-border",
            isCollapsed && "border-none pt-4 mt-4",
          )}
        >
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
          )}
          <div className="space-y-1">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                  isCollapsed ? "justify-center p-2" : "px-3 py-2",
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0 text-muted-foreground group-hover:text-accent-foreground transition-colors">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="ml-3 transition-opacity duration-200">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── User Profile ── */}
      <div
        className={cn(
          "flex-shrink-0 border-t border-border",
          isCollapsed ? "p-2" : "p-4",
        )}
      >
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3",
          )}
        >
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                DU
              </span>
            </div>
          </div>

          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Demo User
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  demo@journal.com
                </p>
              </div>
              <button className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring rounded-full transition-colors">
                <span className="sr-only">Open user menu</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
