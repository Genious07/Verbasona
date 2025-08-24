export interface EmotionDataPoint {
  time: number;
  emotionalTemperature: 'positive' | 'negative' | 'neutral' | 'tense';
}

export interface TalkListenRatio {
  user: number;
  others: number;
}

export interface InterruptionCount {
  user: number;
  others: number;
}

export interface SessionData {
  isLinked: boolean;
  isRecording: boolean;
  emotionHistory: EmotionDataPoint[];
  talkListenRatio: TalkListenRatio;
  interruptions: InterruptionCount;
  analysis: string;
  transcription: string;
}