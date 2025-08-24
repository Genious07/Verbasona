'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const startSession = () => {
    // crypto.randomUUID() is available in modern browsers and secure contexts.
    const sessionId = crypto.randomUUID();
    router.push(`/session/${sessionId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-primary/10 p-4">
          <div className="rounded-full bg-primary/20 p-3">
            <Zap className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl font-headline">
          Verbasona
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Link your devices and gain real-time insights into your conversations.
          Understand emotional temperature, talk-listen ratio, and interruption
          patterns instantly.
        </p>
        <Button onClick={startSession} size="lg" className="mt-6">
          <Zap className="mr-2 h-5 w-5" />
          Start a New Session
        </Button>
      </div>
    </main>
  );
}
