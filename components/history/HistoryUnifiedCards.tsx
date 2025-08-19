'use client';
import React from 'react';
import VideoCard from '@/components/home/VideoCard';
import ShortCard from '@/components/home/ShortCard';
import  timeAgo  from '@/app/utils/timeAgo';
import { Video, Short } from '@/types';

interface RawHistoryChannel {
  id?: string;
  name?: string;
  handle?: string;
  avatar?: string | null;
}

interface RawHistoryBase {
  id: string;
  title?: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  channel?: RawHistoryChannel;
  history?: {
    lastWatchedAt: string;
    positionSec?: number;
    durationSec?: number | null;
    completed?: boolean;
    timesWatched?: number;
  };
}

interface HistoryVideoProps {
  data: RawHistoryBase; // raw video history object
}
interface HistoryShortProps {
  data: RawHistoryBase; // raw short history object
}


function formatDur(sec?: number) {
  if (!sec) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60).toString().padStart(2,'0');
  return h ? `${h}:${m.toString().padStart(2,'0')}:${s}` : `${m}:${s}`;
}

export const HistoryVideoCard: React.FC<HistoryVideoProps> = ({ data }) => {
  const progressPct = data.history?.durationSec
    ? Math.min(100, (data.history.positionSec ?? 0) / (data.history.durationSec ?? 1) * 100)
    : data.history?.completed ? 100 : 0;

  // Safely read potential runtime fields without `any`
  const raw = data as unknown as Record<string, unknown>;

  // Build an object that matches the Video type required by VideoCard.
  // Fill missing required fields with sensible defaults.
  const adapted = {
    id: data.id,
    // canonical player id/name expected by VideoCard
    videoId: typeof raw.videoId === 'string' ? raw.videoId : data.id,
    // video sources: prefer an object if present, otherwise use empty string placeholder
    videoUrl:
      typeof raw.videoUrl === 'object' && raw.videoUrl !== null
        ? (raw.videoUrl as Record<string, string>)
        : (typeof raw.videoUrl === 'string' ? raw.videoUrl : ''),
    description: typeof raw.description === 'string' ? raw.description : '',
    // display fields
    title: data.title ?? '',
    // VideoCard expects `thumbnail` (not thumbnailUrl) and `thumbnail` should be a key for your image utility
    thumbnail: typeof raw.thumbnail === 'string' ? raw.thumbnail : String(data.thumbnailUrl ?? ''),
    thumbnailUrl: String(data.thumbnailUrl ?? ''),
    duration: data.duration ?? 0,
    // numeric stats
    views: typeof raw.views === 'number' ? raw.views : Number(raw.views ?? 0),
    likes: typeof raw.likes === 'number' ? raw.likes : Number(raw.likes ?? 0),
    dislikes: typeof raw.dislikes === 'number' ? raw.dislikes : 0,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    // channel shape expected by the Video type
    channel: {
      id: data.channel?.id ?? '',
      name: data.channel?.name ?? '',
      avatar: data.channel?.avatar ?? '',
      handle: data.channel?.handle ?? '',
    },
  } as unknown as Video;

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
        <span>• {timeAgo(data.history?.lastWatchedAt ?? new Date().toISOString())}</span>
        {data.history?.completed && <span>• Completed</span>}
        {!data.history?.completed && progressPct > 5 && progressPct < 95 && (
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
      ? (data.history.positionSec / (data.history.durationSec ?? 1)) * 100
      : 0;

  const rawShort = data as unknown as Record<string, unknown>;
  const adaptedShort = {
    id: data.id,
    videoUrl:
      typeof rawShort.videoUrl === 'object' && rawShort.videoUrl !== null
        ? (rawShort.videoUrl as Record<string, string>)
        : (typeof rawShort.videoUrl === 'string' ? rawShort.videoUrl : ''),
    title: data.title ?? '',
    thumbnail: typeof rawShort.thumbnail === 'string' ? rawShort.thumbnail : String(data.thumbnailUrl ?? ''),
    thumbnailUrl: String(data.thumbnailUrl ?? ''),
    duration: data.duration ?? 0,
    views: typeof rawShort.views === 'number' ? rawShort.views : Number(rawShort.views ?? 0),
    likes: typeof rawShort.likes === 'number' ? rawShort.likes : Number(rawShort.likes ?? 0),
    createdAt: typeof rawShort.createdAt === 'string' ? rawShort.createdAt : new Date().toISOString(),
    channel: {
      id: data.channel?.id ?? '',
      name: data.channel?.name ?? '',
      handle: data.channel?.handle ?? '',
      avatar: data.channel?.avatar ?? ''
    }
  } as unknown as Short;

  return (
    <div className="relative group">
      <div className="relative">
        <ShortCard short={adaptedShort} />
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
            href={`/channels/${(data.channel?.handle ?? '').replace(/^@/,'')}`}
            className="hover:underline font-medium text-gray-800 dark:text-gray-200"
          >
            {data.channel.name}
          </a>
        )}
        <span>• {timeAgo(data.history?.lastWatchedAt ?? new Date().toISOString())}</span>
        {data.history?.timesWatched && data.history.timesWatched > 1 && (
          <span>• {data.history.timesWatched} views</span>
        )}
      </div>
    </div>
  );
};