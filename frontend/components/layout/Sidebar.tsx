'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { useAuthStore } from '@/lib/store/authStore';
import { roleNavigation } from '@/lib/navigation';

interface SidebarProps {
  isOpen: boolean;
  role: UserRole;
}

export function Sidebar({ isOpen, role }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const items = roleNavigation[role] || [];

  return (
    <aside 
      className={cn(
        "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-40",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
          IF
        </div>
        {isOpen && <h1 className="font-bold text-xl tracking-tight">InternFlow</h1>}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-3 py-2 rounded-lg transition-colors group",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600 dark:text-indigo-400" : "group-hover:text-slate-900 dark:group-hover:text-white")} />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button onClick={logout} className={cn(
          "flex items-center gap-4 px-3 py-2 rounded-lg transition-colors w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10",
          !isOpen && "justify-center"
        )}>
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
