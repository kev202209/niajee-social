'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Hls, { ErrorData } from 'hls.js';
import AuthenticatedImage from '@/components/Image';
import { FiVolume, FiVolumeX } from 'react-icons/fi';
import { getFullUrl } from '@/utils/videourl';

interface HoverPreviewPlayerProps {
  // Either a direct URL or a map of quality -> URL (e.g. { '1080p': '...', '720p': '...' })
  source: string | Record<string, string>;
  // Thumbnail URL (already resolved via getThumbnailSrc / getImageSrc)
  poster?: string;
  // Display
  className?: string;
  sizes?: string;
  rounded?: boolean;

  // Duration handling
  durationSeconds?: number;      // if provided, we show a live countdown on hover
  durationLabel?: string;        // fallback label to show when not hovering / no seconds

  // Playback defaults
  defaultMuted?: boolean;
  defaultVolume?: number;        // 0..1
}

const HoverPreviewPlayer: React.FC<HoverPreviewPlayerProps> = ({
  source,
  poster,
  className = '',
  sizes,
  rounded = true,
  durationSeconds,
  durationLabel,
  defaultMuted = true,
  defaultVolume = 0.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [ready, setReady] = useState(false);
  const [isMuted, setIsMuted] = useState(defaultMuted);
  const [volume, setVolume] = useState(defaultVolume);
  const [remaining, setRemaining] = useState<number | null>(durationSeconds ?? null);

  // Resolve a usable absolute URL (supports quality map or single key)
  const resolvedSrc = useMemo(() => {
    const pick = (val: string) => getFullUrl(val);
    if (typeof source === 'string') return pick(source);
    const order = ['1080p', '720p', '480p', '360p'];
    for (const q of order) {
      const v = source[q];
      if (v) return pick(v);
    }
    const first = Object.values(source)[0];
    return first ? pick(String(first)) : '';
  }, [source]);

  // Setup HLS or direct MP4 source
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !resolvedSrc) return;

    // cleanup old hls
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    el.playsInline = true;
    el.muted = true; // ensure autoplay compliance
    el.volume = volume;

    const attemptPlay = () => {
      el.play().catch(() => {});
    };

    // Safari native HLS
    if (resolvedSrc.includes('.m3u8') && el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = resolvedSrc;
      const onLoaded = () => {
        setReady(true);
        if (isHovered) attemptPlay();
      };
      el.addEventListener('loadedmetadata', onLoaded, { once: true });
      el.load();
      return () => {
        el.removeEventListener('loadedmetadata', onLoaded);
        el.removeAttribute('src');
        el.load();
      };
    }

    // Hls.js path
    if (resolvedSrc.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        autoStartLoad: true, // start loading so hover play is instant
      });
      hls.loadSource(resolvedSrc);
      hls.attachMedia(el);

      const onParsed = () => {
        setReady(true);
        if (isHovered) attemptPlay();
      };
      const onError = (_evt: string, data: ErrorData) => {
        if (data?.fatal) {
          try { hls.destroy(); } catch {}
        }
      };

      hls.on(Hls.Events.MANIFEST_PARSED, onParsed);
      hls.on(Hls.Events.ERROR, onError);
      hlsRef.current = hls;

      return () => {
        hls.off(Hls.Events.MANIFEST_PARSED, onParsed);
        hls.off(Hls.Events.ERROR, onError);
        try { hls.destroy(); } catch {}
        hlsRef.current = null;
      };
    }

    // MP4 or other direct sources
    el.src = resolvedSrc;
    const onCanPlay = () => {
      setReady(true);
      if (isHovered) attemptPlay();
    };
    el.addEventListener('canplay', onCanPlay, { once: true });
    el.load();

    return () => {
      el.removeEventListener('canplay', onCanPlay);
      el.removeAttribute('src');
      el.load();
    };
  }, [resolvedSrc, isHovered, volume]);

  // Hover play/pause behavior
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isHovered) {
      if (ready) {
        el.play().catch(() => {});
      }
    } else {
      el.pause();
    }
  }, [isHovered, ready]);

  // Live countdown while playing
  useEffect(() => {
    if (!durationSeconds) {
      setRemaining(null);
      return;
    }
    let rafId: number;
    const tick = () => {
      const el = videoRef.current;
      if (!el) { rafId = requestAnimationFrame(tick); return; }
      const base = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : durationSeconds;
      const left = Math.max(0, Math.round(base - (el.currentTime || 0)));
      setRemaining(left);
      rafId = requestAnimationFrame(tick);
    };
    if (isHovered && ready) {
      rafId = requestAnimationFrame(tick);
    } else {
      setRemaining(durationSeconds);
    }
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, [isHovered, ready, durationSeconds]);

  const formatted = (secs?: number | null) => {
    if (secs === null || secs === undefined) return durationLabel || '';
    const s = Math.max(0, Math.floor(secs));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${rounded ? 'rounded-lg' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail below */}
      {poster ? (
        <AuthenticatedImage
          mediaKey={poster}
          alt="preview thumbnail"
          fill
          className="absolute inset-0 object-cover w-full h-full"
          sizes={sizes}
          fallbackSrc="/placeholder-video.jpg"
        />
      ) : null}

      {/* Video overlay */}
      <video
        ref={videoRef}
        playsInline
        loop
        muted={true}
        className={`absolute inset-0 object-cover w-full h-full transition-opacity ${isHovered && ready ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Duration / countdown badge */}
      {(durationSeconds || durationLabel) && (
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {isHovered && ready && durationSeconds ? formatted(remaining) : (durationLabel ?? formatted(durationSeconds ?? null))}
        </div>
      )}

      {/* Simple mute + volume controls on hover */}
      <div className={`absolute left-2 bottom-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const next = !isMuted;
            setIsMuted(next);
            if (videoRef.current) videoRef.current.muted = next;
          }}
          className="bg-black/50 text-white p-1 rounded-full mr-2"
          aria-label="Toggle mute"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            if (videoRef.current) {
              videoRef.current.volume = v;
              if (v > 0 && isMuted) {
                setIsMuted(false);
                videoRef.current.muted = false;
              }
            }
          }}
          className="w-20 h-1 accent-white"
          aria-label="Volume"
        />
      </div>
    </div>
  );
};

export default HoverPreviewPlayer;