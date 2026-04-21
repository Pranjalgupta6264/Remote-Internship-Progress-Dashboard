'use client';
import { useEffect, useMemo, useState } from 'react';
import { Star, MessageSquare, Calendar, User } from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';
import { Feedback } from '@/types';
import { Report } from '@/types';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function InternFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [reportsById, setReportsById] = useState<Record<string, Report>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [feedbackRes, reportsRes] = await Promise.all([api.get('/feedback'), api.get('/reports')]);
        setFeedbacks(feedbackRes.data);
        const map: Record<string, Report> = {};
        (reportsRes.data as Report[]).forEach((report) => {
          map[report.id] = report;
        });
        setReportsById(map);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load feedback'));
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const avgRating = useMemo(() => (
    feedbacks.length ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length : 0
  ), [feedbacks]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Feedback</h2>
        <div className="glass-card px-4 py-2">
          <div className="flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" size={18} />
            <span className="text-white font-semibold">Average Rating: {avgRating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-white font-semibold mb-4">Rating Distribution</h3>
        <div className="space-y-2">
          {[5,4,3,2,1].map((rating) => {
            const count = feedbacks.filter(f => f.rating === rating).length;
            const percentage = (count / feedbacks.length) * 100;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-white text-sm">{rating}</span>
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="text-gray-400 text-sm w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback List */}
      {loading && <StatusMessage tone="loading" message="Loading feedback..." className="mb-4" />}
      {error && <StatusMessage tone="error" message={error} className="mb-4" />}
      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="glass-card p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Mentor</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                  />
                ))}
              </div>
            </div>
            <div className="pl-1">
              <div className="bg-dark-3 rounded-lg p-4">
                <p className="text-gray-300 text-sm leading-relaxed">&quot;{feedback.comment}&quot;</p>
              </div>
              <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                <MessageSquare size={10} />
                Feedback for Week {reportsById[feedback.report_id]?.week_number ?? '-'} Report
              </p>
            </div>
          </div>
        ))}
      </div>

      {feedbacks.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No feedback received yet</p>
          <p className="text-gray-500 text-sm mt-1">Submit reports to get feedback from your mentor</p>
        </div>
      )}
    </div>
  );
}