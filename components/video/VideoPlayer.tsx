// components/VideoPlayer.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { mVideo } from '../../types';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import VideoContainer from './VideoContainer';
import PlayPauseOverlay from './PlayPauseOverlay';
import VolumeSeekIndicator from './VolumeSeekIndicator';
import ProgressBar from './ProgressBar';
import ControlBar from './ControlBar';
import VideoMeta from './VideoMeta';
import Hls from 'hls.js';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface VideoProps {
  video: mVideo;
}

export default function VideoPlayer({ video }: { video: mVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  
  // Pass videoRef to useVideoPlayer hook
  const controls = useVideoPlayer({
    videoRef, // Pass the ref directly
    src: `${backendUrl}/${video.videoUrl['720p']}`,
    videoUrls: video.videoUrl,
    autoplay: true
  });

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Destroy existing HLS instance
    if (hlsInstance) {
      hlsInstance.destroy();
    }

    const hlsPath = video.videoUrl['720p'];
    const streamUrl = `${backendUrl}/${hlsPath}`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: true,
        enableWorker: true,
        xhrSetup: (xhr, url) => {
          if (url.endsWith('.mpegts')) {
            xhr.responseType = 'arraybuffer';
          }
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
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
              break;
          }
        }
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(videoElement);
      setHlsInstance(hls);

      return () => {
        hls.destroy();
      };
    } 
    else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = streamUrl;
    }
  }, [video.videoUrl]);

  return (
    <div className="space-y-4">
      <div className="relative" ref={controls.containerRef}>
        <VideoContainer 
          controls={controls} 
          videoRef={videoRef}
          className="w-full h-full rounded"
        />
        <PlayPauseOverlay controls={controls} />
        <VolumeSeekIndicator controls={controls} />
        <ProgressBar controls={controls} />
        <ControlBar controls={controls} />
      </div>
      <VideoMeta video={video} />
    </div>
  );
}