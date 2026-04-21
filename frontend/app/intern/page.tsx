'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { AdvancedKanban } from '@/components/dashboard/Kanban/AdvancedKanban';
import { Task, Report, Feedback } from '@/types';
import api, { getApiErrorMessage, getInternAnalytics } from '@/lib/api';
import { 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  Award,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function InternDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completionRate, setCompletionRate] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, reportsRes, feedbackRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/reports'),
          api.get('/feedback')
        ]);
        setTasks(tasksRes.data);
        setReports(reportsRes.data);
        setRecentFeedback(feedbackRes.data);
        const analytics = await getInternAnalytics();
        setCompletionRate(Math.round(analytics.tasks.completion_rate));
      } catch (error) {
        setError(getApiErrorMessage(error, 'Could not load some dashboard sections.'));
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  const stats = [
    { label: 'Tasks Done', value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Due Soon', value: 0, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Reports Sent', value: reports.length, icon: Award, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Productivity', value: `${completionRate}%`, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const dueSoonCount = useMemo(() => {
    const dueSoonDate = new Date();
    dueSoonDate.setDate(dueSoonDate.getDate() + 3);
    return tasks.filter((task) => task.status !== 'done' && new Date(task.due_date) <= dueSoonDate).length;
  }, [tasks]);

  stats[1].value = dueSoonCount;

  if (isLoading) return (
    <div className="space-y-8 p-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-4 gap-6">
        <Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-[500px] rounded-3xl" />
    </div>
  );

  return (
    <div className="space-y-10 pb-10">
          {error && <StatusMessage tone="error" message={error} />}
          {/* Header Section */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                Intern Dashboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg">
                Track your progress, manage tasks, and submit weekly reflections.
              </p>
            </div>
            <Link 
              href="/intern/reports/submit"
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Submit Weekly Report
            </Link>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="flex items-center gap-5 border-none shadow-sm dark:bg-slate-900 relative overflow-hidden group">
                <div className={`p-4 rounded-2xl ${stat.bg} dark:bg-slate-800 transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                  <stat.icon className="w-20 h-20" />
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Kanban Board - Main Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Milestone Path</h2>
                </div>
              </div>
              <AdvancedKanban initialTasks={tasks} />
            </div>

            {/* Sidebar Columns - Feedback and Progress */}
            <div className="lg:col-span-4 space-y-8">
              {/* Mentor Feedback Card */}
              <Card title="Mentor's Recent Feedback" className="border-none shadow-sm dark:bg-slate-900 h-fit">
                {recentFeedback.length > 0 ? (
                  <div className="space-y-6">
                    {recentFeedback.slice(0, 2).map((fb) => (
                      <div key={fb.id} className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-indigo-600" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Review Feedback</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">&quot;{fb.comment}&quot;</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Award key={i} className={cn("w-3.5 h-3.5", i < fb.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200")} />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">Week {fb.report_id.slice(0, 2)}</span>
                        </div>
                      </div>
                    ))}
                    <Link href="/intern/feedback" className="block w-full py-3 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                      View All Feedback
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-tighter">No feedback yet</p>
                  </div>
                )}
              </Card>

              {/* Skill Progress Card */}
              <Card title="Learning Trajectory" className="border-none shadow-sm dark:bg-slate-900">
                <div className="space-y-6">
                  {[
                    { skill: 'Frontend Arch', progress: 85, color: 'bg-indigo-500' },
                    { skill: 'Backend Logic', progress: 65, color: 'bg-blue-500' },
                    { skill: 'Data Modeling', progress: 45, color: 'bg-purple-500' },
                  ].map((s, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="uppercase tracking-widest text-[9px]">{s.skill}</span>
                        <span>{s.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-1000", s.color)}
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 leading-none mb-1">CURRENT RANK</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Pro Intern</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 ml-auto" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
    </div>
  );
}
