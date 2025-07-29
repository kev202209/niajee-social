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
import { getFullUrl } from '@/app/utils/videourl';

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


export default function VideoPlayer({ video }: { video: mVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Use buffering from controls
  const { buffering, setBuffering } = controls;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !streamUrl) {
      console.error('Missing video element or stream URL');
      return;
    }

    // Clear any existing src to prevent conflicts
    videoElement.src = '';
    videoElement.removeAttribute('src');

    // Destroy existing HLS instance
    if (controls.hlsInstance) {
      controls.hlsInstance.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false, // Enable debug for troubleshooting
        enableWorker: true,
        capLevelToPlayerSize: true,
        maxLoadingDelay: 4,
        maxBufferLength: 30,
        maxBufferSize: 60 * 1000 * 1000,
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setBuffering && setBuffering(false);
      });

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', event, data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              // Fallback to direct video source
              videoElement.src = streamUrl;
              break;
          }
        }
      });

      // Set buffering state
      setBuffering && setBuffering(true);

      try {
        hls.loadSource(streamUrl);
        hls.attachMedia(videoElement);
      } catch (error) {
        console.error('Error loading HLS source:', error);
        // Fallback to direct video source
        videoElement.src = streamUrl;
      }

      controls.setHlsInstance?.(hls);

      return () => {
        hls.destroy();
      };
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari/iOS native HLS support
      videoElement.src = streamUrl;
    } else {
      console.error('HLS not supported and no native support');
    }
  }, [streamUrl, setBuffering]);

  // Add event listeners to video element for debugging
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadStart = () => console.log('Video load start');
    const handleLoadedData = () => console.log('Video loaded data');
    const handleCanPlay = () => console.log('Video can play');
    const handleError = (e: Event) => console.error('Video error:', e);
    const handleWaiting = () => {
      console.log('Video waiting');
      setBuffering && setBuffering(true);
    };
    const handlePlaying = () => {
      console.log('Video playing');
      setBuffering && setBuffering(false);
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
      <div className="relative" ref={controls.containerRef}>
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