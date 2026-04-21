import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm", className)}>
      {title && (
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
