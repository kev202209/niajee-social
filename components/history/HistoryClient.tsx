'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchVideoHistory, fetchShortHistory } from '@/lib/api/history';
import { HistoryVideoCard, HistoryShortCard } from './HistoryUnifiedCards';
import { ProcessedImage } from '@/types';

type TabKey = 'all' | 'videos' | 'shorts';

interface RawHistoryChannel {
  id?: string;
  name?: string;
  handle?: string;
  avatar?: string | null;
}

interface RawHistoryItem {
  id: string;
  title?: string;
  thumbnail?: {
    data: ProcessedImage;
    type: 'auto-generated' | 'user-uploaded';
    status: 'queued' | 'processing' | 'complete' | 'failed';
  } | null;
  duration?: number | null;
  channel?: RawHistoryChannel;
  history?: {
    lastWatchedAt: string;
    positionSec?: number;
    durationSec?: number | null;
    completed?: boolean;
    timesWatched?: number;
  };
  [key: string]: unknown;
}

interface PagedResponse<T> {
  videos?: T[];
  shorts?: T[];
  pagination: {
    page: number;
    totalPages: number;
    total?: number;
  };
}

interface UnifiedItem {
  type: 'video' | 'short';
  id: string;
  title: string;
  thumbnail: {
    data: ProcessedImage;
    type: 'auto-generated' | 'user-uploaded';
    status: 'queued' | 'processing' | 'complete' | 'failed';
  } | null;
  duration: number | null;
  channel: {
    id: string;
    name: string;
    handle: string;
    avatar: string | null;
  };
  history: {
    lastWatchedAt: string;
    positionSec?: number;
    durationSec?: number | null;
    completed?: boolean;
    timesWatched?: number;
  };
  raw: RawHistoryItem;
}

function getDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (itemDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}

function groupByDate(items: UnifiedItem[]): Record<string, UnifiedItem[]> {
  const groups: Record<string, UnifiedItem[]> = {};
  items.forEach(item => {
    const date = new Date(item.history.lastWatchedAt);
    const label = getDateLabel(date);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(item);
  });
  return groups;
}

export default function HistoryClient() {
  const [tab, setTab] = useState<TabKey>('all');
  const [videoPage, setVideoPage] = useState(1);
  const [shortPage, setShortPage] = useState(1);
  const [videos, setVideos] = useState<RawHistoryItem[]>([]);
  const [shorts, setShorts] = useState<RawHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [videoDone, setVideoDone] = useState(false);
  const [shortDone, setShortDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = useCallback(async () => {
    if (videoDone || loading) return;
    setLoading(true);
    try {
      const res = (await fetchVideoHistory(videoPage, 20)) as PagedResponse<RawHistoryItem>;
      setVideos(prev => [...prev, ...(res.videos ?? [])]);
      if (res.pagination.page >= res.pagination.totalPages) setVideoDone(true);
      setVideoPage(p => p + 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to load video history');
    } finally {
      setLoading(false);
    }
  }, [videoPage, videoDone, loading]);

  const loadShorts = useCallback(async () => {
    if (shortDone || loading) return;
    setLoading(true);
    try {
      const res = (await fetchShortHistory(shortPage, 40)) as PagedResponse<RawHistoryItem>;
      setShorts(prev => [...prev, ...(res.shorts ?? [])]);
      if (res.pagination.page >= res.pagination.totalPages) setShortDone(true);
      setShortPage(p => p + 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to load shorts history');
    } finally {
      setLoading(false);
    }
  }, [shortPage, shortDone, loading]);

  useEffect(() => {
    void loadVideos();
    void loadShorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unified: UnifiedItem[] = [
    ...videos.map(v => ({
      type: 'video' as const,
      id: v.id,
      title: v.title ?? '',
      thumbnail: v.thumbnail ?? null,
      duration: v.duration ?? null,
      channel: {
        id: v.channel?.id ?? '',
        name: v.channel?.name ?? '',
        handle: v.channel?.handle ?? '',
        avatar: v.channel?.avatar ?? null
      },
      history: v.history ?? { lastWatchedAt: new Date().toISOString(), positionSec: 0, durationSec: null, completed: false, timesWatched: 0 },
      raw: v
    })),
    ...shorts.map(s => ({
      type: 'short' as const,
      id: s.id,
      title: s.title ?? '',
      thumbnail: s.thumbnail ?? null,
      duration: s.duration ?? null,
      channel: {
        id: s.channel?.id ?? '',
        name: s.channel?.name ?? '',
        handle: s.channel?.handle ?? '',
        avatar: s.channel?.avatar ?? null
      },
      history: s.history ?? { lastWatchedAt: new Date().toISOString(), positionSec: 0, durationSec: null, completed: false, timesWatched: 0 },
      raw: s
    }))
  ].sort(
    (a, b) =>
      new Date(b.history.lastWatchedAt).getTime() -
      new Date(a.history.lastWatchedAt).getTime()
  );

  const visible = tab === 'all'
    ? unified
    : tab === 'videos'
      ? unified.filter(i => i.type === 'video')
      : unified.filter(i => i.type === 'short');

  const grouped = groupByDate(visible);

  const loadMore = () => {
    if (tab === 'all') {
      if (!videoDone) void loadVideos();
      if (!shortDone) void loadShorts();
    } else if (tab === 'videos') {
      void loadVideos();
    } else {
      void loadShorts();
    }
  };

  const canLoadMore = tab === 'all'
    ? !(videoDone && shortDone)
    : tab === 'videos'
      ? !videoDone
      : !shortDone;

  return (
    <div className="w-full flex flex-col">
      <main className="flex-1 pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
            Watch History
          </h1>

          <div className="flex flex-wrap gap-3 mb-8">
            {(['all','videos','shorts'] as TabKey[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm font-medium border transition shadow-sm ${
                  tab === t
                    ? 'bg-blue-600 text-white border-transparent'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 text-sm bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {visible.length === 0 && !loading && (
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              No history yet.
            </p>
          )}

          {Object.entries(grouped).map(([dateLabel, items]) => {
            const videoItems = items.filter(item => item.type === 'video');
            const shortItems = items.filter(item => item.type === 'short');

            return (
              <div key={dateLabel} className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {dateLabel}
                </h2>
                
                {/* Videos Grid */}
                {videoItems.length > 0 && (
                  <div className="max-w-7xl mx-auto mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                      {videoItems.map(item => (
                        <div key={`${item.type}-${item.id}`}>
                          <HistoryVideoCard data={item.raw} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shorts Horizontal Scroll */}
                {shortItems.length > 0 && (
                  <div className="overflow-x-auto mb-6">
                    <div className="flex space-x-4 pb-2">
                      {shortItems.map(item => (
                        <div key={`${item.type}-${item.id}`} className="flex-shrink-0">
                          <HistoryShortCard data={item.raw} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {canLoadMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-400 transition disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}