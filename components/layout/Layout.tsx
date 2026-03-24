"use client";

import React, { useState, useEffect } from "react";
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
  // Read the persisted state immediately from localStorage to avoid flicker
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });

  // Whenever the collapsed state changes, save it so it survives navigation
  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    // h-screen + overflow-hidden keep the viewport locked; only the inner
    // main area scrolls, so the sidebar and nav never move.
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      {/* ── Top navigation bar ── always visible, never scrolls ── */}
      <div className="flex-shrink-0 z-20">
        <Navigation />
      </div>

      {/* ── Body below the nav bar ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── full height, its own scroll if needed ── */}
        {showSidebar && (
          <div className="hidden lg:flex flex-shrink-0 h-full overflow-hidden">
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggle={toggleSidebar}
            />
          </div>
        )}

        {/* ── Main content ── this is the ONLY thing that scrolls ── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Optional page title bar */}
          {title && (
            <header className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>
            </header>
          )}

          {/* Scrollable page body */}
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

// Simple full-page layout for login / onboarding screens
export const SimpleLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {children}
    </div>
  );
};
