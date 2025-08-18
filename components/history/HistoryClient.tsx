'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchVideoHistory, fetchShortHistory } from '@/lib/api/history';
import { HistoryVideoCard, HistoryShortCard } from './HistoryUnifiedCards';
import Header from '@/components/Landing/Header';
import Footer from '@/components/Landing/Footer';

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
  // extra raw fields are allowed
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

  const unified = [
    ...videos.map(v => ({
      type: 'video' as const,
      id: v.id,
      title: v.title ?? '',
      thumbnailUrl: v.thumbnailUrl ?? null,
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
      thumbnailUrl: s.thumbnailUrl ?? null,
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
    <div className="min-h-screen bg-gray-50 dark:bg-indigo-950 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            Watch History
          </h1>

            <div className="flex flex-wrap gap-3 mb-8">
            {(['all','videos','shorts'] as TabKey[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition shadow-sm ${
                  tab === t
                    ? 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 text-white border-transparent'
                    : 'bg-white/80 dark:bg-gray-900/60 backdrop-blur border-gray-200 dark:border-white/10 hover:border-indigo-400/60'
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No history yet.
            </p>
          )}

          <ul className="space-y-10">
            {visible.map(item => (
              <li key={`${item.type}-${item.id}`}>
                {item.type === 'video'
                  ? <HistoryVideoCard data={item.raw} />
                  : <HistoryShortCard data={item.raw} />}
              </li>
            ))}
          </ul>

          {canLoadMore && (
            <div className="mt-10">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-medium border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-900 hover:border-indigo-400/60 dark:hover:border-indigo-400/40 transition disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}