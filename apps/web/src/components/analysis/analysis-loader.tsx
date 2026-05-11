'use client';

import { CheckCircle2, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface AnalysisLoaderProps {
  status?: 'queued' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export function AnalysisLoader({ status = 'processing', message }: AnalysisLoaderProps) {
  const defaultMessages = {
    queued: 'Analysis queued...',
    processing: 'Analyzing failure...',
    completed: 'Analysis complete!',
    failed: 'Analysis failed',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center',
          status === 'completed' && 'bg-green-500/10',
          status === 'failed' && 'bg-destructive/10',
          (status === 'queued' || status === 'processing') && 'bg-primary/10'
        )}
      >
        {status === 'completed' && <CheckCircle2 className="w-8 h-8 text-green-500" />}
        {status === 'failed' && <AlertTriangle className="w-8 h-8 text-destructive" />}
        {(status === 'queued' || status === 'processing') && (
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        )}
      </div>

      <div className="text-center">
        <p className="text-lg font-medium capitalize">{status}</p>
        <p className="text-sm text-muted-foreground">{message || defaultMessages[status]}</p>
      </div>

      {status === 'processing' && (
        <Progress value={67} className="w-48" />
      )}
    </div>
  );
}