'use client';

import React from 'react';
import { Navigation } from './Navigation';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showSidebar = true,
  title
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - always visible */}
      <Navigation />

      <div className="flex">
        {/* Sidebar - conditionally rendered */}
        {showSidebar && (
          <div className="hidden lg:flex lg:flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page Header */}
          {title && (
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>
            </header>
          )}

          {/* Page Content */}
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

// Alternative layout for full-width content (like login pages)
export const SimpleLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {children}
    </div>
  );
};
