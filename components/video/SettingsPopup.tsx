// components/SettingsPopup.tsx
'use client';
import React from 'react';
import { VideoPlayerControls } from '../../hooks/useVideoPlayer';
import Hls from 'hls.js';

export default function SettingsPopup({ controls, videoId }: { 
  controls: VideoPlayerControls;
  videoId: string;
}) {
  const qualities = ['auto', '1080p', '720p', '480p', '360p'] as const;
  
  const handleQualityChange = (quality: string) => {
    if (!controls.videoRef.current) return;
    
    const streamUrl = `${process.env.NEXT_PUBLIC_API_URL}/stream/${videoId}/${quality}/playlist.m3u8`;
    
    if (Hls.isSupported()) {
      const hls = new Hls();
      const currentTime = controls.videoRef.current.currentTime;
      hls.loadSource(streamUrl);
      hls.attachMedia(controls.videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (controls.videoRef.current) {
          controls.videoRef.current.currentTime = currentTime;
          if (controls.isPlaying) controls.videoRef.current.play();
        }
      });
    }
  };

  return (
    <div className="absolute bottom-10 right-0 bg-gray-800 p-4 rounded shadow-lg text-sm w-56">
      <div className="flex items-center justify-between mb-2">
        <span>Ambient Mode</span>
        <button onClick={controls.toggleAmbientMode} className="ml-2 bg-gray-700 px-2 py-1 rounded text-xs">{controls.ambientMode?'On':'Off'}</button>
      </div>
      <div className="mb-2">
        <span>Subtitles</span>
        <select className="ml-2 bg-gray-700 px-1 py-0.5 rounded text-xs">
          <option>English</option><option>Spanish</option><option>French</option>
        </select>
      </div>
      <div className="mb-2">
        <span>Sleep Timer</span>
        <select onChange={controls.handleSleepTimerChange} className="ml-2 bg-gray-700 px-1 py-0.5 rounded text-xs">
          <option value="0">Off</option><option value="10">10 sec</option><option value="20">20 sec</option><option value="30">30 sec</option><option value="40">40 sec</option><option value="50">50 sec</option><option value="1 hour">1 hour</option>
        </select>
      </div>
      <div className="mb-2">
        <span>Playback Speed</span>
        <select onChange={controls.handlePlaybackSpeedChange} defaultValue="1" className="ml-2 bg-gray-700 px-1 py-0.5 rounded text-xs">
          <option value="0.25">0.25</option><option value="0.5">0.5</option><option value="0.75">0.75</option><option value="1">Normal</option><option value="1.5">1.5</option><option value="2">2</option>
        </select>
      </div>
      <div className="mb-2">
        <span>Quality</span>
        <select 
          onChange={(e) => handleQualityChange(e.target.value)}
          className="ml-2 bg-gray-700 px-1 py-0.5 rounded text-xs"
          value={controls.videoQuality}
        >
          {qualities.map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
