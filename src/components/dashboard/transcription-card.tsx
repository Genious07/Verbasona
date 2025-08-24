'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { FileText } from 'lucide-react';

interface TranscriptionCardProps {
  transcription: string;
}

export default function TranscriptionCard({ transcription }: TranscriptionCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
         <FileText className="h-6 w-6 text-primary" />
        <div>
            <CardTitle>Live Transcription</CardTitle>
            <CardDescription>A real-time transcript of the conversation.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32 w-full rounded-md border p-4">
          {transcription ? (
            <p className="text-sm text-muted-foreground">{transcription}</p>
          ) : (
             <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
             </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
