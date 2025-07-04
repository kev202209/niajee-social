import { FC, useEffect, useRef, useState } from 'react';
import { FaVolumeMute, FaVolumeDown, FaVolumeUp, FaPause, FaPlay } from 'react-icons/fa';
import Hls from 'hls.js';
import ShortsProgressBar from './ShortsProgressBar';

interface Channel {
  name: string;
  icon: string | null;
}

interface VideoPlayerProps {
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
}

const VideoPlayer: FC<VideoPlayerProps> = ({
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
}) => {
  const hlsRef = useRef<Hls | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef?.current;
    if (!video || !videoSrc) return;

    console.log('Setting up video with source:', videoSrc);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

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
          video.volume = volume;
          video.muted = isMuted;
          video.play().catch(err => console.error('HLS play failed:', err));
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Trying to recover from network error');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Trying to recover from media error');
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        console.log('Using native HLS support');
        video.src = videoSrc;
        video.volume = volume;
        video.muted = isMuted;
        video.play().catch(err => console.error('Native HLS play failed:', err));
      } else {
        console.error('HLS is not supported in this browser');
      }
    } else {
      // Regular MP4 or other formats
      console.log('Using regular video source');
      video.src = videoSrc;
      video.volume = volume;
      video.muted = isMuted;
      video.play().catch(err => console.error('Regular video play failed:', err));
    }

    // Add event listeners for progress tracking
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('durationchange', handleDurationChange);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('durationchange', handleDurationChange);
    };
  }, [videoSrc, videoRef]);

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
        height: '80vh',
        width: `calc(80vh * 9 / 16)`,
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
          >
            {isPaused ? (
              <FaPlay className="text-white text-xl" />
            ) : (
              <FaPause className="text-white text-xl" />
            )}
          </button>
          
          <div className="relative group">
            <div className="flex items-center bg-black bg-opacity-70 rounded-full overflow-hidden transition-all duration-300 w-12 group-hover:w-48">
              <button onClick={toggleMute} className="p-2">
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
