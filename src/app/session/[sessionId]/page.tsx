'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QrCodeDisplay from '@/components/qr-code-display';
import Dashboard from '@/components/dashboard/dashboard';
import type { SessionData } from '@/types';
import { Loader2, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [mobileUrl, setMobileUrl] = useState('');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    // This effect ensures window.location is available before generating the URL.
    if (typeof window !== 'undefined') {
        setMobileUrl(`${window.location.origin}/mobile/${sessionId}`);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = ref(database, `sessions/${sessionId}`);
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSessionData(data);
      } else {
        // Initialize if no data exists
        setSessionData({
          isLinked: false,
          isRecording: false,
          emotionHistory: [],
          talkListenRatio: { user: 0, others: 0 },
          interruptions: { user: 0, others: 0 },
          analysis: '',
        });
      }
    }, (error) => {
      console.error('Failed to get session data from Firebase', error);
    });

    return () => unsubscribe();
  }, [sessionId]);

  const renderContent = () => {
    if (!sessionData) {
        return (
             <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Loading Session</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Connecting to the session...</p>
                </CardContent>
            </Card>
        )
    }

    if (!sessionData.isLinked) {
      return <QrCodeDisplay url={mobileUrl} />;
    }

    if (!sessionData.isRecording) {
      return (
        <Card className="w-full max-w-md mx-auto animate-in fade-in duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Device Linked!</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Waiting for recording to start on your mobile device...</p>
          </CardContent>
        </Card>
      );
    }
    
    if (sessionData.isRecording) {
        return <Dashboard data={sessionData} />;
    }

    return (
        <Card className="w-full max-w-lg mx-auto animate-in fade-in duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Session Ended</CardTitle>
            <CardDescription>You can review your final results below.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <Dashboard data={sessionData} />
          </CardContent>
        </Card>
    )
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-background p-4 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
            <div className="rounded-full bg-primary/20 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z"/><path d="M12 12v-4"/><path d="M12 16h.01"/></svg>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
            SynapseSync
            </h1>
        </div>
        <div className="w-full">
            {renderContent()}
        </div>
    </main>
  );
}
