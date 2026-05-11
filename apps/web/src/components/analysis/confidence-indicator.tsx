'use client';

import { cn } from '@/lib/utils';

interface ConfidenceIndicatorProps {
  confidence: number; // 0-1
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceIndicator({ confidence, showLabel = true, size = 'md' }: ConfidenceIndicatorProps) {
  const percentage = Math.round(confidence * 100);

  const getColor = (value: number) => {
    if (value >= 0.8) return 'text-green-500';
    if (value >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBarColor = (value: number) => {
    if (value >= 0.8) return 'bg-green-500';
    if (value >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'rounded-full border-2',
          size === 'sm' && 'w-8 h-8 text-xs',
          size === 'md' && 'w-12 h-12 text-sm',
          size === 'lg' && 'w-16 h-16 text-lg',
          confidence >= 0.8 && 'border-green-500 text-green-500',
          confidence >= 0.5 && confidence < 0.8 && 'border-yellow-500 text-yellow-500',
          confidence < 0.5 && 'border-red-500 text-red-500'
        )}
      >
        <div className="flex items-center justify-center h-full font-bold">
          {percentage}%
        </div>
      </div>

      {showLabel && (
        <div className="space-y-1">
          <p className={cn('font-medium', getColor(confidence))}>
            {confidence >= 0.8 ? 'High Confidence' : confidence >= 0.5 ? 'Medium Confidence' : 'Low Confidence'}
          </p>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', getBarColor(confidence))}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}