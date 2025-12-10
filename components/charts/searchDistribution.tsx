/**
 * Search Distribution Chart
 * Donut chart showing search type distribution
 */

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SearchDistributionChartProps {
  profile: number;
  keyword: number;
  place: number;
}

export function SearchDistributionChart({ profile, keyword, place }: SearchDistributionChartProps) {
  const data = [
    { name: 'Profile', value: profile, color: 'var(--chart-1)' },
    { name: 'Keyword', value: keyword, color: 'var(--chart-2)' },
    { name: 'Place', value: place, color: 'var(--chart-3)' },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
        No search data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={150}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'oklch(1 0 0)',
            border: '1px solid oklch(0.9 0.01 85)',
            borderRadius: '6px',
          }}
          formatter={(value: number) => `${value}%`}
        />
        <Legend 
          verticalAlign="middle" 
          align="right"
          layout="vertical"
          iconType="circle"
          iconSize={12}
          formatter={(value) => <span className="text-xs">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}