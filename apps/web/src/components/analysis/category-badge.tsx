'use client';

import { cn } from '@/lib/utils';
import type { FailureCategory } from '@/lib/services/analysis/types';

interface CategoryBadgeProps {
  category: FailureCategory;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const categoryConfig: Record<FailureCategory, { label: string; color: string; bg: string }> = {
  synchronization: {
    label: 'Synchronization',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  overlay: {
    label: 'Overlay',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  iframe: {
    label: 'iFrame',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  stale_element: {
    label: 'Stale Element',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  locator_instability: {
    label: 'Locator Issue',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  timeout: {
    label: 'Timeout',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  api_failure: {
    label: 'API Failure',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  network: {
    label: 'Network',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  assertion: {
    label: 'Assertion',
    color: 'text-gray-500',
    bg: 'bg-gray-500/10',
  },
  unknown: {
    label: 'Unknown',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
};

export function CategoryBadge({ category, size = 'md', showIcon = true }: CategoryBadgeProps) {
  const config = categoryConfig[category];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.color,
        config.bg,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {showIcon && (
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            category === 'synchronization' && 'bg-blue-500',
            category === 'overlay' && 'bg-orange-500',
            category === 'iframe' && 'bg-purple-500',
            category === 'stale_element' && 'bg-yellow-500',
            category === 'locator_instability' && 'bg-red-500',
            category === 'timeout' && 'bg-amber-500',
            category === 'api_failure' && 'bg-cyan-500',
            category === 'network' && 'bg-pink-500',
            category === 'assertion' && 'bg-gray-500',
            category === 'unknown' && 'bg-muted-foreground'
          )}
        />
      )}
      {config.label}
    </span>
  );
}