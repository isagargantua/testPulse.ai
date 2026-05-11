'use client';

import { Bug, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryBadge } from './category-badge';
import { ConfidenceIndicator } from './confidence-indicator';
import { Separator } from '@/components/ui/separator';

interface AnalysisPanelProps {
  analysis: {
    id: string;
    category: string;
    confidence_score: number;
    root_cause: string;
    explanation: string;
    recommendations?: {
      id: string;
      type: string;
      title: string;
      description: string;
      suggested_code: string | null;
      priority: number;
    }[];
  };
  failure?: {
    title: string;
    error_message: string;
    stack_trace?: string;
    test_name?: string;
  };
}

export function AnalysisPanel({ analysis, failure }: AnalysisPanelProps) {
  const category = analysis.category as Parameters<typeof CategoryBadge>[0]['category'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bug className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Analysis Results</h2>
            <p className="text-sm text-muted-foreground">AI-powered failure diagnosis</p>
          </div>
        </div>
      </div>

      {/* Category & Confidence */}
      <div className="flex items-center gap-6">
        <CategoryBadge category={category} size="md" />
        <ConfidenceIndicator confidence={analysis.confidence_score} size="md" />
      </div>

      {/* Root Cause */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Root Cause
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{analysis.root_cause}</p>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{analysis.explanation}</p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Recommended Fixes</h3>
            <div className="space-y-4">
              {analysis.recommendations.map((rec, index) => (
                <Card key={rec.id} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Bug className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {rec.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          rec.priority === 1
                            ? 'bg-red-500/10 text-red-500'
                            : rec.priority === 2
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {rec.priority === 1 ? 'high' : rec.priority === 2 ? 'medium' : 'low'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                    {rec.suggested_code && (
                      <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                        <code>{rec.suggested_code}</code>
                      </pre>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
