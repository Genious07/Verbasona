import type { SessionData } from '@/types';
import AnalysisCard from './analysis-card';
import EmotionChart from './emotion-chart';
import InterruptionCard from './interruption-card';
import TalkListenChart from './talk-listen-chart';
import TranscriptionCard from './transcription-card';

interface DashboardProps {
  data: SessionData;
}

export default function Dashboard({ data }: DashboardProps) {
  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-3">
         <TranscriptionCard transcription={data.transcription} />
      </div>
      <div className="lg:col-span-2">
        <EmotionChart data={data.emotionHistory} />
      </div>
      <TalkListenChart data={data.talkListenRatio} />
      <InterruptionCard data={data.interruptions} />
      <AnalysisCard analysis={data.analysis} />
    </div>
  );
}
