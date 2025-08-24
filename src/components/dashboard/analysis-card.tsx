'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface AnalysisCardProps {
  analysis: string;
}

export default function AnalysisCard({ analysis }: AnalysisCardProps) {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Lightbulb className="h-6 w-6 text-primary" />
        <div>
          <CardTitle>AI Analysis</CardTitle>
          <CardDescription>Insights and suggestions based on the conversation.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {analysis ? (
          <p className="text-muted-foreground">{analysis}</p>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
