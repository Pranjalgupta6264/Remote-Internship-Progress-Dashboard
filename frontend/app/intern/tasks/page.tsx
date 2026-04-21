'use client';
import { useEffect, useMemo, useState } from 'react';
import { CheckSquare, Clock, Flag, Filter } from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';
import { Task } from '@/types';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function InternTasksPage() {
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await api.get('/tasks');
        setTasks(response.data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load tasks'));
      } finally {
        setLoading(false);
      }
    };
    void loadTasks();
  }, []);

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    const previousTasks = tasks;
    setUpdatingTaskId(taskId);
    setError(null);
    setSuccess(null);
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setSuccess('Task status updated.');
    } catch (err: unknown) {
      setTasks(previousTasks);
      setError(getApiErrorMessage(err, 'Failed to update task status'));
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = useMemo(() => (
    filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
  ), [tasks, filter]);

  const getStatusBadge = (status: string) => {
    const config = {
      todo: { label: 'To Do', className: 'bg-gray-500/20 text-gray-400' },
      in_progress: { label: 'In Progress', className: 'bg-yellow-500/20 text-yellow-400' },
      review: { label: 'Review', className: 'bg-purple-500/20 text-purple-400' },
      done: { label: 'Done', className: 'bg-green-500/20 text-green-400' },
    };
    return config[status as keyof typeof config] || config.todo;
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { label: 'Low', className: 'bg-green-500/20 text-green-400' },
      medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400' },
      high: { label: 'High', className: 'bg-red-500/20 text-red-400' },
    };
    return config[priority as keyof typeof config] || config.medium;
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === 'done').length,
    inProgress: tasks.filter((task) => task.status === 'in_progress').length,
    pending: tasks.filter((task) => task.status === 'todo').length,
  };

  return (
    <div>
      {loading && <StatusMessage tone="loading" message="Loading tasks..." className="mb-4 max-w-sm" />}
      {error && <StatusMessage tone="error" message={error} className="mb-4" />}
      {success && <StatusMessage tone="success" message={success} className="mb-4" />}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Tasks</h2>
        <div className="flex gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-dark-3 border border-white/10 rounded-lg px-3 py-1 text-white text-sm"
          >
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-gray-400 text-xs">Total</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          <p className="text-gray-400 text-xs">Completed</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
          <p className="text-gray-400 text-xs">In Progress</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-gray-400">{stats.pending}</p>
          <p className="text-gray-400 text-xs">Pending</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const statusBadge = getStatusBadge(task.status);
          const priorityBadge = getPriorityBadge(task.priority);
          const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'done';
          const dueSoonDate = new Date();
          dueSoonDate.setDate(dueSoonDate.getDate() + 3);
          const isDueSoon = new Date(task.due_date) <= dueSoonDate && !isOverdue && task.status !== 'done';

          return (
            <div key={task.id} className="glass-card p-4 hover:border-white/20 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare size={16} className={task.status === 'done' ? 'text-green-400' : 'text-gray-400'} />
                    <h3 className="text-white font-medium">{task.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${priorityBadge.className}`}>
                      {priorityBadge.label}
                    </span>
                    {isOverdue && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                        Overdue
                      </span>
                    )}
                    {isDueSoon && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        Due Soon
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{task.description || 'No description'}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Due: {task.due_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flag size={12} />
                      Mentor ID: {task.mentor_id.slice(0, 8)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {task.status !== 'done' && (
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                      disabled={updatingTaskId === task.id}
                      className="bg-dark-3 border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No tasks found</p>
        </div>
      )}
    </div>
  );
}