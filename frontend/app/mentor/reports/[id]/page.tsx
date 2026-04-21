'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import api, { getApiErrorMessage } from '@/lib/api';
import { Report } from '@/types';
import { Star, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function ReportReviewPage() {
  const params = useParams<{ id: string | string[] }>();
  const reportId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarkingReviewed, setIsMarkingReviewed] = useState(false);

  useEffect(() => {
    if (!reportId) {
      toast.error('Invalid report id');
      router.push('/mentor/reports');
      return;
    }

    const fetchReport = async () => {
      try {
        const response = await api.get(`/reports/${reportId}`);
        setReport(response.data);
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, 'Failed to load report'));
        router.push('/mentor/reports');
      } finally {
        setIsLoading(false);
      }
    };
    void fetchReport();
  }, [reportId, router]);

  const handleSubmitFeedback = async () => {
    if (!comment.trim()) {
      toast.error('Please add feedback before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/feedback', {
        report_id: reportId,
        comment,
        rating
      });
      toast.success('Feedback submitted successfully');
      router.push('/mentor/reports');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to submit feedback'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkReviewed = async () => {
    if (!reportId) return;
    setIsMarkingReviewed(true);
    try {
      await api.post(`/reports/${reportId}/mark-reviewed`);
      toast.success('Report marked as reviewed');
      router.refresh();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to mark report as reviewed'));
    } finally {
      setIsMarkingReviewed(false);
    }
  };

  if (isLoading || !report) return <StatusMessage tone="loading" message="Loading report..." className="max-w-sm" />;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <section>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Review Report</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">Week {report.week_number} • Intern ID: {report.intern_id.slice(0, 8)}</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Content */}
          <Card className="lg:col-span-2 border-none shadow-sm min-h-[500px]">
            <div 
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: report.html_content || '' }}
            />
          </Card>

          {/* Feedback Section */}
          <div className="space-y-6">
            <Card title="Mentor Feedback" className="border-none shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1 transition-all ${star <= rating ? 'text-yellow-400 scale-110' : 'text-slate-200 dark:text-slate-700'}`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2 text-xs uppercase tracking-tighter">Your Feedback</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide constructive feedback..."
                    className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>

                <button 
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" /> {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                {report.status !== 'reviewed' && (
                  <button
                    onClick={handleMarkReviewed}
                    disabled={isMarkingReviewed}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isMarkingReviewed ? 'Marking...' : 'Mark as Reviewed'}
                  </button>
                )}
              </div>
            </Card>

            <Card className="bg-indigo-600 text-white border-none">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-5 h-5 text-indigo-200" />
                <h4 className="font-bold">Peer Support</h4>
              </div>
              <p className="text-sm text-indigo-100 leading-relaxed font-medium">Your feedback helps interns grow. Be specific about their achievements and areas for improvement.</p>
            </Card>
          </div>
        </div>
    </div>
  );
}
