'use client';

import React, { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, trendType = 'neutral' }) => {
  return (
    <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] hover:border-[#0d99ff] transition-all duration-200 shadow-figma-sm hover:shadow-figma cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded bg-[#f5f5f5] flex items-center justify-center text-[#666]">
          {icon}
        </div>
        {trend && (
          <div className={`text-[11px] font-medium px-2 py-0.5 rounded ${
            trendType === 'positive' ? 'text-[#0fa958] bg-[#e6f9f0]' : 
            trendType === 'negative' ? 'text-[#f24822] bg-[#fff0f0]' : 
            'text-[#666] bg-[#f5f5f5]'
          }`}>
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold text-[#0d0d0d] mb-1">{value}</div>
      <div className="text-[13px] text-[#666] font-medium">{label}</div>
    </div>
  );
};
