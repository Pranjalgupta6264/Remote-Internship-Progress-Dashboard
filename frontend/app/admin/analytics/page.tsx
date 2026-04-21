'use client';
import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Users, FileText, Star } from 'lucide-react';
import { getAdminAnalytics, getApiErrorMessage } from '@/lib/api';
import type { AdminAnalytics } from '@/types';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getAdminAnalytics();
        setAnalytics(data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load analytics'));
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const completionRate = useMemo(() => {
    if (!analytics || analytics.tasks.total === 0) return 0;
    return Math.round((analytics.tasks.done / analytics.tasks.total) * 100);
  }, [analytics]);

  if (loading) return <StatusMessage tone="loading" message="Loading admin analytics..." className="max-w-sm" />;
  if (error || !analytics) return <StatusMessage tone="error" message={error || 'Unable to load analytics'} className="max-w-md" />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Platform Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <Users className="text-blue-400" size={24} />
            <span className="text-2xl font-bold text-white">{analytics.users.total}</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Total Users</p>
          <p className="text-green-400 text-xs">{analytics.users.active} active users</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <FileText className="text-purple-400" size={24} />
            <span className="text-2xl font-bold text-white">{analytics.reports.total}</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Total Reports</p>
          <p className="text-green-400 text-xs">{analytics.reports.reviewed} reviewed</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <TrendingUp className="text-green-400" size={24} />
            <span className="text-2xl font-bold text-white">{completionRate}%</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Task Completion</p>
          <p className="text-green-400 text-xs">{analytics.tasks.done}/{analytics.tasks.total} tasks done</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <Star className="text-yellow-400" size={24} />
            <span className="text-2xl font-bold text-white">{analytics.feedback.total}</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Feedback Entries</p>
          <p className="text-green-400 text-xs">System-wide feedback volume</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-4">Performance Overview</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Task Completion Rate</span>
              <span className="text-white">{completionRate}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Report Submission Rate</span>
              <span className="text-white">{analytics.reports.total ? Math.round((analytics.reports.submitted / analytics.reports.total) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analytics.reports.total ? Math.round((analytics.reports.submitted / analytics.reports.total) * 100) : 0}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Active Users</span>
              <span className="text-white">{analytics.users.total ? Math.round((analytics.users.active / analytics.users.total) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${analytics.users.total ? Math.round((analytics.users.active / analytics.users.total) * 100) : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}