'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { InterruptionCount } from '@/types';
import { User, Users } from 'lucide-react';

interface InterruptionCardProps {
  data: InterruptionCount;
}

export default function InterruptionCard({ data }: InterruptionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interruption Frequency</CardTitle>
        <CardDescription>Comparing who interrupts whom.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded-lg bg-card-foreground/5 p-4">
          <User className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2 text-3xl font-bold">{data.user}</p>
          <p className="text-sm text-muted-foreground">You Interrupted</p>
        </div>
        <div className="rounded-lg bg-card-foreground/5 p-4">
          <Users className="mx-auto h-8 w-8 text-accent" />
          <p className="mt-2 text-3xl font-bold">{data.others}</p>
          <p className="text-sm text-muted-foreground">You Were Interrupted</p>
        </div>
      </CardContent>
    </Card>
  );
}
