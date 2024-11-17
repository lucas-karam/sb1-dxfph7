import React from 'react';
import { Line, LineChart as RechartsLine, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
}

export function LineChart({ data, dataKey, xAxisKey, color = '#6366f1', height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLine data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} />
      </RechartsLine>
    </ResponsiveContainer>
  );
}