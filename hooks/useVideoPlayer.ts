// hooks/useVideoPlayer.ts
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

export interface VideoPlayerControls {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playPauseAnim: 'play' | 'pause' | null;
  volume: number;
  isMuted: boolean;
  volumeIndicator: { type: 'up' | 'down' | null; value: number };
  seekIndicator: 'forward' | 'rewind' | null;
  controlsVisible: boolean;
  mouseIdle: boolean;
  isAutoplay: boolean;
  ambientMode: boolean;
  isMiniplayer: boolean;
  isCinemaMode: boolean;
  isFullscreen: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  handleRewind: () => void;
  handleForward: () => void;
  toggleAutoplay: () => void;
  toggleAmbientMode: () => void;
  toggleMiniplayer: () => void;
  toggleCinemaMode: () => void;
  toggleFullscreen: () => void;
  handleSleepTimerChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handlePlaybackSpeedChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function useVideoPlayer({ src, autoplay = true }: { src: string; autoplay?: boolean }): VideoPlayerControls {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mouseIdleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playPauseAnim, setPlayPauseAnim] = useState<'play' | 'pause' | null>(null);

  // Volume
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeIndicator, setVolumeIndicator] = useState<{ type: 'up' | 'down' | null; value: number }>({ type: null, value: 0 });

  // Seek
  const [seekIndicator, setSeekIndicator] = useState<'forward' | 'rewind' | null>(null);

  // Controls visibility
  const [controlsVisible, setControlsVisible] = useState(true);
  const [mouseIdle, setMouseIdle] = useState(false);


    // Handlers
    const handleRewind = useCallback(() => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
      setSeekIndicator('rewind'); setTimeout(() => setSeekIndicator(null), 1000);
    }, []);
    const handleForward = useCallback(() => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, duration);
      setSeekIndicator('forward'); setTimeout(() => setSeekIndicator(null), 1000);
    }, [duration]);
    const toggleMute = useCallback(() => setIsMuted(m => !m), []);
    const toggleAutoplay = () => setIsAutoplay(a => !a);
    const toggleAmbientMode = () => setAmbientMode(a => !a);
    const toggleMiniplayer = () => { setIsMiniplayer(m => !m); if (isCinemaMode) setIsCinemaMode(false); };
    const toggleCinemaMode = () => { setIsCinemaMode(c => !c); if (isMiniplayer) setIsMiniplayer(false); };
    const toggleFullscreen = () => { if (!containerRef.current) return; document.fullscreenElement ? document.exitFullscreen() : containerRef.current.requestFullscreen(); };
    // Sleep Timer: when a duration is selected, pause the video after that time
    const handleSleepTimerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      let seconds = 0;
      if (value.includes("sec")) {
        seconds = parseInt(value);
      } else if (value.includes("hour")) {
        seconds = 3600;
      }
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
      if (seconds > 0) {
        sleepTimerRef.current = setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }, seconds * 1000);
      }
    };
  
    // Change playback speed
    const handlePlaybackSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSpeed = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.playbackRate = newSpeed;
      }
    };
      // Handle clicks on the progress bar for seeking
      const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        if (videoRef.current) {
          videoRef.current.currentTime = percentage * duration;
        }
      };


  // Modes
  const [isAutoplay, setIsAutoplay] = useState<boolean>(autoplay);
  const [ambientMode, setAmbientMode] = useState(true);
  const [isMiniplayer, setIsMiniplayer] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Read saved volume
  useEffect(() => {
    const cookie = document.cookie.split('; ').find(c => c.startsWith('volume='));
    if (cookie) {
      const v = parseFloat(cookie.split('=')[1]);
      if (!isNaN(v)) {
        setVolume(v);
        if (videoRef.current) videoRef.current.volume = v;
      }
    }
  }, []);
  useEffect(() => { if (videoRef.current) videoRef.current.volume = isMuted ? 0 : volume; }, [volume, isMuted]);

  // Metadata & time updates
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    const onMeta = () => setDuration(v.duration);
    const onTime = () => setCurrentTime(v.currentTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('timeupdate', onTime);
    return () => { v.removeEventListener('loadedmetadata', onMeta); v.removeEventListener('timeupdate', onTime); };
  }, []);

  // Fullscreen listener
  useEffect(() => { const onFS = () => setIsFullscreen(!!document.fullscreenElement); document.addEventListener('fullscreenchange', onFS); return () => document.removeEventListener('fullscreenchange', onFS); }, []);

  // Play/Pause
  const togglePlay = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    if (isPlaying) { v.pause(); setIsPlaying(false); setPlayPauseAnim('pause'); }
    else { v.play(); setIsPlaying(true); setPlayPauseAnim('play'); }
    setTimeout(() => setPlayPauseAnim(null), 1000);
  }, [isPlaying]);
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.code === 'Space' && !(document.activeElement instanceof HTMLInputElement)) { e.preventDefault(); togglePlay(); } }; document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey); }, [togglePlay]);

  // Mouse idle
  useEffect(() => {
    const onMove = () => {
      setControlsVisible(true); setMouseIdle(false);
      if (mouseIdleTimerRef.current) clearTimeout(mouseIdleTimerRef.current);
      if (isPlaying) {
        mouseIdleTimerRef.current = setTimeout(() => { setMouseIdle(true); setControlsVisible(false); }, 3000);
      }
    };
    const c = containerRef.current;
    if (c) {
      c.addEventListener('mousemove', onMove);
      c.addEventListener('mouseleave', () => isPlaying && setControlsVisible(false));
      c.addEventListener('mouseenter', () => setControlsVisible(true));
    }
    return () => { if (c) c.removeEventListener('mousemove', onMove); };
  }, [isPlaying]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement) return;
      switch (e.code) {
        case 'ArrowUp': e.preventDefault(); setVolume(v => Math.min(1, v + 0.03)); break;
        case 'ArrowDown': e.preventDefault(); setVolume(v => Math.max(0, v - 0.03)); break;
        case 'ArrowLeft': e.preventDefault(); handleRewind(); break;
        case 'ArrowRight': e.preventDefault(); handleForward(); break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleRewind, handleForward, toggleMute]);



  return {
    videoRef,
    containerRef,
    isPlaying,
    currentTime,
    duration,
    playPauseAnim,
    volume,
    isMuted,
    volumeIndicator,
    seekIndicator,
    controlsVisible,
    mouseIdle,
    isAutoplay,
    ambientMode,
    isMiniplayer,
    isCinemaMode,
    isFullscreen,
    togglePlay,
    toggleMute,
    setVolume,
    handleRewind,
    handleForward,
    toggleAutoplay,
    toggleAmbientMode,
    toggleMiniplayer,
    toggleCinemaMode,
    toggleFullscreen,
    handleSleepTimerChange,
    handlePlaybackSpeedChange,
    handleProgressClick
  };
}