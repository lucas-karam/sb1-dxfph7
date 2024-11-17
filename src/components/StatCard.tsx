import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-gray-500">vs. período anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}