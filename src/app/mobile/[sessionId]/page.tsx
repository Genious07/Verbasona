'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { SessionData } from '@/types';
import { database } from '@/lib/firebase';
import { ref, onValue, get, update } from 'firebase/database';
import type { DatabaseReference } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

import { analyzeEmotion } from '@/ai/flows/emotion-analysis';
import { calculateTalkListenRatio } from '@/ai/flows/talk-listen-ratio';
import { analyzeInterruptions } from '@/ai/flows/interruption-analysis';
import { transcribeAudio } from '@/ai/flows/transcription';


export default function MobilePage() {
  const params = useParams();
  const { toast } = useToast();
  const sessionId = params.sessionId as string;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sessionRef = useRef<DatabaseReference | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessionId) {
      sessionRef.current = ref(database, `sessions/${sessionId}`);
      // Mark device as linked and ready
      update(sessionRef.current, { isLinked: true }).then(() => {
        setIsReady(true);
      }).catch(err => {
        console.error("Failed to link device", err);
        setError("Could not connect to the session. Please try again.");
      });
    }
  }, [sessionId]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (sessionRef.current) {
      try {
        await update(sessionRef.current, { isRecording: false });
      } catch (error) {
        console.error('Failed to update session data on stop', error);
      }
    }
  }, []);

  const processAudioChunk = useCallback(async () => {
    if (audioChunksRef.current.length === 0 || !sessionRef.current) return;
    setIsProcessing(true);

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = []; // Clear chunks for next interval

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        const snapshot = await get(sessionRef.current!);
        if (!snapshot.exists()) {
          console.warn("Session data not found, stopping updates.");
          stopRecording();
          return;
        }
        const currentData: SessionData = snapshot.val();

        // Run AI analyses in parallel
        const [emotionResult, talkListenResult, interruptionResult, transcriptionResult] = await Promise.all([
          analyzeEmotion({ audioDataUri: base64Audio }),
          calculateTalkListenRatio({ conversationAudioDataUri: base64Audio, speakerDiarizationData: '' }), // Diarization is mocked for now
          analyzeInterruptions({ // This will be based on mock data for now
            conversationText: '',
            userSpeakingTime: currentData.talkListenRatio.user,
            totalSpeakingTime: currentData.talkListenRatio.user + currentData.talkListenRatio.others,
            userInterruptionCount: currentData.interruptions.user,
            otherInterruptionCount: currentData.interruptions.others
          }),
          transcribeAudio({ audioDataUri: base64Audio })
        ]);

        console.log("Transcription result from flow:", transcriptionResult);

        // Update emotion history
        const newEmotionHistory = [
          ...(currentData.emotionHistory || []),
          {
            time: ((currentData.emotionHistory?.length || 0) + 1) * 5, // Assuming 5s chunks
            emotionalTemperature: emotionResult.emotionalTemperature as any,
          },
        ];
        if (newEmotionHistory.length > 20) newEmotionHistory.shift();

        // Update talk/listen ratio (incrementally)
        const newUserTalkTime = currentData.talkListenRatio.user + (talkListenResult.speakerTimings['user'] || 0);
        const newOthersTalkTime = currentData.talkListenRatio.others + (talkListenResult.speakerTimings['others'] || 0);
        
        // Update interruptions (incrementally, mocked for now)
        const newUserInterruptions = currentData.interruptions.user + (Math.random() < 0.05 ? 1 : 0);
        const newOthersInterruptions = currentData.interruptions.others + (Math.random() < 0.03 ? 1 : 0);

        const newTranscription = `${currentData.transcription || ''} ${transcriptionResult?.transcription || ''}`.trim();

        const updates: Partial<SessionData> = {
          emotionHistory: newEmotionHistory,
          talkListenRatio: { user: newUserTalkTime, others: newOthersTalkTime },
          interruptions: { user: newUserInterruptions, others: newOthersInterruptions },
          analysis: interruptionResult.interruptionAnalysis, // Use the latest analysis
          transcription: newTranscription,
        };

        await update(sessionRef.current!, updates);
      };
    } catch (err) {
      console.error('AI analysis failed:', err);
      toast({
        variant: 'destructive',
        title: 'Analysis Error',
        description: 'Could not analyze the last audio chunk.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, stopRecording]);

  const startRecording = useCallback(async () => {
    if (!sessionRef.current) return;
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(5000); // Send data every 5 seconds
      setIsRecording(true);

      // Reset session data
      const initialData: Partial<SessionData> = {
        isRecording: true,
        emotionHistory: [],
        talkListenRatio: { user: 0, others: 0 },
        interruptions: { user: 0, others: 0 },
        analysis: 'Starting analysis... Speak into your device.',
        transcription: '',
      };
      await update(sessionRef.current, initialData);

      // Start the analysis interval
      analysisIntervalRef.current = setInterval(processAudioChunk, 5000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Could not access microphone. Please check your browser permissions.');
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please enable microphone permissions in your browser settings.',
      });
    }
  }, [processAudioChunk, toast]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
            {isRecording ? (isProcessing ? 'Analyzing...' : 'Recording...') : 'Ready to Record'}
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
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Square className="mr-2 h-5 w-5" />
              )}
              Stop Recording
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}