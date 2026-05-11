'use client';

import { Lightbulb, Code, RefreshCw, ShieldCheck, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Recommendation } from '@/lib/services/analysis/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
  onApply?: () => void;
  onCopy?: () => void;
}

const typeConfig = {
  locator_fix: { icon: Code, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  code_fix: { icon: Code, color: 'text-green-500', bg: 'bg-green-500/10' },
  retry_strategy: { icon: RefreshCw, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  best_practice: { icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

export function RecommendationCard({ recommendation, index, onApply, onCopy }: RecommendationCardProps) {
  const config = typeConfig[recommendation.type];
  const Icon = config.icon;

  return (
    <Card className="relative overflow-hidden">
      <div className={cn('absolute top-0 left-0 w-1 h-full', config.color.replace('text-', 'bg-'))} />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bg)}>
              <Icon className={cn('w-5 h-5', config.color)} />
            </div>
            <div>
              <h4 className="font-medium">{recommendation.title}</h4>
              <p className="text-sm text-muted-foreground capitalize">
                {recommendation.type.replace('_', ' ')}
              </p>
            </div>
          </div>

          <span
            className={cn(
              'text-xs px-2 py-1 rounded-full',
              recommendation.priority === 'high' && 'bg-red-500/10 text-red-500',
              recommendation.priority === 'medium' && 'bg-yellow-500/10 text-yellow-500',
              recommendation.priority === 'low' && 'bg-gray-500/10 text-gray-500'
            )}
          >
            {recommendation.priority}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{recommendation.description}</p>

        {recommendation.suggestedCode && (
          <div className="relative">
            <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
              <code>{recommendation.suggestedCode}</code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onCopy}
            >
              Copy
            </Button>
          </div>
        )}

        {onApply && (
          <Button variant="outline" size="sm" className="w-full" onClick={onApply}>
            Apply Fix
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
  onApply?: (index: number) => void;
}

export function RecommendationsList({ recommendations, onApply }: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Lightbulb className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No recommendations available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => (
        <RecommendationCard
          key={index}
          recommendation={rec}
          index={index}
          onApply={onApply ? () => onApply(index) : undefined}
        />
      ))}
    </div>
  );
}