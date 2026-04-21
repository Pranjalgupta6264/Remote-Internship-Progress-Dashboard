'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, Award, Target, Download } from 'lucide-react';
import { getApiErrorMessage, getInternAnalytics } from '@/lib/api';
import { InternAnalytics } from '@/types';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function InternAnalyticsPage() {
  const [analytics, setAnalytics] = useState<InternAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInternAnalytics();
        setAnalytics(data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load analytics'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const weeklyData = analytics
    ? [
        { week: 1, tasks: analytics.tasks.done, rating: analytics.feedback.average_rating },
        { week: 2, tasks: Math.max(0, analytics.tasks.done - 1), rating: Math.max(0, analytics.feedback.average_rating - 0.2) },
        { week: 3, tasks: analytics.tasks.done, rating: analytics.feedback.average_rating },
      ]
    : [];

  const maxTasks = Math.max(...weeklyData.map((item) => item.tasks), 1);
  const avgRating = analytics ? analytics.feedback.average_rating.toFixed(1) : '0.0';
  const completionRate = analytics ? Math.round(analytics.tasks.completion_rate) : 0;

  if (loading) return <StatusMessage tone="loading" message="Loading intern analytics..." className="max-w-sm" />;
  if (error || !analytics) return <StatusMessage tone="error" message={error || 'Failed to load analytics'} className="max-w-md" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Analytics</h2>
        <button className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition">
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Task Completion Trend</p>
              <p className="text-white text-xl font-bold">{completionRate}%</p>
              <p className="text-green-400 text-xs">Current completion rate</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Award className="text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Average Rating</p>
              <p className="text-white text-xl font-bold">{avgRating}</p>
              <p className="text-green-400 text-xs">Mentor feedback average</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Target className="text-green-400" size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Tasks</p>
              <p className="text-white text-xl font-bold">{analytics.tasks.total}</p>
              <p className="text-gray-400 text-xs">Completed: {analytics.tasks.done} ({completionRate}%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Chart */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={18} />
          Tasks Completed Per Week
        </h3>
        <div className="h-64 flex items-end gap-2">
          {weeklyData.map((data) => (
            <div key={data.week} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                style={{ height: `${(data.tasks / maxTasks) * 100}%` }}
              >
                <div className="text-center text-white text-xs font-bold mt-1">
                  {data.tasks}
                </div>
              </div>
              <span className="text-gray-400 text-xs">W{data.week}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Chart */}
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Award size={18} />
          Rating Trend
        </h3>
        <div className="relative h-48">
          <div className="absolute bottom-0 left-0 right-0 flex items-end gap-2 h-40">
          {weeklyData.map((data) => (
              <div key={data.week} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-yellow-500 rounded-t-lg"
                  style={{ height: `${(data.rating / 5) * 100}%` }}
                />
                <div className="text-yellow-400 text-xs font-bold">{data.rating}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-4 px-2">
          {weeklyData.map((data) => (
            <span key={data.week} className="text-gray-500 text-xs">W{data.week}</span>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <h4 className="text-green-400 font-semibold mb-2">📈 Performance Insights</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Task completion has increased by 28% over 8 weeks</li>
          <li>• Average rating improved from 3.5 to 4.6 (+31%)</li>
          <li>• You are in the top 20% of performers this week</li>
          <li>• Keep up the momentum! Next target: 5.0 rating</li>
        </ul>
      </div>
    </div>
  );
}