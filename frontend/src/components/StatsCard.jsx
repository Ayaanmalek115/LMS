import React from 'react';
import { BookOpen, Layers, CheckCircle2, BookmarkCheck } from 'lucide-react';

export default function StatsCard({ stats }) {
  if (!stats) return null;

  const items = [
    {
      label: 'Unique Titles',
      value: stats.totalTitles || 0,
      icon: BookOpen,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Total Inventory Copies',
      value: stats.totalCopies || 0,
      icon: Layers,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
    },
    {
      label: 'Available in Stock',
      value: stats.availableCopies || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Currently Issued Loans',
      value: stats.activeLoans || 0,
      icon: BookmarkCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((it, idx) => {
        const Icon = it.icon;
        return (
          <div
            key={idx}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${it.bg}`}>
              <Icon className={`w-6 h-6 ${it.color}`} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{it.value}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">{it.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
