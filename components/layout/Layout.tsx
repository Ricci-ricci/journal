"use client";

import React from "react";
import { Navigation } from "./Navigation";
import { Sidebar } from "./Sidebar";

const SIDEBAR_STORAGE_KEY = "tj_sidebar_collapsed";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showSidebar = true,
  title,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState<boolean>(
    () => {
      if (typeof window === "undefined") return false;
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    },
  );

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      <div className="flex-shrink-0 z-20">
        <Navigation />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <div className="hidden lg:flex flex-shrink-0 h-full overflow-hidden">
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggle={toggleSidebar}
            />
          </div>
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          {title && (
            <header className="flex-shrink-0 bg-card border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              </div>
            </header>
          )}

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export const SimpleLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {children}
    </div>
  );
};
