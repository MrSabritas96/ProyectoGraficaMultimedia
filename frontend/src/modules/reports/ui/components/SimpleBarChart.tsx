"use client";

import React from 'react';

interface DataItem {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: DataItem[];
  title: string;
}

export const SimpleBarChart: React.FC<Props> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-bold text-slate-800">{item.value}</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${item.color}`} 
                style={{ width: `\${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
