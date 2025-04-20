// components/SettingsPopup.tsx
'use client';
import React from 'react';
import { VideoPlayerControls } from '../../hooks/useVideoPlayer';

export default function SettingsPopup({ controls }: { controls: VideoPlayerControls }) {
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
      <div>
        <span>Quality</span>
        <select className="ml-2 bg-gray-700 px-1 py-0.5 rounded text-xs">
          <option>1080p</option><option>720p</option><option>360p</option><option>144p</option><option>Auto</option>
        </select>
      </div>
    </div>
  );
}
