import React from 'react';
import { Bar, BarChart as RechartsBar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
}

export function BarChart({ data, dataKey, xAxisKey, color = '#6366f1', height = 300 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} />
      </RechartsBar>
    </ResponsiveContainer>
  );
}