"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Header from "@/components/home/Header";
import Sidebar from "@/components/home/Sidebar";
import MobileBottomNav from "@/components/home/MobileBottomNav";
import VideoPlayer from "./shortVideoPlayer";
import ShortsSkeleton from './ShortSkeleton';
import VideoActions from "./VideoActions";
import ReportModal from "./ReportModal"; 
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import CommentsSection from "./CommentsSection";
import { getFullUrl } from "@/utils/videourl";
import { FullShortData, getImageSrcSafe } from '@/types'

const PREFETCH_AHEAD = 2;

const ShortVideoPage = () => {
  const params = useParams();
  const initialVideoId = Array.isArray(params?.v) ? params.v[0] : params?.v;
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const [currentVideo, setCurrentVideo] = useState<FullShortData | null>(null);
  const [nextQueue, setNextQueue] = useState<FullShortData[]>([]); // buffer of upcoming shorts
  const [videoHistory, setVideoHistory] = useState<FullShortData[]>([]);
  const [loading, setLoading] = useState(true);

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentVideoRef = useRef<HTMLVideoElement>(null!);

  // Prefer HLS master, then explicit master key, then qualities, then any
  const getBestVideoUrl = (video: FullShortData): string => {
    if (video.videoSrc) return getFullUrl(video.videoSrc);
    if (video.masterPlaylist) return getFullUrl(video.masterPlaylist);
    if (typeof video.videoUrl === 'string') return getFullUrl(video.videoUrl);
    if (video.videoUrl && typeof video.videoUrl === 'object') {
      const order = ['master', '1080p', '720p', '480p', '360p', '240p', 'progressive'];
      for (const key of order) {
        const candidate = (video.videoUrl as Record<string, string>)[key];
        if (typeof candidate === 'string' && candidate) return getFullUrl(candidate);
      }
      const keys = Object.keys(video.videoUrl);
      if (keys.length > 0) {
        const first = (video.videoUrl as Record<string, string>)[keys[0]];
        if (typeof first === 'string') return getFullUrl(first);
      }
    }
    return '';
  };

  // Minimal type guard; no normalization
  const isFullShort = (raw: unknown): raw is FullShortData => {
    if (!raw || typeof raw !== 'object') return false;
    const o = raw as Record<string, unknown>;
    return typeof o.id === 'string';
  };

  // Fetch one by ID or any single
  const fetchCurrentVideo = async (videoId?: string): Promise<FullShortData | null> => {
    try {
      if (videoId) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoId}`, { credentials: "include" });
        if (!res.ok) return null;
        const data = await res.json();
        return isFullShort(data) ? data : null;
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/feed/shorts?limit=1`, { credentials: "include" });
        if (!res.ok) return null;
        const data = await res.json();
        const raw = (data?.shorts?.[0] ?? data?.data?.[0]) as unknown;
        return isFullShort(raw) ? raw : null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Fetch a batch from feed with exclusions (no normalization)
  const fetchFeedBatch = async (limit: number, excludeIds: string[]): Promise<FullShortData[]> => {
    const excludeParam = excludeIds.length ? `&exclude=${excludeIds.join(',')}` : '';
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/content/feed/shorts?limit=${limit}${excludeParam}`,
      { credentials: 'include' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items = (data?.shorts ?? data?.data ?? []) as unknown[];
    const filtered = items.filter(isFullShort) as FullShortData[];
    // de-duplicate by id
    const seen = new Set<string>();
    const unique: FullShortData[] = [];
    for (const s of filtered) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        unique.push(s);
      }
    }
    return unique;
  };

  // Fill queue to target size
  const fillQueue = useCallback(async () => {
    if (!currentVideo) return;
    const exclude = new Set<string>([
      currentVideo.id,
      ...videoHistory.map(v => v.id),
      ...nextQueue.map(v => v.id),
    ]);
    const need = Math.max(0, PREFETCH_AHEAD - nextQueue.length);
    if (need === 0) return;
    const batch = await fetchFeedBatch(PREFETCH_AHEAD, Array.from(exclude));
    // Keep only new items not already in queue
    const newOnes = batch.filter(b => !exclude.has(b.id));
    if (newOnes.length) {
      setNextQueue(prev => {
        const existing = new Set(prev.map(v => v.id));
        const merged = [...prev, ...newOnes.filter(n => !existing.has(n.id))];
        return merged.slice(0, PREFETCH_AHEAD); // cap buffer
      });
    }
  }, [currentVideo, videoHistory, nextQueue]);

  // Init
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const current = await fetchCurrentVideo(initialVideoId);
      if (!current) {
        setLoading(false);
        return;
      }
      setCurrentVideo(current);
      updateUrl(current.id);
      // prime buffer
      const batch = await fetchFeedBatch(PREFETCH_AHEAD, [current.id]);
      setNextQueue(batch);
      setLoading(false);
    };
    void init();
  }, [initialVideoId]);

  // Refill when queue shrinks
  useEffect(() => {
    if (currentVideo) void fillQueue();
  }, [currentVideo, nextQueue.length, fillQueue]);

  // Volume persistence
  useEffect(() => {
    try {
      const savedVolume = localStorage.getItem('video-volume');
      if (savedVolume) {
        const vol = parseFloat(savedVolume);
        if (!isNaN(vol) && vol >= 0 && vol <= 1) setVolume(vol);
      }
    } catch (e) {
      console.warn('Failed to read volume from localStorage:', e);
    }
  }, []);
  const updateVolumeStorage = (vol: number) => {
    try { localStorage.setItem('video-volume', vol.toString()); } catch {}
  };

  const updateUrl = (id: string) => {
    window.history.pushState(null, '', `/shorts/${id}`);
  };

  // Derived next video from queue
  const nextVideo = useMemo(() => nextQueue[0] ?? null, [nextQueue]);

  // Navigation: next
  const handleScrollDown = useCallback(async () => {
    if (!nextVideo || !scrollContainerRef.current || !currentVideo) return;
    scrollContainerRef.current.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    setTimeout(async () => {
      setVideoHistory(prev => [...prev, currentVideo]);
      const newCurrent = nextVideo;
      setCurrentVideo(newCurrent);
      updateUrl(newCurrent.id);
      setIsPaused(false);
      setIsMuted(true);
      if (currentVideoRef.current) currentVideoRef.current.muted = true;

      // drop head and refill
      setNextQueue(prev => prev.slice(1));
      // Refill in background using latest snapshot
      const exclude = [
        ...videoHistory.map(v => v.id),
        currentVideo.id,
        newCurrent.id,
        ...nextQueue.slice(1).map(v => v.id),
      ];
      const refill = await fetchFeedBatch(PREFETCH_AHEAD, exclude);
      setNextQueue(prev => {
        const existing = new Set(prev.map(v => v.id));
        const merged = [...prev, ...refill.filter(n => !existing.has(n.id))];
        return merged.slice(0, PREFETCH_AHEAD);
      });

      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }, 600);
  }, [nextVideo, currentVideo, videoHistory, nextQueue]);

  // Navigation: previous
  const handleScrollUp = useCallback(() => {
    if (videoHistory.length === 0 || !scrollContainerRef.current || !currentVideo) return;
    const prevVideo = videoHistory[videoHistory.length - 1];
    scrollContainerRef.current.scrollTo({ top: window.innerHeight, behavior: "auto" });
    scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setVideoHistory(prev => prev.slice(0, -1));
      setCurrentVideo(prevVideo);
      updateUrl(prevVideo.id);
      setIsPaused(false);
      setIsMuted(true);
      if (currentVideoRef.current) currentVideoRef.current.muted = true;
    }, 600);
  }, [videoHistory, currentVideo]);

  // Keyboard and wheel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") handleScrollUp();
      else if (e.key === "ArrowDown") handleScrollDown();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleScrollUp, handleScrollDown]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) handleScrollDown();
      else if (e.deltaY < 0) handleScrollUp();
    };
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel);
    return () => el.removeEventListener("wheel", onWheel);
  }, [handleScrollDown, handleScrollUp]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      if (currentVideoRef.current) currentVideoRef.current.muted = next;
      return next;
    });
  };

  const togglePlayPause = () => {
    if (!currentVideoRef.current) return;
    if (isPaused) {
      currentVideoRef.current.volume = volume;
      setIsMuted(false);
      currentVideoRef.current.muted = false;
      currentVideoRef.current.play();
    } else {
      currentVideoRef.current.pause();
    }
    setIsPaused(p => !p);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    updateVolumeStorage(newVolume);
    if (currentVideoRef.current) {
      currentVideoRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        currentVideoRef.current.muted = false;
      }
      if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
        currentVideoRef.current.muted = true;
      }
    }
  };

  const toggleComments = () => setShowComments(prev => !prev);
  const handleShowReport = () => setShowReport(true);

  if (loading || !currentVideo) return <ShortsSkeleton />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative">
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <Header />

      <div className="pt-10">
        <div ref={scrollContainerRef} className="h-screen overflow-hidden flex justify-center">
          <div className="h[200vh] w-full max-w-[500px] relative">
            {/* Current Video */}
            <div className="relative h-screen">
              <div className="flex items-center justify-center h-full">
                <VideoPlayer
                  videoRef={currentVideoRef}
                  videoSrc={getBestVideoUrl(currentVideo)}
                  videoId={currentVideo.id}
                  isMuted={isMuted}
                  isPaused={isPaused}
                  volume={volume}
                  onVolumeChange={handleVolumeChange}
                  toggleMute={toggleMute}
                  togglePlayPause={togglePlayPause}
                  channel={{
                    name: currentVideo.channel.name,
                    icon: getImageSrcSafe(currentVideo.channel.avatar),
                  }}
                  caption={currentVideo.description || currentVideo.title || ""}
                  song="Original Audio"
                  onAutoplayFallbackMuted={() => setIsMuted(true)}
                />
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                <VideoActions 
                  video={currentVideo}
                  onToggleComments={toggleComments}
                  onShowReport={handleShowReport}
                />
              </div>

              <div className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 flex-col items-center space-y-4 z-30">
                <button
                  onClick={handleScrollUp}
                  disabled={videoHistory.length === 0}
                  className="bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-full transition-all duration-200"
                  aria-label="Previous video"
                >
                  <FaArrowUp className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleScrollDown}
                  disabled={!nextVideo}
                  className="bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-full transition-all duration-200"
                  aria-label="Next video"
                >
                  <FaArrowDown className="w-5 h-5 text-white" />
                </button>
              </div>

              {showComments && (
                <CommentsSection
                  shortId={currentVideo.id}
                  commentsEnabled={currentVideo.allowComments}
                  onClose={() => setShowComments(false)}
                />
              )}
            </div>

            {/* Next Preview (first in queue) */}
            <div className="h-screen flex items-center justify-center">
              {nextVideo ? (
                <VideoPlayer
                  videoRef={null}
                  videoSrc={getBestVideoUrl(nextVideo)}
                  videoId={nextVideo.id}
                  isMuted={true}
                  isPaused={true}
                  volume={volume}
                  onVolumeChange={handleVolumeChange}
                  toggleMute={() => {}}
                  togglePlayPause={() => {}}
                  channel={{
                    name: nextVideo.channel.name,
                    icon: getImageSrcSafe(nextVideo.channel.avatar),
                  }}
                  caption={nextVideo.description || nextVideo.title || ""}
                  song="Original Audio"
                />
              ) : (
                <ShortsSkeleton />
              )}
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        videoId={currentVideo.id}
        videoTitle={currentVideo.title}
      />
      <MobileBottomNav />
    </div>
  );
};

export default ShortVideoPage;
