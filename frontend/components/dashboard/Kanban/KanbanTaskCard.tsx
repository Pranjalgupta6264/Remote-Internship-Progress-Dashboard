'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskPriority } from '@/types';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  MoreHorizontal, 
  Paperclip,
  Flag,
  Clock
} from 'lucide-react';

interface KanbanTaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

const priorityColors = {
  [TaskPriority.LOW]: "text-blue-500 bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30",
  [TaskPriority.MEDIUM]: "text-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30",
  [TaskPriority.HIGH]: "text-orange-500 bg-orange-50/50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30",
  [TaskPriority.URGENT]: "text-red-500 bg-red-50/50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30",
};

export function KanbanTaskCard({ task, isOverlay }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className="opacity-20 border-2 border-dashed border-indigo-400 h-[120px] rounded-2xl bg-slate-100 dark:bg-slate-800/50"
      />
    );
  }

  const initials = task.assignee?.full_name
    ? task.assignee.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '??';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group p-4 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing relative",
        "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm",
        "hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-1",
        isOverlay && "opacity-90 shadow-2xl border-indigo-400 rotate-2 z-50 scale-105"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={cn(
          "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border",
          priorityColors[task.priority]
        )}>
          <Flag className="w-3 h-3" />
          {task.priority}
        </span>
        <button className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <h4 className="font-bold text-[15px] text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
        {task.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
            {initials}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> 2
            </div>
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" /> 1
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
          <Clock className="w-3 h-3 text-indigo-500" />
          <span>{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
