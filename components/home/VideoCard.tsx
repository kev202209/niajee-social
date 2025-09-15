import { FC, useEffect, useRef, useState, useCallback } from "react";
import { Video } from "../../types";
import { FiVolume, FiVolumeX, FiMoreHorizontal, FiPlusCircle, FiFlag, FiXCircle, FiMessageCircle, FiUser } from "react-icons/fi";
import Link from "next/link";
import timeAgo from "../../app/utils/timeAgo";
import Hls from 'hls.js';
import AuthenticatedImage from "@/components/Image";
import { getFullUrl } from "@/app/utils/videourl";
import { getImageSrc } from '@/app/utils/imageUtils';

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
}

const VideoCard: FC<{ video: Video }> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.5);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoReady, setVideoReady] = useState<boolean>(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  useOutsideClick(optionsRef, () => setShowOptions(false));

  // Helper to get video source URL from key (memoized so effects can depend on it)
  const getVideoSource = useCallback(() => {
    const qualities = ['1080p', '720p', '360p'];
    for (const quality of qualities) {
      if ((video.videoUrl as Record<string, string | undefined>)[quality]) {
        return getFullUrl((video.videoUrl as Record<string, string>)[quality]);
      }
    }
    const first = Object.values(video.videoUrl)[0] || '';
    return getFullUrl(String(first));
  }, [video.videoUrl]);
 
  // Setup HLS and video source
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const videoSrc = getVideoSource();
    if (!videoSrc) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if it's an HLS stream
    if (videoSrc.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          autoStartLoad: false, // Don't auto-load to save bandwidth
        });

        hls.loadSource(videoSrc);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setVideoReady(true);
          videoElement.volume = volume;
          videoElement.muted = true; // Always start muted for autoplay
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS Error:', data);
            hls.destroy();
          }
        });

        hlsRef.current = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        videoElement.src = videoSrc;
        videoElement.volume = volume;
        videoElement.muted = true;
        setVideoReady(true);
      }
    } else {
      // Regular MP4 or other formats
      videoElement.src = videoSrc;
      videoElement.volume = volume;
      videoElement.muted = true;
      setVideoReady(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [getVideoSource, volume]);

  const handleMouseEnter = async () => {
    if (!videoReady || !videoRef.current) return;
    
    try {
      // Start loading HLS if not already loaded
      if (hlsRef.current && !hlsRef.current.loadLevel) {
        hlsRef.current.startLoad();
      }
      
      await videoRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing video:', error);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (videoRef.current) {
        videoRef.current.muted = newMuted;
      }
      return newMuted;
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
      if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
        videoRef.current.muted = true;
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <Link href={`/watch/${video.videoId}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer relative">
        {/* Video Thumbnail Container with 16:9 Aspect Ratio */}
        <div
          className="relative group rounded-t-lg overflow-hidden aspect-video"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Thumbnail */}
          <AuthenticatedImage
            mediaKey={getImageSrc(video.thumbnail, '480w')}
            alt={video.title}
            fill
            className="absolute inset-0 object-cover w-full h-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            fallbackSrc="/placeholder-video.jpg"
          />
          {/* Video Preview */}
          <video
            ref={videoRef}
            poster="" // Remove poster, since thumbnail is handled above
            src={getVideoSource()}
            muted={isMuted}
            loop
            playsInline
            className="absolute inset-0 object-cover w-full h-full opacity-0 group-hover:opacity-100 transition-opacity"
          />
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
          
          {/* Volume Controls */}
          <button
            onClick={toggleMute}
            className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            {isMuted ? <FiVolumeX /> : <FiVolume />}
          </button>
          
          <div className="absolute bottom-12 left-2 opacity-0 group-hover:opacity-100 transition">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        
        {/* Details Section */}
        <div className="p-3 relative overflow-visible">
          <div className="flex gap-3">
            {/* Channel Avatar */}
            <Link href={`/channels/${video.channel.handle}`}>
              {video.channel.avatar ? (
                <AuthenticatedImage
                  mediaKey={getImageSrc(video.channel.avatar, '480w')}
                  alt={video.channel.name}
                  width={36}
                  height={36}
                  className="rounded-full w-9 h-9 object-cover"
                  fallbackSrc="/placeholder.png"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </Link>
            
            {/* Video Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2 mb-1">
                {video.title}
              </h3>
              
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                  {video.channel.name}
                </p>
                {video.channel.verified && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatViews(video.views)} views • {timeAgo(video.createdAt)}
              </p>
            </div>
            
            {/* Options Menu */}
            <div className="relative flex-shrink-0" ref={optionsRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <FiMoreHorizontal className="text-gray-600 dark:text-gray-400 w-4 h-4" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <button 
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <FiPlusCircle className="mr-3 w-4 h-4" />
                    Add to Queue
                  </button>
                  <button 
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <FiFlag className="mr-3 w-4 h-4" />
                    Report
                  </button>
                  <button 
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <FiXCircle className="mr-3 w-4 h-4" />
                    Not Interested
                  </button>
                  <button 
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <FiMessageCircle className="mr-3 w-4 h-4" />
                    Send Feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;