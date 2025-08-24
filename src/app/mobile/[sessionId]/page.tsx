'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { database } from '@/lib/firebase';
import { ref, update } from 'firebase/database';
import type { DatabaseReference } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

// Define the SpeechRecognition type for window
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function MobilePage() {
  const params = useParams();
  const { toast } = useToast();
  const sessionId = params.sessionId as string;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sessionRef = useRef<DatabaseReference | null>(null);
  
  // Refs to hold the latest transcript and recording state
  const finalTranscriptRef = useRef('');
  const isRecordingRef = useRef(isRecording);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    if (sessionId) {
      sessionRef.current = ref(database, `sessions/${sessionId}`);
      update(sessionRef.current, { isLinked: true })
        .then(() => setIsReady(true))
        .catch(err => {
          console.error("Failed to link device", err);
          setError("Could not connect to the session. Please try again.");
        });
    }
  }, [sessionId]);
  
  const analyzeTranscription = useCallback(async (fullText: string) => {
    if (!fullText.trim() || !sessionRef.current) return;

    setIsProcessing(true);
    toast({ title: 'Analysis in progress...', description: 'Please wait while we process the conversation.' });
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription: fullText }),
      });

      if (!response.ok) throw new Error('Analysis request failed');

      const analysisData = await response.json();
      await update(sessionRef.current, { ...analysisData, analysis: analysisData.analysis || "Analysis complete." });

    } catch (err) {
      console.error('Analysis failed:', err);
      toast({
        variant: 'destructive',
        title: 'Analysis Error',
        description: 'Could not analyze the transcription.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // **NEW LOGIC**: Analyze the complete transcript only when stopping
    analyzeTranscription(finalTranscriptRef.current);

    if (sessionRef.current) {
      update(sessionRef.current, { isRecording: false });
    }
  }, [analyzeTranscription]);

  const startRecording = useCallback(async () => {
    if (!sessionRef.current) return;
    setError(null);
    finalTranscriptRef.current = '';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please try Chrome or Safari.');
      return;
    }

    await update(sessionRef.current, {
      isRecording: true,
      transcription: '',
      analysis: 'Recording in progress...',
      talkListenRatio: { user: 0, others: 0 },
      interruptions: { user: 0, others: 0 },
    });

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    // **FIX**: Correctly handle final and interim results to prevent repetition
    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      finalTranscriptRef.current = ''; // Reset final transcript to rebuild from results
      
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript.trim() + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (sessionRef.current) {
        update(sessionRef.current, { transcription: finalTranscriptRef.current + interimTranscript });
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setError(`An error occurred: ${event.error}`);
        stopRecording();
      }
    };
    
    recognitionRef.current.onend = () => {
      if (isRecordingRef.current) {
        recognitionRef.current?.start(); // Restart if it stops unexpectedly
      }
    };

    recognitionRef.current.start();
    setIsRecording(true);
  }, [stopRecording]);

  if (!isReady) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Connecting to session...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <Card className="w-full max-w-sm text-center">
         <CardHeader>
           <Mic className={`mx-auto h-12 w-12 transition-colors ${isRecording ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
           <CardTitle className="text-2xl font-headline mt-4">
             {isRecording ? 'Recording...' : 'Ready to Record'}
           </CardTitle>
           <CardDescription>
             {isRecording
              ? 'Your desktop dashboard is now live.'
              : 'Press the button to start capturing audio.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}
          {!isRecording ? (
            <Button onClick={startRecording} size="lg" className="w-full bg-primary hover:bg-primary/90">
              <Mic className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive" size="lg" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
              ) : (
                <><Square className="mr-2 h-5 w-5" /> Stop Session</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}