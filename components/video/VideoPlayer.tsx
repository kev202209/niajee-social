// components/VideoPlayer.tsx
'use client';
import React, { useEffect, useRef } from 'react';
import { mVideo } from '../../types';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import VideoContainer from './VideoContainer';
import PlayPauseOverlay from './PlayPauseOverlay';
import VolumeSeekIndicator from './VolumeSeekIndicator';
import ControlBar from './ControlBar';
import VideoMeta from './VideoMeta';
import Hls from 'hls.js';
import BufferingSpinner from './BufferingSpinner';
import { getFullUrl } from '@/utils/videourl';
import { getDeviceInfo, DeviceInfo } from '@/utils/deviceInfo';

interface VideoProps {
  video: mVideo;
}

// Helper to pick the highest available quality
const getBestQualityUrl = (videoUrl: Record<string, string>) => {
  const preferredOrder = ['1080p', '720p', '480p', '360p', '240p'];
  for (const q of preferredOrder) {
    if (videoUrl[q]) return videoUrl[q];
  }
  // fallback to any available
  const keys = Object.keys(videoUrl).filter(key => key !== 'master');
  return keys.length > 0 ? videoUrl[keys[0]] : null;
};

export default function VideoPlayer({ video }: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressUpdateRef = useRef<number>(0);
  const deviceInfoRef = useRef<DeviceInfo | null>(null);

  // Use master playlist if available, otherwise use best quality
  const streamUrl = getFullUrl(
    video.masterPlaylist ||
    getBestQualityUrl(video.videoUrl) ||
    video.videoSrc
  );

  // Use the controls object from the hook
  const controls = useVideoPlayer({
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    src: streamUrl,
    videoUrls: video.videoUrl,
    autoplay: true,
    videoId: video.id,
  }) as ReturnType<typeof useVideoPlayer> & { setHlsInstance?: (hls: Hls) => void };

  // Destructure the specific values we need
  const { buffering, setBuffering, hlsInstance, setHlsInstance, containerRef, currentTime, duration } = controls;

  // Get device info on mount
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

  // Function to send progress update to backend
  const sendProgressUpdate = async (positionSec: number, durationSec: number, completed: boolean) => {
    // Don't send duplicate updates within 5 seconds
    const now = Date.now();
    if (!completed && now - lastProgressUpdateRef.current < 5000) {
      return;
    }
    
    lastProgressUpdateRef.current = now;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${video.id}/progress`,
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

  // Set up periodic progress tracking
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !duration || duration === 0) return;

    // Send progress every 10 seconds
    progressIntervalRef.current = setInterval(() => {
      if (!videoElement.paused && currentTime > 0) {
        const completed = currentTime >= duration * 0.9; // Consider 90% watched as completed
        sendProgressUpdate(currentTime, duration, completed);
      }
    }, 10000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentTime, duration, video.id]);

  // Send progress on pause
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePause = () => {
      if (duration && currentTime > 0) {
        const completed = currentTime >= duration * 0.9;
        sendProgressUpdate(currentTime, duration, completed);
      }
    };

    videoElement.addEventListener('pause', handlePause);
    return () => {
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [currentTime, duration, video.id]);

  // Send final progress on unmount or before navigation
  useEffect(() => {
    return () => {
      if (duration && currentTime > 0) {
        const completed = currentTime >= duration * 0.9;
        // Use sendBeacon for more reliable tracking on page unload
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${video.id}/progress`,
          new Blob([data], { type: 'application/json' })
        );
      }
    };
  }, [currentTime, duration, video.id]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !streamUrl) {
      console.error('Missing video element or stream URL');
      return;
    }

    // Clean up previous HLS instance once per streamUrl change
    if (hlsInstance) {
      hlsInstance.destroy();
    }

    // Avoid gratuitously clearing src unless switching transport
    videoElement.removeAttribute('src');

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        capLevelToPlayerSize: true,
        maxLoadingDelay: 4,
        maxBufferLength: 30,
        maxBufferSize: 60 * 1000 * 1000,
        xhrSetup: xhr => { xhr.withCredentials = true; }
      });

      if (setBuffering) setBuffering(true);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (setBuffering) setBuffering(false);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('HLS Error:', _event, data);
        if (data?.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              videoElement.src = streamUrl; // fallback
          }
        }
      });

      try {
        hls.loadSource(streamUrl);
        hls.attachMedia(videoElement);
      } catch (err) {
        console.error('Error loading HLS source:', err);
        videoElement.src = streamUrl;
      }

      setHlsInstance?.(hls);

      return () => {
        hls.destroy();
      };
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = streamUrl;
    } else {
      console.error('HLS not supported and no native support');
    }
  }, [streamUrl]);

  // Add event listeners to video element
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadStart = () => console.log('Video load start');
    const handleLoadedData = () => console.log('Video loaded data');
    const handleCanPlay = () => console.log('Video can play');
    const handleError = (e: Event) => console.error('Video error:', e);
    const handleWaiting = () => {
      console.log('Video waiting');
      if (setBuffering) setBuffering(true);
    };
    const handlePlaying = () => {
      console.log('Video playing');
      if (setBuffering) setBuffering(false);
    };

    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('playing', handlePlaying);

    return () => {
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('playing', handlePlaying);
    };
  }, [setBuffering]);

  if (!streamUrl) {
    return (
      <div className="bg-gray-800 aspect-video flex items-center justify-center">
        <p className="text-white">No video source available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative" ref={containerRef}>
        {/* Buffering Spinner */}
        {buffering && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
            <BufferingSpinner />
          </div>
        )}
        <VideoContainer 
          controls={controls} 
          videoRef={videoRef as React.RefObject<HTMLVideoElement>}
          className="w-full h-full rounded"
        />
        <PlayPauseOverlay controls={controls} />
        <VolumeSeekIndicator controls={controls} />
        <ControlBar controls={controls} videoId={video.id} />
      </div>
      <VideoMeta video={video} />
    </div>
  );
}