'use client';

import React, { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, trendType }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          
          {trend && (
            <p className={`text-xs mt-2 font-medium ${
              trendType === 'positive' ? 'text-green-600' : 
              trendType === 'negative' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
};
