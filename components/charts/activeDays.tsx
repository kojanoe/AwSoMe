/**
 * Active Days Chart
 * Vertical bar chart showing activity distribution by day of week
 */

'use client';

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatDay } from '@/lib/stats/behavioralPatterns';

interface ActiveDaysChartProps {
  data: Record<number, number>;
}

export function ActiveDaysChart({ data }: ActiveDaysChartProps) {
  const chartData = [0, 1, 2, 3, 4, 5, 6].map(day => ({
    day,
    label: formatDay(day).slice(0, 3),
    fullLabel: formatDay(day),
    count: data[day] || 0,
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
    const intensity = count / maxCount;
    if (intensity > 0.7) return 'var(--chart-1)';
    if (intensity > 0.4) return 'var(--chart-2)';
    return 'var(--chart-3)';
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
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
            const item = chartData.find(d => d.label === label);
            return item ? item.fullLabel : label;
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