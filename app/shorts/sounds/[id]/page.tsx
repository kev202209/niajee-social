"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/home/Header";
import Sidebar from "@/components/home/Sidebar";
import { SoundMeta, Short } from '@/types' // UPDATED: import Short instead of SoundShortItem
import { getFullUrl } from '@/utils/videourl'
import ShortCard from '@/components/home/ShortCard'
import { Play, Pause } from 'lucide-react' // REMOVED: Music2


const normalizeSoundMeta = (raw: unknown, fallbackId: string): SoundMeta => {
  const o = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : {};
  const id = typeof o.id === 'string' ? o.id : fallbackId;
  const title =
    (typeof o.title === 'string' && o.title) ||
    (typeof o.name === 'string' && o.name) ||
    'Original audio';

  // cover can be null or a key; accept string keys directly
  let coverArt: string | undefined;
  const cover = (o as Record<string, unknown>).cover;
  if (typeof cover === 'string') coverArt = cover;
  if (!coverArt && typeof o.coverArt === 'string') coverArt = o.coverArt;
  if (!coverArt && typeof o.thumbnail === 'string') coverArt = o.thumbnail;
  if (!coverArt && typeof o.image === 'string') coverArt = o.image;

  // audio.variants.mp3 or audio.originalKey
  let audioUrl: string | undefined;
  const audio = (o as Record<string, unknown>).audio;
  if (audio && typeof audio === 'object') {
    const av = (audio as Record<string, unknown>).variants;
    const originalKey = (audio as Record<string, unknown>).originalKey;
    if (av && typeof av === 'object') {
      const mp3 = (av as Record<string, unknown>).mp3;
      if (typeof mp3 === 'string') audioUrl = getFullUrl(mp3);
    }
    if (!audioUrl && typeof originalKey === 'string') audioUrl = getFullUrl(originalKey);
  }
  if (!audioUrl) {
    const audioUrlRaw = (o as Record<string, unknown>).audioUrl;
    if (typeof audioUrlRaw === 'string') audioUrl = audioUrlRaw;
  }

  const durationSec =
    typeof (o as Record<string, unknown>).durationSec === 'number'
      ? (o as Record<string, unknown>).durationSec as number
      : undefined;

  return { id, title, coverArt, audioUrl, durationSec };
};

// REMOVED: normalizeShorts and toShortCardModel (no normalization)

const SoundDetailsPage = () => {
  const params = useParams();
  const soundId = useMemo(() => {
    const p = params?.id;
    return Array.isArray(p) ? p[0] : p || '';
  }, [params]);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [sound, setSound] = useState<SoundMeta | null>(null);
  const [shorts, setShorts] = useState<Short[]>([]); // UPDATED: state and load functions to use Short[] directly
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // ADD
  const [duration, setDuration] = useState(0); // ADD

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      setIsPlaying(!el.paused);
      setCurrentTime(el.currentTime);
      if (el.duration && el.duration !== duration) setDuration(el.duration);
    }, 100);

    return () => clearInterval(interval);
  }, [audioRef, duration]); // Polls audio state every 100ms

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [soundRes, shortsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shorts/sounds/${soundId}`, { credentials: 'include' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shorts/sounds/${soundId}/shorts?page=1&limit=20`, { credentials: 'include' }),
        ]);

        if (soundRes.ok) {
          const s = await soundRes.json();
          if (!cancelled) setSound(normalizeSoundMeta(s, soundId));
        } else {
          if (!cancelled) setSound({ id: soundId, title: 'Original audio' });
        }

        if (shortsRes.ok) {
          const data = await shortsRes.json();
          const rawShorts = (data.shorts || data.data || []) as Short[]; // SAFE: API matches Short shape
          if (!cancelled) {
            setShorts(rawShorts);
            setHasMore(rawShorts.length >= 20);
            setPage(1);
          }
        } else {
          if (!cancelled) {
            setShorts([]);
            setHasMore(false);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (soundId) void load();
    return () => { cancelled = true; };
  }, [soundId]);

  const loadMore = async () => {
    const next = page + 1;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shorts/sounds/${soundId}/shorts?page=${next}&limit=20`, { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    const rawShorts = (data.shorts || data.data || []) as Short[];
    setShorts(prev => [...prev, ...rawShorts]);
    setPage(next);
    setHasMore(rawShorts.length >= 20);
  };

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 283 : 0; // 283 is circumference for r=45

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <Header />

      <main className="pt-24 max-w-5xl mx-auto px-4 pb-16">
        {/* Sound header */}
        <div className="flex items-center gap-4">
          <div className={`relative group w-20 h-20 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center ${isPlaying ? 'ring-2 ring-emerald-500/70' : ''}`}>
            {sound?.coverArt ? (
              <img src={sound.coverArt} alt={sound.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/80 text-2xl">♪</div>
            )}

            {/* REMOVED: music icon in corner */}

            {/* Minimal centered play/pause overlay with circular progress */}
            {sound?.audioUrl && (
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                aria-pressed={isPlaying}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-white flex items-center justify-center opacity-100 group-hover:opacity-100 shadow-lg"
              >
                {/* Circular progress bar */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="white"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="283"
                    strokeDashoffset={283 - progress}
                    className="transition-all duration-200"
                  />
                </svg>
                {/* Centered icon */}
                <div className="relative z-10">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </div>
              </button>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {sound?.title || 'Original audio'}
            </h1>
            {sound?.durationSec !== undefined && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Math.floor(sound.durationSec / 60)}:{`${Math.floor(sound.durationSec % 60)}`.padStart(2, '0')}
              </p>
            )}
            {/* Removed text Play/Pause button; playback handled via overlay */}
            {sound?.audioUrl && (
              <audio ref={audioRef} src={sound.audioUrl} preload="metadata" />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-gray-700 my-6" />

        {/* Shorts list */}
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Shorts using this audio</h2>
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading…</div>
        ) : shorts.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">No shorts found for this audio.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {shorts.map((s) => (
              <ShortCard key={s.id} short={s} /> // UPDATED: pass raw short directly (no normalization)
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="mt-6">
            <button
              onClick={loadMore}
              className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Load more
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SoundDetailsPage;