import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusTone = 'error' | 'success' | 'info' | 'loading';

interface StatusMessageProps {
  tone: StatusTone;
  message: string;
  className?: string;
}

const toneStyles: Record<StatusTone, string> = {
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  loading: 'border-slate-700 bg-slate-900/40 text-slate-200',
};

export function StatusMessage({ tone, message, className }: StatusMessageProps) {
  const icon =
    tone === 'error' ? <AlertCircle className="h-4 w-4" /> :
    tone === 'success' ? <CheckCircle2 className="h-4 w-4" /> :
    tone === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> :
    <Info className="h-4 w-4" />;

  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
        toneStyles[tone],
        className
      )}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
}
