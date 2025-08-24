'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionData, EmotionDataPoint } from '@/types';

// Mock AI analysis functions - they return plausible data structures
const mockEmotionAnalysis = (): EmotionDataPoint['emotionalTemperature'] => {
  const emotions: EmotionDataPoint['emotionalTemperature'][] = ['positive', 'negative', 'neutral', 'tense'];
  return emotions[Math.floor(Math.random() * emotions.length)];
};

const mockInterruptionAnalysis = (interruptions: {user: number, others: number}) => {
    if (interruptions.user > interruptions.others + 2) {
        return "It seems you're interrupting more often than you're being interrupted. Try to be more mindful of giving others space to speak. A good practice is to pause for a second after someone finishes before you start talking."
    }
    if (interruptions.others > interruptions.user + 2) {
        return "You're being interrupted quite frequently. To hold your ground, try using clearer, more assertive phrasing and maintaining a steady speaking volume. Don't be afraid to politely say, 'I'd like to finish my thought.'"
    }
    return "Your interruption patterns appear balanced. You're engaging in a healthy give-and-take dynamic in this conversation. Keep up the great work in active listening and respectful turn-taking!"
}

const getSessionKey = (sessionId: string) => `synapse-sync-session-${sessionId}`;

export default function MobilePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [isRecording, setIsRecording] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef(0);

  const updateSessionData = useCallback(() => {
    const sessionKey = getSessionKey(sessionId);
    try {
      const storedData = localStorage.getItem(sessionKey);
      const data: SessionData = storedData ? JSON.parse(storedData) : {
        isLinked: true,
        isRecording: true,
        emotionHistory: [],
        talkListenRatio: { user: 0, others: 0 },
        interruptions: { user: 0, others: 0 },
        analysis: '',
      };
      
      timeRef.current += 2;

      // Update emotion history
      data.emotionHistory.push({
        time: timeRef.current,
        emotionalTemperature: mockEmotionAnalysis(),
      });
      if (data.emotionHistory.length > 20) {
        data.emotionHistory.shift();
      }

      // Update talk/listen ratio
      const isUserSpeaking = Math.random() > 0.5;
      data.talkListenRatio.user += isUserSpeaking ? 2 : (Math.random() * 0.5);
      data.talkListenRatio.others += !isUserSpeaking ? 2 : (Math.random() * 0.5);

      // Update interruptions
      if (Math.random() < 0.1) data.interruptions.user++;
      if (Math.random() < 0.08) data.interruptions.others++;
      
      data.analysis = mockInterruptionAnalysis(data.interruptions);

      localStorage.setItem(sessionKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to update session data in localStorage', error);
    }
  }, [sessionId]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    timeRef.current = 0;
    const sessionKey = getSessionKey(sessionId);

    const initialData: SessionData = {
        isLinked: true,
        isRecording: true,
        emotionHistory: [],
        talkListenRatio: { user: 0, others: 0 },
        interruptions: { user: 0, others: 0 },
        analysis: '',
    };
    localStorage.setItem(sessionKey, JSON.stringify(initialData));

    intervalRef.current = setInterval(updateSessionData, 2000);
  }, [sessionId, updateSessionData]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
     const sessionKey = getSessionKey(sessionId);
      try {
        const storedData = localStorage.getItem(sessionKey);
        if (storedData) {
            const data: SessionData = JSON.parse(storedData);
            data.isRecording = false;
            localStorage.setItem(sessionKey, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Failed to update session data on stop', error)
      }
  }, [sessionId]);
  
  useEffect(() => {
    if (sessionId) {
      const sessionKey = getSessionKey(sessionId);
      const initialData: SessionData = {
        isLinked: true,
        isRecording: false,
        emotionHistory: [],
        talkListenRatio: { user: 0, others: 0 },
        interruptions: { user: 0, others: 0 },
        analysis: '',
      };
      localStorage.setItem(sessionKey, JSON.stringify(initialData));
      setIsReady(true);
    }
  }, [sessionId]);

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      stopRecording();
    };
  }, [stopRecording]);

  if (!isReady) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Connecting to session...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <Mic className={`mx-auto h-12 w-12 transition-colors ${isRecording ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
          <CardTitle className="text-2xl font-headline mt-4">
            {isRecording ? 'Recording in Progress' : 'Ready to Record'}
          </CardTitle>
          <CardDescription>
            {isRecording
              ? 'Your desktop dashboard is now live.'
              : 'Press the button to start capturing audio.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isRecording ? (
            <Button onClick={startRecording} size="lg" className="w-full bg-primary hover:bg-primary/90">
              <Mic className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive" size="lg" className="w-full">
              <Square className="mr-2 h-5 w-5" />
              Stop Recording
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
