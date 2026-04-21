'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Menu, 
  Search, 
  ChevronDown,
  User as UserIcon
} from 'lucide-react';
import { Notification, User } from '@/types';
import { useAuthStore } from '@/lib/store/authStore';

interface NavbarProps {
  user: User;
  toggleSidebar: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkOneRead: (notificationId: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
}

export function Navbar({
  user,
  toggleSidebar,
  notifications,
  unreadCount,
  onMarkOneRead,
  onMarkAllRead,
}: NavbarProps) {
  const { logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate initials for avatar
  const initials = user.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 w-64 lg:w-96">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tasks, reports..." 
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 px-1 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 text-[10px] leading-3 font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Notifications</h3>
                <button onClick={() => void onMarkAllRead()} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Mark all read</button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-500">No notifications yet.</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {notifications.slice(0, 10).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => void onMarkOneRead(item.id)}
                      className={`w-full text-left text-sm p-3 rounded-lg border transition ${
                        item.is_read
                          ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                          : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">{item.type.replace(/_/g, ' ')}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">{item.message}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900 shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">{user.full_name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-tighter mt-1 font-bold">{user.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 animate-in fade-in slide-in-from-top-2">
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <UserIcon className="w-4 h-4" /> Profile Settings
              </button>
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1 mx-2" />
              <button 
                onClick={logout}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
