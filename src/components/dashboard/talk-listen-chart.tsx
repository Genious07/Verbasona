'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { TalkListenRatio } from '@/types';
import { Label, Pie, PieChart, Cell } from 'recharts';

const chartConfig = {
  user: { label: 'You', color: 'hsl(var(--primary))' },
  others: { label: 'Others', color: 'hsl(var(--accent))' },
};

interface TalkListenChartProps {
  data: TalkListenRatio;
}

export default function TalkListenChart({ data }: TalkListenChartProps) {
  const chartData = [
    { name: 'user', value: data.user, fill: chartConfig.user.color },
    { name: 'others', value: data.others, fill: chartConfig.others.color },
  ];
  const total = data.user + data.others;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Talk/Listen Ratio</CardTitle>
        <CardDescription>Balance of speaking time between you and others.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              strokeWidth={5}
              stroke="hsl(var(--background))"
            >
               {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-3xl font-bold"
                      >
                        {total > 0 ? `${Math.round((data.user / total) * 100)}%` : '0%'}
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          You
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
       <div className="flex items-center justify-center gap-4 p-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartConfig.user.color }} />
            You: {Math.round(data.user)}s
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartConfig.others.color }} />
            Others: {Math.round(data.others)}s
          </div>
        </div>
    </Card>
  );
}
