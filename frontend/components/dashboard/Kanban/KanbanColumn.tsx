'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanTaskCard } from './KanbanTaskCard';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { Plus, LayoutPanelTop, Ghost } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
    },
  });

  return (
    <div 
      className={cn(
        "flex flex-col w-80 rounded-3xl border transition-all duration-300",
        "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/50 backdrop-blur-sm",
        isOver && "bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50 ring-2 ring-indigo-500/20 shadow-inner"
      )}
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center">
            <LayoutPanelTop className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 capitalize leading-none">{title}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">{tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 p-3 flex flex-col gap-4 min-h-[500px]"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && !isOver && (
          <div className="mt-8 flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-4">
              <Ghost className="w-8 h-8 text-slate-300 dark:text-slate-700" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">No tasks in {title}</p>
            <p className="text-[10px] text-slate-500 mt-1">Drag a task here to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
