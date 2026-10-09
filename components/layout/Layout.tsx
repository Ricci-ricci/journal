"use client";

import React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
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
    <div className="h-dvh overflow-hidden flex bg-background">
      {showSidebar && (
        <div className="hidden lg:block flex-shrink-0 h-full">
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        </div>
      )}

      {/* Small screens: the same sidebar, as a drawer */}
      {showSidebar && isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60"
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
            className="relative m-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent"
          >
            <span className="sr-only">Close menu</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        {showSidebar && (
          <div className="lg:hidden flex-shrink-0 flex items-center justify-between h-14 pl-4 pr-2 border-b border-border">
            <Link href="/dashboard">
              <Wordmark />
            </Link>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <span className="sr-only">Open menu</span>
              <Menu className="h-5 w-5" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 pt-6 lg:pt-9 pb-16">
            {(title || headerRight) && (
              <header className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                {title && (
                  <h1 className="font-heading text-[32px] leading-none tracking-tight text-foreground">
                    {title}
                  </h1>
                )}
                {headerRight && (
                  <div className="w-full sm:w-64 sm:ml-auto flex-shrink-0">
                    {headerRight}
                  </div>
                )}
              </header>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export const SimpleLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-dvh bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {children}
    </div>
  );
};
