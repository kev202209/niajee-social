'use client';
import React, { useState, useCallback, useEffect } from 'react';
import {
  fetchVideoSaved,
  fetchShortSaved,
  fetchBlogSaved,
  toggleVideoSave,
  toggleShortSave,
  toggleBlogSave
} from '@/lib/api/saves';
import { SaveVideo, SaveShort, SaveBlog } from './SavedCards';
import Header from '@/components/home/Header';
import Sidebar from '@/components/home/Sidebar';
import Footer from '@/components/home/Footer';
import type { Video, Short, Blog } from '@/types';

type TabKey = 'all' | 'videos' | 'shorts' | 'blogs';

interface BaseSave {
  type: 'video' | 'short' | 'blog';
  id: string;
  title: string;
  createdAt?: string;
  savedAt?: string;
  data: Video | Short | Blog;
}

export default function SavedClient() {
  const [tab, setTab] = useState<TabKey>('all');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const [videos, setVideos] = useState<BaseSave[]>([]);
  const [shorts, setShorts] = useState<BaseSave[]>([]);
  const [blogs, setBlogs] = useState<BaseSave[]>([]);

  const [videoPage, setVideoPage] = useState(1);
  const [shortPage, setShortPage] = useState(1);
  const [blogPage, setBlogPage] = useState(1);

  const [videoDone, setVideoDone] = useState(false);
  const [shortDone, setShortDone] = useState(false);
  const [blogDone, setBlogDone] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = useCallback(async () => {
    if (videoDone || loading) return;
    setLoading(true);
    try {
      const res = await fetchVideoSaved(videoPage, 20);
      const list = (res.videos ?? []) as Video[];
      setVideos(prev => [
        ...prev,
        ...list.map((v) => {
          const raw = (v as unknown) as Record<string, unknown>;
          const savedAt = typeof raw.savedAt === 'string' ? raw.savedAt : undefined;
          return {
            type: 'video' as const,
            id: v.id,
            title: v.title ?? '',
            createdAt: typeof v.createdAt === 'string' ? v.createdAt : undefined,
            savedAt,
            data: v
          };
        })
      ]);
      if (res.pagination?.page >= res.pagination?.totalPages) setVideoDone(true);
      setVideoPage(p => p + 1);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || 'Failed to load video saves');
    } finally {
      setLoading(false);
    }
  }, [videoPage, videoDone, loading]);

  const loadShorts = useCallback(async () => {
    if (shortDone || loading) return;
    setLoading(true);
    try {
      const res = await fetchShortSaved(shortPage, 20);
      const list = (res.shorts ?? []) as Short[];
      setShorts(prev => [
        ...prev,
        ...list.map((s) => {
          const raw = (s as unknown) as Record<string, unknown>;
          const savedAt = typeof raw.savedAt === 'string' ? raw.savedAt : undefined;
          return {
            type: 'short' as const,
            id: s.id,
            title: s.title ?? s.caption ?? '',
            createdAt: typeof s.createdAt === 'string' ? s.createdAt : undefined,
            savedAt,
            data: s
          };
        })
      ]);
      if (res.pagination?.page >= res.pagination?.totalPages) setShortDone(true);
      setShortPage(p => p + 1);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || 'Failed to load short saves');
    } finally {
      setLoading(false);
    }
  }, [shortPage, shortDone, loading]);

  const loadBlogs = useCallback(async () => {
    if (blogDone || loading) return;
    setLoading(true);
    try {
      const res = await fetchBlogSaved(blogPage, 20);
      const list = (res.saves ?? []) as Blog[];
      setBlogs(prev => [
        ...prev,
        ...list.map((b) => {
          const raw = (b as unknown) as Record<string, unknown>;
          const savedAt = typeof raw.savedAt === 'string' ? raw.savedAt : undefined;
          return {
            type: 'blog' as const,
            id: b.id,
            title: b.title,
            createdAt: typeof b.createdAt === 'string' ? b.createdAt : undefined,
            savedAt,
            data: b
          };
        })
      ]);
      if (res.pagination?.page >= res.pagination?.totalPages) setBlogDone(true);
      setBlogPage(p => p + 1);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || 'Failed to load blog saves');
    } finally {
      setLoading(false);
    }
  }, [blogPage, blogDone, loading]);

  useEffect(() => {
    loadVideos();
    loadShorts();
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unified = [...videos, ...shorts, ...blogs].sort((a, b) => {
    const da = a.savedAt || a.createdAt || '';
    const db = b.savedAt || b.createdAt || '';
    return new Date(db).getTime() - new Date(da).getTime();
  });

  const visible =
    tab === 'all' ? unified :
    tab === 'videos' ? videos :
    tab === 'shorts' ? shorts : blogs;

  const canLoadMore =
    tab === 'all'
      ? !(videoDone && shortDone && blogDone)
      : tab === 'videos'
        ? !videoDone
        : tab === 'shorts'
          ? !shortDone
          : !blogDone;

  const loadMore = () => {
    if (tab === 'all') {
      if (!videoDone) loadVideos();
      if (!shortDone) loadShorts();
      if (!blogDone) loadBlogs();
      return;
    }
    if (tab === 'videos') loadVideos();
    else if (tab === 'shorts') loadShorts();
    else loadBlogs();
  };

  const handleToggleVideo = async (id: string) => {
    try {
      await toggleVideoSave(id);
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || 'Toggle failed');
    }
  };
  const handleToggleShort = async (id: string) => {
    try {
      await toggleShortSave(id);
      setShorts(prev => prev.filter(s => s.id !== id));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || 'Toggle failed');
    }
  };
  const handleToggleBlog = async (id: string) => {
    try {
      await toggleBlogSave(id);
      setBlogs(prev => prev.filter(b => b.id !== id));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || 'Toggle failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-indigo-950 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header />
      <div className="flex pt-16">
        <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
        <main className="flex-1 min-w-0 pt-8 pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Saved</h1>

            <div className="flex flex-wrap gap-3 mb-8">
              {(['all', 'videos', 'shorts', 'blogs'] as TabKey[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium border shadow-sm transition ${
                    tab === t
                      ? 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 text-white border-transparent'
                      : 'bg-white/80 dark:bg-gray-900/60 backdrop-blur border-gray-200 dark:border-white/10 hover:border-indigo-400/50'
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
              <p className="text-sm text-gray-500 dark:text-gray-400">No saves yet.</p>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map(item => {
                if (item.type === 'video')
                  return (
                    <SaveVideo
                      key={`video-${item.id}`}
                      data={item.data as Video}
                      onRemove={() => handleToggleVideo(item.id)}
                    />
                  );
                if (item.type === 'short')
                  return (
                    <SaveShort
                      key={`short-${item.id}`}
                      data={item.data as Short}
                      onRemove={() => handleToggleShort(item.id)}
                    />
                  );
                return (
                  <SaveBlog
                    key={`blog-${item.id}`}
                    data={item.data as Blog}
                    onRemove={() => handleToggleBlog(item.id)}
                  />
                );
              })}
            </div>

            {canLoadMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 rounded-xl text-sm font-medium border border-gray-300 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur hover:border-indigo-400/60 dark:hover:border-indigo-400/40 transition disabled:opacity-50"
                >
                  {loading ? 'Loading…' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}