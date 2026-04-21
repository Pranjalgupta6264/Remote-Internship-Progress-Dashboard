'use client';

import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Task, User } from '@/types';
import { TaskPriority, TaskStatus } from '@/types';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function MentorTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [interns, setInterns] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assignee_id: '',
    due_date: '',
  });

  useEffect(() => {
    const run = async () => {
      try {
        const [tasksRes, usersRes] = await Promise.all([api.get('/tasks'), api.get('/users')]);
        setTasks(tasksRes.data);
        const internUsers = (usersRes.data as User[]).filter((user) => user.role === 'intern');
        setInterns(internUsers);
        if (internUsers.length > 0) {
          setForm((prev) => ({ ...prev, assignee_id: internUsers[0].id }));
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load tasks'));
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const createTask = async () => {
    if (!form.title.trim() || !form.assignee_id || !form.due_date) {
      setError('Title, assignee, and due date are required.');
      return;
    }
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post('/tasks', form);
      setTasks((prev) => [response.data, ...prev]);
      setForm((prev) => ({ ...prev, title: '', description: '' }));
      setSuccess('Task created successfully.');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to create task'));
    } finally {
      setCreating(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setSuccess('Task deleted successfully.');
      setError(null);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to delete task'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Assigned Tasks</h2>
        <p className="text-sm text-slate-500">Create and manage internship tasks.</p>
      </div>
      {loading && <StatusMessage tone="loading" message="Loading tasks..." />}
      {error && <StatusMessage tone="error" message={error} />}
      {success && <StatusMessage tone="success" message={success} />}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/30 md:grid-cols-6">
        <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Task title" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 md:col-span-2" />
        <select value={form.assignee_id} onChange={(e) => setForm((prev) => ({ ...prev, assignee_id: e.target.value }))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500">
          {interns.map((intern) => <option key={intern.id} value={intern.id}>{intern.full_name}</option>)}
        </select>
        <input type="date" value={form.due_date} onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500" />
        <select value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500">
          <option value={TaskPriority.LOW}>Low</option>
          <option value={TaskPriority.MEDIUM}>Medium</option>
          <option value={TaskPriority.HIGH}>High</option>
          <option value={TaskPriority.URGENT}>Urgent</option>
        </select>
        <button disabled={creating} onClick={() => void createTask()} className="rounded-lg bg-indigo-600 px-3 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60">{creating ? 'Creating...' : 'Create'}</button>
        <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description (optional)" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 md:col-span-6" />
      </div>
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Intern Progress Snapshot</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {interns.map((intern) => {
            const internTasks = tasks.filter((task) => task.assignee_id === intern.id);
            const done = internTasks.filter((task) => task.status === TaskStatus.DONE).length;
            const completion = internTasks.length ? Math.round((done / internTasks.length) * 100) : 0;
            return (
              <div key={intern.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                <p className="font-medium text-slate-800 dark:text-slate-100">{intern.full_name}</p>
                <p className="text-slate-500">{done}/{internTasks.length} tasks done ({completion}%)</p>
              </div>
            );
          })}
        </div>
      </div>
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-slate-500">No tasks yet.</div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
            <p className="text-sm text-slate-500 mt-1">{task.description || 'No description'}</p>
            <p className="text-xs text-slate-400 mt-2">Status: {task.status} | Due: {task.due_date}</p>
            <div className="mt-3">
              <button onClick={() => void deleteTask(task.id)} className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white">Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
