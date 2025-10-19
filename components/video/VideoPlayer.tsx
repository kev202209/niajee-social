'use client';
import React, { useEffect, useRef, useCallback, useState } from 'react';
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

interface ResumeData {
  videoId: string;
  hasWatchHistory: boolean;
  watchPositionSec: number;
  durationSec: number;
  completed: boolean;
  watchPercentage: number;
  timesWatched: number;
  lastWatchedAt: string;
}

interface ResumeResponse {
  success: boolean;
  data: ResumeData;
  message: string;
}

// Helper to pick the highest available quality
const getBestQualityUrl = (videoUrl: Record<string, string>) => {
  const preferredOrder = ['1080p', '720p', '480p', '360p', '240p'];
  for (const q of preferredOrder) {
    if (videoUrl[q]) return videoUrl[q];
  }
  const keys = Object.keys(videoUrl).filter(key => key !== 'master');
  return keys.length > 0 ? videoUrl[keys[0]] : null;
};

// Check if date is within the last 7 days
const isRecentlyWatched = (lastWatchedAt: string): boolean => {
  const lastWatched = new Date(lastWatchedAt);
  const now = new Date();
  const daysDiff = (now.getTime() - lastWatched.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7;
};

export default function VideoPlayer({ video }: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressUpdateRef = useRef<number>(0);
  const deviceInfoRef = useRef<DeviceInfo | null>(null);
  const hasAppliedResumeRef = useRef(false);
  const resumePositionRef = useRef<number | null>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);
  
  const [resumeDataLoaded, setResumeDataLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  // Use master playlist if available, otherwise use best quality
  const streamUrl = getFullUrl(
    video.masterPlaylist ||
    getBestQualityUrl(video.videoUrl) ||
    video.videoSrc
  );

  // Fetch resume position FIRST, before anything else
  useEffect(() => {
    const fetchResumePosition = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${video.id}/resume`,
          {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        if (!response.ok) {
          setResumeDataLoaded(true);
          setShouldLoadVideo(true);
          return;
        }

        const result: ResumeResponse = await response.json();
        
        if (
          result.data.hasWatchHistory &&
          !result.data.completed &&
          result.data.watchPositionSec >= 30 &&
          result.data.watchPositionSec < (result.data.durationSec - 30) &&
          isRecentlyWatched(result.data.lastWatchedAt)
        ) {
          resumePositionRef.current = result.data.watchPositionSec;
        }
      } catch (error) {
        console.error('Error fetching resume position:', error);
      } finally {
        setResumeDataLoaded(true);
        setShouldLoadVideo(true);
      }
    };

    fetchResumePosition();
  }, [video.id]);

  const controls = useVideoPlayer({
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    src: streamUrl,
    videoUrls: video.videoUrl,
    autoplay: false,
    videoId: video.id,
  }) as ReturnType<typeof useVideoPlayer> & { setHlsInstance?: (hls: Hls) => void };

  const { buffering, setBuffering, containerRef, duration } = controls;
  
  // Store setBuffering and setHlsInstance in refs to keep them stable
  const setBufferingRef = useRef(setBuffering);
  const setHlsInstanceRef = useRef(controls.setHlsInstance);
  
  useEffect(() => {
    setBufferingRef.current = setBuffering;
    setHlsInstanceRef.current = controls.setHlsInstance;
  }, [setBuffering, controls.setHlsInstance]);

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
  const sendProgressUpdate = useCallback(async (positionSec: number, durationSec: number, completed: boolean) => {
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
  }, [video.id]);

  // Apply resume position and start playback
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !resumeDataLoaded || hasAppliedResumeRef.current) return;

    const handleCanPlay = () => {
      // Apply resume position if available
      if (resumePositionRef.current !== null) {
        videoElement.currentTime = resumePositionRef.current;
      }
      
      hasAppliedResumeRef.current = true;
      
      // Start playback after position is set
      videoElement.play().catch(err => {
        console.error('Error starting playback:', err);
      });
      
      // Remove the listener after first use
      videoElement.removeEventListener('canplay', handleCanPlay);
    };

    videoElement.addEventListener('canplay', handleCanPlay);
    
    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
    };
  }, [resumeDataLoaded]);

  // Set up periodic progress tracking
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !duration || duration === 0) return;

    progressIntervalRef.current = setInterval(() => {
      if (!videoElement.paused && videoElement.currentTime > 0) {
        const completed = videoElement.currentTime >= duration * 0.9;
        sendProgressUpdate(videoElement.currentTime, duration, completed);
      }
    }, 10000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [duration, sendProgressUpdate]);

  // Send progress on pause
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !duration) return;

    const handlePause = () => {
      if (videoElement.currentTime > 0) {
        const completed = videoElement.currentTime >= duration * 0.9;
        sendProgressUpdate(videoElement.currentTime, duration, completed);
      }
    };

    videoElement.addEventListener('pause', handlePause);
    return () => {
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [duration, sendProgressUpdate]);

  // Send final progress on unmount
  useEffect(() => {
    const videoElement = videoRef.current;
    
    return () => {
      if (videoElement && duration && videoElement.currentTime > 0) {
        const completed = videoElement.currentTime >= duration * 0.9;
        const data = JSON.stringify({
          positionSec: Math.floor(videoElement.currentTime),
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
  }, [duration, video.id]);

  // Load video only AFTER resume data is fetched
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !streamUrl || !shouldLoadVideo) {
      return;
    }

    // Clean up previous HLS instance
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }

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

      if (setBufferingRef.current) setBufferingRef.current(true);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (setBufferingRef.current) setBufferingRef.current(false);
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
              videoElement.src = streamUrl;
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

      hlsInstanceRef.current = hls;
      if (setHlsInstanceRef.current) {
        setHlsInstanceRef.current(hls);
      }

      return () => {
        hls.destroy();
        hlsInstanceRef.current = null;
      };
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = streamUrl;
    } else {
      console.error('HLS not supported and no native support');
    }
    // CRITICAL FIX: Only depend on streamUrl and shouldLoadVideo - nothing else
  }, [streamUrl, shouldLoadVideo]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadStart = () => console.log('Video load start');
    const handleLoadedData = () => console.log('Video loaded data');
    const handleCanPlayEvent = () => console.log('Video can play');
    const handleError = (e: Event) => console.error('Video error:', e);
    const handleWaiting = () => {
      console.log('Video waiting');
      if (setBufferingRef.current) setBufferingRef.current(true);
    };
    const handlePlaying = () => {
      console.log('Video playing');
      if (setBufferingRef.current) setBufferingRef.current(false);
    };

    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('canplay', handleCanPlayEvent);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('playing', handlePlaying);

    return () => {
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('canplay', handleCanPlayEvent);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('playing', handlePlaying);
    };
  }, []);

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
        {(buffering || !shouldLoadVideo) && (
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