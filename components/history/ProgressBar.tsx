'use client';

interface Props { percent: number; }

export default function ProgressBar({ percent }: Props) {
  return (
    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
      <div
        className="h-full bg-indigo-500 dark:bg-fuchsia-400 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent)).toFixed(2)}%` }}
      />
    </div>
  );
}