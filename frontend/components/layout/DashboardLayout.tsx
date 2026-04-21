'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const {
    notifications,
    unreadCount,
    markOneRead,
    markAllRead,
  } = useNotifications();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar - Persistent and Role-based */}
      <Sidebar isOpen={isSidebarOpen} role={user.role} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar with Profile and Notifications */}
        <Navbar 
          user={user} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkOneRead={markOneRead}
          onMarkAllRead={markAllRead}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
