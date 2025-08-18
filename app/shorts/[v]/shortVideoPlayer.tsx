import { FC, useEffect, useRef, useState } from 'react';
import { FaVolumeMute, FaVolumeDown, FaVolumeUp, FaPause, FaPlay } from 'react-icons/fa';
import Hls from 'hls.js';
import ShortsProgressBar from './ShortsProgressBar';
import ViewTrackingService from '@/app/utils/ViewTrackingService';

interface Channel {
  name: string;
  icon: string | null;
}

interface VideoPlayerProps {
  videoId: string; // Add videoId to props
  videoRef: React.RefObject<HTMLVideoElement> | null;
  videoSrc: string;
  isMuted: boolean;
  isPaused: boolean;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMute: () => void;
  togglePlayPause: () => void;
  channel: Channel; // currently unused (reserved for future channel overlay)
  caption: string;
  song: string;
}

// Add BufferingSpinner component
const BufferingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>
);

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
  caption,
  song,
}) => {
  const hlsRef = useRef<Hls | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // Add buffering state
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewRecorded, setViewRecorded] = useState(false); // UI state
  const viewRecordedRef = useRef(false); // ref to avoid stale closure in handler
  const volumeRef = useRef(volume);
  const mutedRef = useRef(isMuted);
  const videoIdRef = useRef(videoId);

  // keep refs in sync (no effect dependency changes to main setup)
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { mutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { videoIdRef.current = videoId; }, [videoId]);
  useEffect(() => { viewRecordedRef.current = viewRecorded; }, [viewRecorded]);

  useEffect(() => {
    const video = videoRef?.current;
    if (!video || !videoSrc) return;

    console.log('Setting up video with source:', videoSrc);
    
    // Reset states
    setIsBuffering(true);
    setHasError(false);
    setErrorMessage('');
    setViewRecorded(false); // Reset view tracking for new video

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Add video event listeners for buffering
    const handleWaiting = () => {
      console.log('Video waiting - buffering');
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      console.log('Video can play - buffering ended');
      setIsBuffering(false);
    };

    const handlePlaying = () => {
      console.log('Video playing - buffering ended');
      setIsBuffering(false);
    };

    const handleLoadStart = () => {
      console.log('Video load started');
      setIsBuffering(true);
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

      // --- View Tracking Logic ---
      const VIEW_THRESHOLD = 5; // 5 seconds for a short
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

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    // Add all event listeners
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('durationchange', handleDurationChange);

    // Check if it's an HLS stream
    if (videoSrc.includes('.m3u8')) {
      if (Hls.isSupported()) {
        console.log('Setting up HLS for:', videoSrc);
        const hls = new Hls({
          debug: false,
          enableWorker: true,
        });

        hls.loadSource(videoSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed, attempting to play');
          video.volume = volumeRef.current;
          video.muted = mutedRef.current;
          video.play().catch(err => {
            console.error('HLS play failed:', err);
            setHasError(true);
            setErrorMessage('Failed to play video');
            setIsBuffering(false);
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            setIsBuffering(false);
            setHasError(true);
            setErrorMessage('Video streaming error');
            
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Trying to recover from network error');
                setErrorMessage('Network error - retrying...');
                setTimeout(() => {
                  setHasError(false);
                  setIsBuffering(true);
                  hls.startLoad();
                }, 2000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Trying to recover from media error');
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
        // Safari native HLS support
        console.log('Using native HLS support');
        video.src = videoSrc;
        video.volume = volumeRef.current;
        video.muted = mutedRef.current;
        video.play().catch(err => {
          console.error('Native HLS play failed:', err);
          setHasError(true);
          setErrorMessage('Failed to play video');
          setIsBuffering(false);
        });
      } else {
        console.error('HLS is not supported in this browser');
        setHasError(true);
        setErrorMessage('Video format not supported');
        setIsBuffering(false);
      }
    } else {
      // Regular MP4 or other formats
      console.log('Using regular video source');
      video.src = videoSrc;
      video.volume = volumeRef.current;
      video.muted = mutedRef.current;
      video.play().catch(err => {
        console.error('Regular video play failed:', err);
        setHasError(true);
        setErrorMessage('Failed to play video');
        setIsBuffering(false);
      });
    }

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
  }, [videoSrc, videoRef]); // refs provide latest values; no need to add others

  // Update volume and mute state
  useEffect(() => {
    const video = videoRef?.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted, videoRef]);

  // Handle seek functionality
  const handleSeek = (time: number) => {
    const video = videoRef?.current;
    if (video) {
      setIsBuffering(true);
      video.currentTime = time;
    }
  };

  // Determine which volume icon to display based on volume level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <FaVolumeMute className="text-white text-xl" />;
    } else if (volume > 0 && volume < 0.33) {
      return <FaVolumeDown className="text-white text-xl" />;
    } else if (volume >= 0.33 && volume < 0.66) {
      return <FaVolumeDown className="text-white text-xl" />;
    } else {
      return <FaVolumeUp className="text-white text-xl" />;
    }
  };

  return (
    <div
      className="relative rounded-md overflow-hidden bg-black"
      style={{
        height: '85vh',
        width: `calc(85vh * 9 / 16)`,
      }}
    >
      <video
        ref={videoRef || undefined}
        muted={isMuted}
        loop
        playsInline
        autoPlay
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
      
      {/* Buffering Spinner */}
      {isBuffering && !hasError && <BufferingSpinner />}
      
      {/* Error State */}
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
          onClick={togglePlayPause}
          className="w-1/2 h-1/2 cursor-pointer"
        ></div>
      </div>
      
      <div className="absolute inset-0 flex flex-col justify-between z-20 pointer-events-none">
        {/* Top controls */}
        <div className="flex justify-between p-2 pointer-events-auto">
          <button
            onClick={togglePlayPause}
            className="bg-black bg-opacity-70 p-2 rounded-full transition-transform duration-300"
            disabled={isBuffering || hasError}
          >
            {isPaused ? (
              <FaPlay className="text-white text-xl" />
            ) : (
              <FaPause className="text-white text-xl" />
            )}
          </button>
          
          <div className="relative group">
            <div className="flex items-center bg-black bg-opacity-70 rounded-full overflow-hidden transition-all duration-300 w-12 group-hover:w-48">
              <button onClick={toggleMute} className="p-2" disabled={hasError}>
                {getVolumeIcon()}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={onVolumeChange}
                className="w-32 hidden group-hover:block"
                disabled={hasError}
              />
            </div>
          </div>
        </div>
        
        {/* Bottom overlay with progress bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent pointer-events-auto">
          {/* Progress bar at the very bottom - full width */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
            <ShortsProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              className=""
            />
          </div>
          
          {/* Content overlay - simplified without channel info */}
          <div className="p-4 pb-6">
            <div className="text-white text-sm">
              <p className="font-medium">{caption}</p>
              <p className="text-xs text-gray-300 mt-1">{song}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
