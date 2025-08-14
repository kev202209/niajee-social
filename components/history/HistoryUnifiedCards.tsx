'use client';
import React from 'react';
import VideoCard from '@/components/home/VideoCard';
import ShortCard from '@/components/home/ShortCard';

interface HistoryVideoProps {
  data: any; // raw video history object
}
interface HistoryShortProps {
  data: any; // raw short history object
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 4) return `${w}w ago`;
  return new Date(iso).toLocaleDateString();
};

function formatDur(sec?: number) {
  if (!sec) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60).toString().padStart(2,'0');
  return h ? `${h}:${m.toString().padStart(2,'0')}:${s}` : `${m}:${s}`;
}

export const HistoryVideoCard: React.FC<HistoryVideoProps> = ({ data }) => {
  const progressPct = data.history?.durationSec
    ? Math.min(100, (data.history.positionSec / data.history.durationSec) * 100)
    : data.history?.completed ? 100 : 0;

  // Adapt to VideoCard expected shape (assuming videoId)
  const adapted = { ...(data as any), videoId: data.id || data.videoId };

  return (
    <div className="relative group">
      <div className="relative">
        <VideoCard video={adapted} />
        {/* Duration badge (if VideoCard doesn’t already show) */}
        {data.duration && (
          <span className="absolute bottom-1 right-1 z-10 bg-black/70 text-white text-[11px] px-1.5 py-0.5 rounded">
            {formatDur(data.duration)}
          </span>
        )}
        {/* Progress bar overlay */}
        {progressPct > 0 && (
          <div className="absolute left-0 bottom-0 h-1 w-full bg-black/30">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-2 gap-y-0.5">
        <a
          href={`/channels/${data.channel?.handle?.replace(/^@/,'')}`}
          className="hover:underline font-medium text-gray-800 dark:text-gray-200"
        >
          {data.channel?.name}
        </a>
        <span>• {timeAgo(data.history.lastWatchedAt)}</span>
        {data.history.completed && <span>• Completed</span>}
        {!data.history.completed && progressPct > 5 && progressPct < 95 && (
          <span>• {progressPct.toFixed(0)}%</span>
        )}
      </div>
    </div>
  );
};

export const HistoryShortCard: React.FC<HistoryShortProps> = ({ data }) => {
  const pct = data.history?.completed
    ? 100
    : data.history?.positionSec && data.history?.durationSec
      ? (data.history.positionSec / data.history.durationSec) * 100
      : 0;

  const adapted = { ...(data as any), id: data.id };

  return (
    <div className="relative group">
      <div className="relative">
        <ShortCard short={adapted} />
        {/* Progress bar */}
        {pct > 0 && (
          <div className="absolute left-0 bottom-0 h-1 w-full bg-black/30">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        )}
        <span className="absolute top-1 left-1 bg-black/55 text-white text-[10px] px-1.5 py-0.5 rounded">
          Short
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-2 gap-y-0.5">
        {data.channel?.name && (
          <a
            href={`/channels/${data.channel.handle?.replace(/^@/,'')}`}
            className="hover:underline font-medium text-gray-800 dark:text-gray-200"
          >
            {data.channel.name}
          </a>
        )}
        <span>• {timeAgo(data.history.lastWatchedAt)}</span>
        {data.history.timesWatched > 1 && (
          <span>• {data.history.timesWatched} views</span>
        )}
      </div>
    </div>
  );
};