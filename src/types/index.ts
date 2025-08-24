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
  talkListenRatio: TalkListenRatio;
  interruptions: InterruptionCount;
  analysis: string;
  transcription: string;
}