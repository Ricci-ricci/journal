"use client";

import React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Wordmark } from "./Wordmark";

const SIDEBAR_STORAGE_KEY = "tj_sidebar_collapsed";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  title?: string;
  /* Optional content pinned to the top-right of the page header (e.g. a search box). */
  headerRight?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showSidebar = true,
  title,
  headerRight,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState<boolean>(
    () => {
      if (typeof window === "undefined") return false;
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    },
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="h-dvh overflow-hidden flex bg-sidebar">
      {showSidebar && (
        <div className="hidden lg:block flex-shrink-0 h-full">
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        </div>
      )}

      {/* Small screens: the same sidebar, as a drawer */}
      {showSidebar && isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative h-full animate-in slide-in-from-left duration-200">
            <Sidebar
              isCollapsed={false}
              onToggle={() => setIsDrawerOpen(false)}
              onNavigate={() => setIsDrawerOpen(false)}
            />
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="relative m-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-accent"
          >
            <span className="sr-only">Close menu</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* The page sits on a raised sheet beside the sidebar. */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 bg-background overflow-hidden",
          showSidebar &&
            "lg:my-2 lg:mr-2 lg:rounded-2xl lg:border lg:border-border lg:shadow-card",
        )}
      >
        {(showSidebar || title || headerRight) && (
          <header className="flex-shrink-0 flex items-center gap-3 h-14 px-4 sm:px-6 lg:px-8 border-b border-border bg-card/40">
            {showSidebar && (
              <Link href="/dashboard" className="lg:hidden flex-shrink-0">
                <Wordmark markOnly />
              </Link>
            )}
            {title && (
              <h1 className="font-heading text-[15px] leading-none text-foreground truncate">
                {title}
              </h1>
            )}
            <div className="ml-auto flex items-center gap-2 min-w-0">
              {headerRight && (
                <div className="w-40 sm:w-72 min-w-0">{headerRight}</div>
              )}
              {showSidebar && (
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="lg:hidden inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <span className="sr-only">Open menu</span>
                  <Menu className="h-5 w-5" />
                </button>
              )}
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto glow">
          <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
