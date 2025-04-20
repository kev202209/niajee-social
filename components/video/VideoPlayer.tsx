// components/VideoPlayer.tsx
'use client';
import React from 'react';
import { mVideo as Video } from '../../types';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import VideoContainer from './VideoContainer';
import PlayPauseOverlay from './PlayPauseOverlay';
import VolumeSeekIndicator from './VolumeSeekIndicator';
import ProgressBar from './ProgressBar';
import ControlBar from './ControlBar';
import VideoMeta from './VideoMeta';

export default function VideoPlayer({ video }: { video: Video }) {
  const controls = useVideoPlayer({ src: video.videoSrc });
  return (
    <div className="space-y-4">
      <div className="relative">
        <VideoContainer controls={controls} src={video.videoSrc} />
        <PlayPauseOverlay controls={controls} />
        <VolumeSeekIndicator controls={controls} />
        <ProgressBar controls={controls} />
        <ControlBar controls={controls} />
      </div>
      <VideoMeta video={video} />
    </div>
  );
}