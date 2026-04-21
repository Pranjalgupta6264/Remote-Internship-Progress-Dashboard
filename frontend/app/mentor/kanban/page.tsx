'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Task } from '@/types';
import { AdvancedKanban } from '@/components/dashboard/Kanban/AdvancedKanban';

export default function MentorKanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const run = async () => {
      const response = await api.get('/tasks');
      setTasks(response.data);
    };
    void run();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mentor Kanban Board</h2>
        <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
          Drag cards between columns to update task status
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">To Do: {tasks.filter((t) => t.status === 'todo').length}</div>
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">In Progress: {tasks.filter((t) => t.status === 'in_progress').length}</div>
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">Review: {tasks.filter((t) => t.status === 'review').length}</div>
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">Done: {tasks.filter((t) => t.status === 'done').length}</div>
      </div>
      <AdvancedKanban initialTasks={tasks} />
    </div>
  );
}
