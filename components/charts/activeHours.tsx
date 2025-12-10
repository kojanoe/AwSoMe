/**
 * Active Hours Chart
 * Vertical pillar chart showing activity distribution by hour
 */

'use client';

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatHour } from '@/lib/stats/behavioralPatterns';

interface ActiveHoursChartProps {
  data: Record<number, number>;
}

export function ActiveHoursChart({ data }: ActiveHoursChartProps) {
  // Create data for all 24 hours
  const chartData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: formatHour(hour),
    shortLabel: hour.toString().padStart(2, '0'),
    count: data[hour] || 0,
  }));

  const maxCount = Math.max(...chartData.map(d => d.count));

  if (maxCount === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        No activity data available
      </div>
    );
  }

  const getColor = (count: number) => {
    if (count === 0) return 'oklch(0.93 0.03 85)'; // muted background for empty hours
    const intensity = count / maxCount;
    if (intensity > 0.7) return 'var(--chart-1)';
    if (intensity > 0.4) return 'var(--chart-2)';
    return 'var(--chart-3)';
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis 
          dataKey="shortLabel" 
          className="stroke-muted-foreground" 
          fontSize={16}
          interval={1}
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
            const item = chartData.find(d => d.shortLabel === label);
            return item ? item.label : label;
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.count)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}