"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Check,
  ChevronsUpDown,
  FlaskConical,
  LayoutGrid,
  LineChart,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Target,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/contexts/AccountsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Wordmark } from "./Wordmark";

interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const sidebarGroups: SidebarItem[][] = [
  [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/trades", label: "Trades", icon: LineChart },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/strategies", label: "Strategies", icon: Target },
    { href: "/backtest", label: "Backtest", icon: FlaskConical },
  ],
  [
    { href: "/accounts", label: "Accounts", icon: Wallet },
    { href: "/feed", label: "Feed", icon: Users },
  ],
];

const initialsOf = (name?: string | null, email?: string | null): string => {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0];
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "–";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
};

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  onToggle: () => void;
  /* Called after a link is followed — lets the mobile drawer close itself. */
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  className = "",
  isCollapsed,
  onToggle,
  onNavigate,
}) => {
  const pathname = usePathname();
  const { accounts, activeAccount, activeAccountId, setActiveAccountId } =
    useAccounts();
  const { user, logout } = useAuth();
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

  const selectAccount = (id: string | null) => {
    setActiveAccountId(id);
    setDropdownOpen(false);
  };

  const itemClasses = (active: boolean) =>
    cn(
      "flex items-center gap-2.5 rounded-md text-sm transition-colors",
      isCollapsed ? "justify-center h-9 w-9 mx-auto" : "h-8 px-2.5",
      active
        ? "bg-sidebar-accent text-foreground font-medium"
        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
    );

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-[width] duration-200",
        isCollapsed ? "w-14" : "w-60",
        className,
      )}
    >
      {/* ── Wordmark + collapse ── */}
      <div
        className={cn(
          "flex items-center h-14 flex-shrink-0",
          isCollapsed ? "justify-center" : "justify-between pl-4 pr-2",
        )}
      >
        {!isCollapsed && (
          <Link href="/dashboard" onClick={onNavigate}>
            <Wordmark />
          </Link>
        )}
        <button
          onClick={onToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* ── Account switcher ── */}
      {!isCollapsed && (
        <div className="relative flex-shrink-0 px-2 pb-2">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
            className="w-full flex items-center justify-between gap-2 rounded-md border border-sidebar-border px-2.5 py-2 text-left hover:bg-sidebar-accent/60 transition-colors"
          >
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-foreground truncate">
                {activeAccount ? activeAccount.name : "All accounts"}
              </span>
              <span className="block text-xs text-muted-foreground truncate">
                {activeAccount ? (
                  <>
                    <span className="num">
                      {formatCurrency(
                        activeAccount.currentBalance,
                        activeAccount.currency,
                      )}
                    </span>{" "}
                    · {activeAccount.accountType.toLowerCase()}
                  </>
                ) : (
                  `${accounts.length} account${accounts.length !== 1 ? "s" : ""}`
                )}
              </span>
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute left-2 right-2 top-full z-50 -mt-1 max-h-80 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg shadow-black/30">
                <button
                  onClick={() => selectAccount(null)}
                  className="w-full flex items-center justify-between gap-2 rounded px-2 py-1.5 text-[13px] text-left hover:bg-accent transition-colors"
                >
                  <span className="text-foreground">All accounts</span>
                  {!activeAccountId && (
                    <Check className="h-3.5 w-3.5 text-foreground flex-shrink-0" />
                  )}
                </button>

                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => selectAccount(acc.id)}
                    className="w-full flex items-center justify-between gap-2 rounded px-2 py-1.5 text-left hover:bg-accent transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="block text-[13px] text-foreground truncate">
                        {acc.name}
                      </span>
                      <span className="block text-xs text-muted-foreground truncate">
                        <span className="num">
                          {formatCurrency(acc.currentBalance, acc.currency)}
                        </span>{" "}
                        · {acc.accountType.toLowerCase()}
                        {acc.totalPnL !== 0 && (
                          <span
                            className={cn(
                              "num ml-1.5",
                              acc.totalPnL >= 0 ? "text-profit" : "text-loss",
                            )}
                          >
                            {acc.totalPnL >= 0 ? "+" : ""}
                            {formatCurrency(acc.totalPnL, acc.currency)}
                          </span>
                        )}
                      </span>
                    </span>
                    {activeAccountId === acc.id && (
                      <Check className="h-3.5 w-3.5 text-foreground flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
        <Link
          href="/trades/new"
          onClick={onNavigate}
          title={isCollapsed ? "New trade" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/85 transition-colors mb-3",
            isCollapsed ? "justify-center h-9 w-9 mx-auto" : "h-8 px-2.5",
          )}
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && "New trade"}
        </Link>

        {sidebarGroups.map((group, i) => (
          <div
            key={i}
            className={cn(
              "space-y-0.5",
              i > 0 && "mt-3 pt-3 border-t border-sidebar-border",
            )}
          >
            {group.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                title={isCollapsed ? label : undefined}
                className={itemClasses(isActivePath(href))}
              >
                <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
                {!isCollapsed && label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* ── User ── */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center gap-2.5 border-t border-sidebar-border",
          isCollapsed ? "justify-center py-3" : "px-3 py-3",
        )}
      >
        <span
          title={user?.email ?? undefined}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-[11px] font-medium text-foreground"
        >
          {initialsOf(user?.name, user?.email)}
        </span>

        {!isCollapsed && (
          <>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] text-foreground truncate">
                {user?.name ?? user?.email ?? "My account"}
              </span>
              {user?.name && (
                <span className="block text-xs text-muted-foreground truncate">
                  {user.email}
                </span>
              )}
            </span>
            <button
              onClick={logout}
              title="Sign out"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
            >
              <span className="sr-only">Sign out</span>
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
};
