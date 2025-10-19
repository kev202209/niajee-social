"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/home/Header";
import Sidebar from "@/components/home/Sidebar";
import { SoundMeta, Short } from '@/types'
import { getFullUrl } from '@/utils/videourl'
import ShortCard from '@/components/home/ShortCard'
import AuthenticatedImage from "@/components/Image";
import { getImageSrc } from '@/utils/imageUtils';

const SoundDetailsPage = () => {
  const params = useParams();
  const soundId = useMemo(() => {
    const p = params?.id;
    return Array.isArray(p) ? p[0] : p || '';
  }, [params]);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [sound, setSound] = useState<SoundMeta | null>(null);
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Compute audioUrl from raw sound.audio
  const audioUrl = useMemo(() => {
    if (!sound?.audio) return undefined;
    const mp3 = sound.audio.variants?.mp3;
    if (mp3) return getFullUrl(mp3);
    if (sound.audio.originalKey) return getFullUrl(sound.audio.originalKey);
    return undefined;
  }, [sound?.audio]);

  // Audio controls state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const canPlay = Boolean(audioUrl);

  // SVG ring constants for the 80x80 cover tile
  const RING_RADIUS = 36;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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
          if (!cancelled) setSound(s as SoundMeta); // Direct cast (no normalization)
        } else {
          if (!cancelled) setSound({ id: soundId, title: 'Original audio' });
        }

        if (shortsRes.ok) {
          const data = await shortsRes.json();
          const rawShorts = (data.shorts || data.data || []) as Short[];
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

  // Reset audio when sound changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [audioUrl, soundId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) audio.pause();
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !canPlay) return;
    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch {
      // ignore play rejection
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    const cur = audio.currentTime || 0;
    const p = dur > 0 ? Math.min(1, Math.max(0, cur / dur)) : 0;
    setProgress(p);
  };

  const handleLoadedMetadata = () => setProgress(0);
  const handleEnded = () => { setIsPlaying(false); setProgress(1); };

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <Header />

      {/* Hidden audio element controlling playback */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <main className="pt-24 max-w-5xl mx-auto px-4 pb-16">
        {/* Sound header */}
        <div className="flex items-center gap-4">
          <div className="relative group w-20 h-20 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
            {sound?.cover ? (
              <AuthenticatedImage
                mediaKey={getImageSrc(sound.cover, '480w')}
                alt={sound.title || 'Original audio'}
                width={60}
                height={60}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/80 text-2xl"></div>
            )}

            {/* Circular progress ring overlay */}
            <svg
              className="absolute inset-0 pointer-events-none -rotate-90"
              viewBox="0 0 80 80"
              aria-hidden="true"
            >
              {/* Only show the played arc; no base circle */}
              <circle
                cx="40"
                cy="40"
                r={RING_RADIUS}
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={Math.max(0, (1 - progress) * RING_CIRCUMFERENCE)}
                style={{ transition: 'stroke-dashoffset 0.15s linear' }}
              />
            </svg>

            {/* Center play/pause button (icon-only, no surrounding colors) */}
            <button
              type="button"
              onClick={togglePlay}
              disabled={!canPlay}
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              className="absolute inset-0 m-auto flex items-center justify-center text-white focus:outline-none"
              style={{ width: '40px', height: '40px' }} // invisible click target, only icon is visible
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                  <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z"></path>
                </svg>
              )}
            </button>
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {sound?.title || 'Original audio'}
            </h1>
            {sound?.usageCount !== undefined && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {sound.usageCount} {sound.usageCount === 1 ? 'short' : 'shorts'}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-gray-700 my-6" />

        {/* Shorts list */}
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Shorts using this sound</h2>
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading…</div>
        ) : shorts.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">No shorts found for this sound.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {shorts.map((s) => (
              <ShortCard key={s.id} short={s} />
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