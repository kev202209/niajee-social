import { FC, useEffect, useRef, useState } from 'react';
import { FaVolumeMute, FaVolumeDown, FaVolumeUp, } from 'react-icons/fa';
import { LuPause, LuPlay } from "react-icons/lu";
import { FiLock } from 'react-icons/fi';
import Link from 'next/link';
import Hls from 'hls.js';
import ShortsProgressBar from './ShortsProgressBar';
import ViewTrackingService from '@/utils/ViewTrackingService';
import { getDeviceInfo, DeviceInfo } from '@/utils/deviceInfo';
import BufferingSpinner from '@/components/video/BufferingSpinner';
import AuthenticatedImage from '@/components/Image';
import { getImageSrc } from '@/utils/imageUtils';
import { ProcessedImage } from '@/types';

interface Channel {
  name: string;
  icon: string | null;
  handle?: string;
  id?: string;
}

interface Thumbnail {
  data?: ProcessedImage;
  type?: 'auto-generated' | 'user-uploaded';
  status?: 'queued' | 'processing' | 'complete' | 'failed';
}

interface VideoPlayerProps {
  videoId: string;
  videoRef: React.RefObject<HTMLVideoElement> | null;
  videoSrc: string;
  isMuted: boolean;
  isPaused: boolean;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMute: () => void;
  togglePlayPause: () => void;
  channel: Channel;
  caption: string;
  song: string;
  onAutoplayFallbackMuted?: () => void;
  // NEW
  shouldAutoPlay?: boolean; // defaults to true
  preloadMode?: 'auto' | 'metadata' | 'none'; // defaults to 'auto'
  // Membership fields
  needsMembership?: boolean;
  canAccess?: boolean;
  requiredTierId?: string | null;
  thumbnail?: Thumbnail | null;
}

// Helper function to get thumbnail media key for AuthenticatedImage
const getThumbnailMediaKey = (thumbnail?: Thumbnail | null): string | null => {
  if (!thumbnail?.data) return null;
  
  const src = getImageSrc(thumbnail.data, '720w');
  return src || null;
};

const VideoPlayer: FC<VideoPlayerProps> = ({
  videoId,
  videoRef,
  videoSrc,
  isMuted,
  isPaused,
  volume,
  onVolumeChange,
  toggleMute,
  togglePlayPause,
  channel,
  caption,
  song,
  onAutoplayFallbackMuted,
  // NEW defaults
  shouldAutoPlay = true,
  preloadMode = 'auto',
  // Membership props
  needsMembership = false,
  canAccess = true,
  requiredTierId,
  thumbnail,
}) => {
  const hlsRef = useRef<Hls | null>(null);
  const internalRef = useRef<HTMLVideoElement>(null);
  const effectiveRef = videoRef ?? internalRef;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewRecorded, setViewRecorded] = useState(false);
  const [showTapIcon, setShowTapIcon] = useState(false);
  const tapTimerRef = useRef<number | null>(null);

  const viewRecordedRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressUpdateRef = useRef<number>(0);
  const deviceInfoRef = useRef<DeviceInfo | null>(null);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(isMuted);
  const videoIdRef = useRef(videoId);

  // Check if membership is required
  const requiresMembership = needsMembership || !canAccess;
  const thumbnailMediaKey = getThumbnailMediaKey(thumbnail);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { mutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { videoIdRef.current = videoId; }, [videoId]);
  useEffect(() => { viewRecordedRef.current = viewRecorded; }, [viewRecorded]);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        deviceInfoRef.current = await getDeviceInfo();
      } catch (error) {
        console.error('Error fetching device info:', error);
      }
    };
    fetchDeviceInfo();
  }, []);

  const sendProgressUpdate = async (positionSec: number, durationSec: number, completed: boolean) => {
    const now = Date.now();
    if (!completed && now - lastProgressUpdateRef.current < 5000) {
      return;
    }
    lastProgressUpdateRef.current = now;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoIdRef.current}/progress`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            positionSec: Math.floor(positionSec),
            durationSec: Math.floor(durationSec),
            completed,
            device: deviceInfoRef.current || {
              deviceName: 'Unknown',
              browser: 'Unknown',
              operatingSystem: 'Unknown',
            }
          })
        }
      );
    } catch (error) {
      console.error('Error sending progress update:', error);
    }
  };

  useEffect(() => {
    const video = effectiveRef?.current;
    if (!video || !duration || duration === 0) return;

    progressIntervalRef.current = setInterval(() => {
      if (!video.paused && currentTime > 0) {
        const completed = currentTime >= duration * 0.8;
        sendProgressUpdate(currentTime, duration, completed);
      }
    }, 10000);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentTime, duration, effectiveRef]);

  useEffect(() => {
    const video = effectiveRef?.current;
    if (!video) return;

    const handlePause = () => {
      if (duration && currentTime > 0) {
        const completed = currentTime >= duration * 0.8;
        sendProgressUpdate(currentTime, duration, completed);
      }
    };

    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('pause', handlePause);
    };
  }, [currentTime, duration, effectiveRef]);

  useEffect(() => {
    return () => {
      if (duration && currentTime > 0) {
        const completed = currentTime >= duration * 0.8;
        const data = JSON.stringify({
          positionSec: Math.floor(currentTime),
          durationSec: Math.floor(duration),
          completed,
          device: deviceInfoRef.current || {
            deviceName: 'Unknown',
            browser: 'Unknown',
            operatingSystem: 'Unknown',
          }
        });
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoIdRef.current}/progress`,
          new Blob([data], { type: 'application/json' })
        );
      }
    };
  }, [currentTime, duration]);

  useEffect(() => {
    const video = effectiveRef?.current;
    if (!video || !videoSrc || requiresMembership) return;

    console.log('Setting up video with source:', videoSrc);
    
    setIsBuffering(true);
    setHasError(false);
    setErrorMessage('');
    setViewRecorded(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const handleWaiting = () => {
      if (shouldAutoPlay) setIsBuffering(true);
    };
    const handleCanPlay = () => setIsBuffering(false);
    const handlePlaying = () => setIsBuffering(false);
    const handleLoadStart = () => {
      if (shouldAutoPlay) setIsBuffering(true);
    };
    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setIsBuffering(false);
      setHasError(true);
      setErrorMessage('Failed to load video');
    };
    const handleTimeUpdate = () => {
      if (!video) return;
      setCurrentTime(video.currentTime);
      const VIEW_THRESHOLD = 5;
      if (!viewRecordedRef.current && video.currentTime >= VIEW_THRESHOLD) {
        viewRecordedRef.current = true;
        setViewRecorded(true);
        ViewTrackingService.recordView(videoIdRef.current, 'short').then(result => {
          if (result.viewRecorded) {
            console.log(`View recorded for short ${videoIdRef.current}. New count: ${result.newViewCount}`);
          }
        });
      }
    };
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleDurationChange = () => setDuration(video.duration);

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('durationchange', handleDurationChange);

    const setupAutoplayFlow = async () => {
      video.volume = volumeRef.current;

      // If preview mode, just load/buffer without playing.
      if (!shouldAutoPlay) {
        if (videoSrc.includes('.m3u8')) {
          if (Hls.isSupported()) {
            const hls = new Hls({ debug: false, enableWorker: true });
            hls.loadSource(videoSrc);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              // Ensure loading begins for buffer
              try { hls.startLoad(0); } catch(err) { console.error('HLS startLoad error:', err); }
              setIsBuffering(false);
            });
            hlsRef.current = hls;
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSrc;
            // Trigger preload
            video.load();
            setIsBuffering(false);
          } else {
            setHasError(true);
            setErrorMessage('Video format not supported');
            setIsBuffering(false);
          }
        } else {
          // MP4 or similar
          video.src = videoSrc;
          video.load(); // start preloading
          setIsBuffering(false);
        }
        return;
      }

      // Playing mode (current video)
      if (videoSrc.includes('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = new Hls({ debug: false, enableWorker: true });
          hls.loadSource(videoSrc);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            console.log('HLS manifest parsed, attempting to play (try unmuted first)');
            video.volume = volumeRef.current;
            try {
              video.muted = false;
              await video.play();
            } catch (err) {
              console.warn('Autoplay with sound blocked, falling back to muted:', err);
              try {
                video.muted = true;
                onAutoplayFallbackMuted?.();
                await video.play();
              } catch (err2) {
                console.error('HLS play failed after fallback:', err2);
                setHasError(true);
                setErrorMessage('Failed to play video');
                setIsBuffering(false);
              }
            }
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              setIsBuffering(false);
              setHasError(true);
              setErrorMessage('Video streaming error');
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  setErrorMessage('Network error - retrying...');
                  setTimeout(() => {
                    setHasError(false);
                    setIsBuffering(true);
                    hls.startLoad();
                  }, 2000);
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  setErrorMessage('Media error - retrying...');
                  setTimeout(() => {
                    setHasError(false);
                    setIsBuffering(true);
                    hls.recoverMediaError();
                  }, 2000);
                  break;
                default:
                  hls.destroy();
                  setErrorMessage('Fatal video error');
                  break;
              }
            }
          });

          hlsRef.current = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('Using native HLS support');
          video.src = videoSrc;
          video.volume = volumeRef.current;
          try {
            video.muted = false;
            await video.play();
          } catch (err) {
            console.warn('Autoplay with sound blocked (native HLS), falling back to muted:', err);
            try {
              video.muted = true;
              onAutoplayFallbackMuted?.();
              await video.play();
            } catch (err2) {
              console.error('Native HLS play failed after fallback:', err2);
              setHasError(true);
              setErrorMessage('Failed to play video');
              setIsBuffering(false);
            }
          }
        } else {
          console.error('HLS is not supported in this browser');
          setHasError(true);
          setErrorMessage('Video format not supported');
          setIsBuffering(false);
        }
      } else {
        console.log('Using regular video source');
        video.src = videoSrc;
        video.volume = volumeRef.current;
        try {
          video.muted = false;
          await video.play();
        } catch (err) {
          console.warn('Autoplay with sound blocked (MP4), falling back to muted:', err);
          try {
            video.muted = true;
            onAutoplayFallbackMuted?.();
            await video.play();
          } catch (err2) {
            console.error('Regular video play failed after fallback:', err2);
            setHasError(true);
            setErrorMessage('Failed to play video');
            setIsBuffering(false);
          }
        }
      }
    };

    void setupAutoplayFlow();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('durationchange', handleDurationChange);
    };
  }, [videoSrc, effectiveRef, shouldAutoPlay, requiresMembership]);

  useEffect(() => {
    const video = effectiveRef?.current;
    if (video && !requiresMembership) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted, effectiveRef, requiresMembership]);

  const handleSeek = (time: number) => {
    const video = effectiveRef?.current;
    if (video && !requiresMembership) {
      setIsBuffering(true);
      video.currentTime = time;
      if (duration > 0) {
        const completed = time >= duration * 0.8;
        void sendProgressUpdate(time, duration, completed);
      }
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <FaVolumeMute className="text-white text-xl" />;
    } else if (volume > 0 && volume < 0.66) {
      return <FaVolumeDown className="text-white text-xl" />;
    } else {
      return <FaVolumeUp className="text-white text-xl" />;
    }
  };

  const showSpinner = isBuffering && !hasError && shouldAutoPlay && !requiresMembership;

  const handleCenterTap = () => {
    if (requiresMembership) return; // Don't allow play/pause for locked content
    
    setShowTapIcon(true);
    if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);
    tapTimerRef.current = window.setTimeout(() => setShowTapIcon(false), 600);
    togglePlayPause();
  };

  return (
    <div
      className="relative rounded-md overflow-hidden bg-black"
      style={{
        height: '85vh',
        width: `calc(85vh * 9 / 16)`,
      }}
    >
      {requiresMembership ? (
        // Show blurred thumbnail with membership overlay
        <div className="relative w-full h-full">
          {thumbnailMediaKey && (
            <AuthenticatedImage
              mediaKey={thumbnailMediaKey}
              alt={caption}
              fill
              className="object-cover filter blur-sm"
              sizes="(max-width: 768px) 100vw, 500px"
              priority
              fallbackSrc="/placeholder.png"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
            <div className="text-center text-white px-6">
              <FiLock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">Members Only Content</h3>
              <p className="text-gray-300 mb-6 max-w-md">
                Join {channel.name} to watch this exclusive short.
                {requiredTierId && (
                  <span className="block mt-1 text-sm">
                    Requires: {requiredTierId}
                  </span>
                )}
              </p>
              {channel.handle && (
                <Link href={`/channels/${channel.handle}/membership`}>
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Join Membership
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={effectiveRef}
            muted={isMuted}
            loop
            playsInline
            autoPlay={shouldAutoPlay}
            preload={preloadMode}
            className="w-full h-full object-cover"
            onLoadedData={() => {
              console.log('Video loaded');
            }}
            onError={(e) => {
              console.error('Video error:', e);
            }}
            onCanPlay={() => {
              console.log('Video can play');
            }}
          />
          
          {/* Buffering overlay using shared component */}
          {showSpinner && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20">
              <BufferingSpinner size={48} />
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80">
              <div className="text-center text-white p-4">
                <div className="text-red-500 text-4xl mb-2">⚠</div>
                <p className="text-sm">{errorMessage}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-4 py-2 bg-white text-black rounded text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          {/* Central click region */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              onClick={handleCenterTap}
              className="w-1/2 h-1/2 cursor-pointer"
            />
          </div>

          {/* Tap indicator (briefly shows Play/Pause icon) */}
          {showTapIcon && (
            <div className="absolute inset-0 flex items-center justify-center z-40">
              {isPaused ? (
                <LuPlay className="text-white text-6xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
              ) : (
                <LuPause className="text-white text-6xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
              )}
            </div>
          )}
          
          <div className="absolute inset-0 flex flex-col justify-between z-20 pointer-events-none">
            {/* Top controls */}
            <div className="flex justify-start p-2 pointer-events-auto">
              {/* Volume control moved to top-left; expands to the right */}
              <div className="relative group">
                <div className="flex items-center bg-black/70 rounded-full overflow-hidden transition-all duration-300 w-12 group-hover:w-48">
                  <button
                    onClick={toggleMute}
                    className="p-2"
                    disabled={hasError}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {getVolumeIcon()}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={onVolumeChange}
                    className="w-32 h-2 hidden group-hover:block ml-1"
                    disabled={hasError}
                    aria-label="Volume"
                  />
                </div>
              </div>
            </div>
            
            {/* Bottom overlay with progress bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent pointer-events-auto">
              <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
                <ShortsProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={handleSeek}
                  className=""
                />
              </div>
              
              <div className="p-4 pb-6">
                <div className="text-white text-sm">
                  <p className="font-medium">{caption}</p>
                  <p className="text-xs text-gray-300 mt-1">{song}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
