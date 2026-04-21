'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import api, { getApiErrorMessage } from '@/lib/api';
import { Task, Report, User } from '@/types';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function MentorDashboard() {
  const [interns, setInterns] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, tasksRes, reportsRes] = await Promise.all([
          api.get('/users'),
          api.get('/tasks'),
          api.get('/reports')
        ]);
        setInterns(usersRes.data.filter((u: User) => u.role === 'intern'));
        setTasks(tasksRes.data);
        setReports(reportsRes.data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load mentor dashboard data.'));
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  const stats = [
    { label: 'Assigned Interns', value: interns.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Reviews', value: reports.filter(r => r.status === 'submitted').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Tasks Completed', value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Overdue Tasks', value: tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'done').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  if (isLoading) return <div className="p-8">Loading mentor dashboard...</div>;

  return (
    <div className="space-y-8">
        {error && <StatusMessage tone="error" message={error} />}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Mentor Console</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your interns and track their weekly performance.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/mentor/analytics" className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl text-slate-700 dark:text-slate-300">
              View Analytics
            </Link>
            <Link href="/mentor/tasks" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95">
              <Plus className="w-5 h-5" /> Create Task
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${stat.bg} dark:bg-slate-800`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reports Table */}
          <Card title="Recent Report Submissions">
            <div className="space-y-4">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 font-bold">
                      W{report.week_number}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Week {report.week_number} Report</p>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter mt-0.5">{report.status}</p>
                    </div>
                  </div>
                  <Link href={`/mentor/reports/${report.id}`} className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all group">
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  </Link>
                </div>
              ))}
              {reports.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No reports submitted yet.</p>}
            </div>
          </Card>

          {/* Active Interns List */}
          <Card title="Assigned Interns">
            <div className="grid grid-cols-1 gap-4">
              {interns.map((intern) => (
                <div key={intern.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold">
                      {intern.full_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{intern.full_name}</p>
                      <p className="text-xs text-slate-500">{intern.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 text-[10px] font-bold uppercase rounded-full">Active</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
    </div>
  );
}
