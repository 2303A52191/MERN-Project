import React from 'react';

export const SkeletonBase = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800/60 rounded ${className}`} />
);

export const SkeletonCard = () => (
  <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800 space-y-4">
    <div className="flex justify-between items-center">
      <SkeletonBase className="h-6 w-1/3" />
      <SkeletonBase className="h-10 w-10 rounded-xl" />
    </div>
    <SkeletonBase className="h-8 w-1/4" />
    <SkeletonBase className="h-4 w-1/2" />
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBase
        key={i}
        className={`h-4 ${
          i === lines - 1 ? 'w-2/3' : 'w-full'
        }`}
      />
    ))}
  </div>
);

export const SkeletonList = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/40"
      >
        <SkeletonBase className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-1/4" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonKanban = () => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/20">
        <SkeletonBase className="h-6 w-1/2 rounded" />
        {Array.from({ length: 2 }).map((_, j) => (
          <div
            key={j}
            className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3 shadow-sm"
          >
            <SkeletonBase className="h-5 w-5/6" />
            <SkeletonBase className="h-3 w-1/2" />
            <div className="flex justify-between items-center pt-2">
              <SkeletonBase className="h-6 w-1/4 rounded-full" />
              <SkeletonBase className="h-6 w-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);
