'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Report, Task, User, UserRole } from '@/types';
import api, { getAdminAnalytics, getApiErrorMessage } from '@/lib/api';
import { 
  Shield, 
  Users, 
  Settings, 
  Database,
  Search,
  MoreVertical,
  Activity
} from 'lucide-react';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<{ users: { total: number }; tasks: { total: number }; reports: { total: number } } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [usersRes, tasksRes, reportsRes, analyticsRes] = await Promise.all([
          api.get('/users'),
          api.get('/tasks'),
          api.get('/reports'),
          getAdminAnalytics(),
        ]);
        setUsers(usersRes.data);
        setTasks(tasksRes.data);
        setReports(reportsRes.data);
        setAnalytics(analyticsRes);
      } catch (error) {
        setError(getApiErrorMessage(error, 'Error fetching admin data'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const stats = [
    { label: 'Total Users', value: analytics?.users.total ?? users.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'System Health', value: '99.9%', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Tasks', value: analytics?.tasks.total ?? tasks.length, icon: Database, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Reports', value: analytics?.reports.total ?? reports.length, icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  if (isLoading) return <StatusMessage tone="loading" message="Initializing Admin Console..." className="max-w-sm" />;

  return (
    <div className="space-y-8">
          {error && <StatusMessage tone="error" message={error} />}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-xl">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Console</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage system configurations and user access.</p>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="flex items-center gap-4 border-none shadow-sm dark:bg-slate-900">
                <div className={`p-3 rounded-2xl ${stat.bg} dark:bg-slate-800`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* User Management Table */}
          <Card title="User Management" className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter users..." 
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all active:scale-95 shadow-md">
                Add New User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-4 pt-2 text-xs font-bold text-slate-400 uppercase tracking-tighter w-1/3">User</th>
                    <th className="pb-4 pt-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">Role</th>
                    <th className="pb-4 pt-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">Status</th>
                    <th className="pb-4 pt-2 text-xs font-bold text-slate-400 uppercase tracking-tighter text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {users.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                            {user.full_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{user.full_name}</p>
                            <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                          user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                          user.role === UserRole.MENTOR ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{user.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-all">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="System Activity Monitor" className="border-none shadow-sm dark:bg-slate-900">
            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : (
              <div className="space-y-3 text-sm">
                <p className="text-slate-500">Recent reports: {reports.slice(-5).length} entries</p>
                {reports.slice(-5).reverse().map((report) => (
                  <div key={report.id} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100">Report week {report.week_number}</span>
                    <span className="ml-2 text-slate-500">status: {report.status}</span>
                  </div>
                ))}
                <p className="pt-2 text-slate-500">Recent tasks: {tasks.slice(-3).length} entries</p>
                {tasks.slice(-3).reverse().map((task) => (
                  <div key={task.id} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{task.title}</span>
                    <span className="ml-2 text-slate-500">({task.status})</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
    </div>
  );
}
