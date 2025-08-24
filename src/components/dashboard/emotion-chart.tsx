'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { EmotionDataPoint } from '@/types';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const chartConfig = {
  emotionalTemperature: {
    label: 'Emotion',
    color: 'hsl(var(--accent))',
  },
};

const emotionToValue = (emotion: EmotionDataPoint['emotionalTemperature']) => {
  switch (emotion) {
    case 'positive': return 3;
    case 'neutral': return 2;
    case 'tense': return 1;
    case 'negative': return 0;
    default: return 2;
  }
};

interface EmotionChartProps {
  data: EmotionDataPoint[];
}

export default function EmotionChart({ data }: EmotionChartProps) {
  const chartData = data.map(d => ({
    time: `${d.time}s`,
    value: emotionToValue(d.emotionalTemperature),
    label: d.emotionalTemperature,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotional Temperature</CardTitle>
        <CardDescription>Real-time emotional tone of the conversation.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                ticks={[0, 1, 2, 3]}
                tickFormatter={(value) => ['Negative', 'Tense', 'Neutral', 'Positive'][value]} 
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: 'hsl(var(--accent))'}}/>
                          <div className="font-medium capitalize">{props.payload.label}</div>
                        </div>
                      </>
                    )}
                  />
                }
              />
              <Line
                dataKey="value"
                type="monotone"
                stroke="hsl(var(--accent))"
                strokeWidth={3}
                dot={false}
                name="emotionalTemperature"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
