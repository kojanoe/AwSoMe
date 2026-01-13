'use client';

import { useState } from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatDay } from '@/lib/stats/behavioralPatterns';
import { Button } from '@/components/ui/button';
import { DailyContentBreakdown } from '@/lib/stats/timeBasedContent';

interface ActiveDaysChartProps {
  data: Record<number, number>;
  contentBreakdown?: DailyContentBreakdown[];
}

type ViewMode = 'activity' | 'content';

export function ActiveDaysChart({ data, contentBreakdown }: ActiveDaysChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('content');

  const activityData = [0, 1, 2, 3, 4, 5, 6].map(day => ({
    day,
    label: formatDay(day).slice(0, 3),
    fullLabel: formatDay(day),
    count: data[day] || 0,
  }));

  const maxCount = Math.max(...activityData.map(d => d.count));

  if (maxCount === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        No activity data available
      </div>
    );
  }

  const hasContentData = contentBreakdown && contentBreakdown.length > 0;

  const getActivityColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.7) return 'var(--chart-1)';
    if (intensity > 0.4) return 'var(--chart-2)';
    return 'var(--chart-3)';
  };

  return (
    <div className="space-y-4">
      {hasContentData && (
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'content' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('content')}
          >
            Content Type
          </Button>
          <Button
            variant={viewMode === 'activity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('activity')}
          >
            Activity
          </Button>
        </div>
      )}

      {viewMode === 'activity' ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis 
              dataKey="label" 
              className="stroke-muted-foreground" 
              fontSize={16}
            />
            <YAxis 
              className="stroke-muted-foreground" 
              fontSize={16}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(1 0 0)',
                border: '1px solid oklch(0.9 0.01 85)',
                borderRadius: '6px',
              }}
              labelFormatter={(label) => {
                const item = activityData.find(d => d.label === label);
                return item ? item.fullLabel : label;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {activityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getActivityColor(entry.count)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={contentBreakdown} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis 
              dataKey="day"
              className="stroke-muted-foreground" 
              fontSize={16}
              tickFormatter={(day) => formatDay(day).slice(0, 3)}
            />
            <YAxis 
              className="stroke-muted-foreground" 
              fontSize={16}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(1 0 0)',
                border: '1px solid oklch(0.9 0.01 85)',
                borderRadius: '6px',
              }}
              labelFormatter={(day) => formatDay(Number(day))}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  intended: 'Intended',
                  suggested: 'Suggested',
                  ads: 'Ads',
                };
                return [value, labels[name] || name];
              }}
            />
            <Bar dataKey="intended" stackId="a" fill="var(--chart-1)" />
            <Bar dataKey="suggested" stackId="a" fill="var(--chart-2)" />
            <Bar dataKey="ads" stackId="a" fill="var(--chart-3)" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}