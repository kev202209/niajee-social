// components/ControlBar.tsx
'use client';
import React, { useState } from 'react';
import { FiRewind, FiPlay, FiPause, FiFastForward, FiVolume2, FiVolumeX, FiToggleRight, FiMessageSquare, FiSettings, FiAirplay, FiMonitor, FiMaximize, FiMinimize } from 'react-icons/fi';
import { VideoPlayerControls } from '../../hooks/useVideoPlayer';
import SettingsPopup from './SettingsPopup';

export default function ControlBar({ controls, videoId }: { controls: VideoPlayerControls, videoId: string }) {
  const [showVolSlider, setShowVolSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={`absolute bottom-0 left-0 right-0 p-2 flex items-center text-white bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${controls.controlsVisible ? 'opacity-100' : 'opacity-0'} ${controls.mouseIdle ? 'pointer-events-none' : 'pointer-events-auto'}`}>
      <div className="flex items-center space-x-2">
        <button onClick={controls.handleRewind} title="Rewind" className="hover:text-gray-300"><FiRewind /></button>
        <button onClick={controls.togglePlay} title={controls.isPlaying ? 'Pause' : 'Play'} className="hover:text-gray-300">{controls.isPlaying ? <FiPause /> : <FiPlay />}</button>
        <button onClick={controls.handleForward} title="Forward" className="hover:text-gray-300"><FiFastForward /></button>
      </div>
      <div className="flex items-center space-x-2 ml-4 relative" onMouseEnter={() => setShowVolSlider(true)} onMouseLeave={() => setShowVolSlider(false)}>
        <button onClick={controls.toggleMute} title="Volume" className="hover:text-gray-300">{controls.isMuted ? <FiVolumeX /> : <FiVolume2 />}</button>
        {showVolSlider && <input type="range" min="0" max="1" step="0.01" value={controls.volume} onChange={e => controls.setVolume(parseFloat(e.currentTarget.value))} className="ml-2" />}
        <span className="text-sm">{Math.floor(controls.currentTime/60)}:{String(Math.floor(controls.currentTime%60)).padStart(2,'0')}/{Math.floor(controls.duration/60)}:{String(Math.floor(controls.duration%60)).padStart(2,'0')}</span>
      </div>
      <div className="flex items-center space-x-2 ml-auto">
        <button onClick={controls.toggleAutoplay} title="Autoplay" className="hover:text-gray-300"><FiToggleRight className={controls.isAutoplay?'text-blue-400':''} /></button>
        <button title="Subtitles" className="hover:text-gray-300"><FiMessageSquare /></button>
        <div className="relative">
          <button onClick={() => setShowSettings(prev => !prev)} title="Settings" className="hover:text-gray-300"><FiSettings /></button>
          {showSettings && (
            <SettingsPopup
              controls={controls}
              videoId={videoId}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
        <button onClick={controls.toggleMiniplayer} title="Miniplayer" className="hover:text-gray-300"><FiAirplay /></button>
        <button onClick={controls.toggleCinemaMode} title="Cinema Mode" className="hover:text-gray-300"><FiMonitor /></button>
        <button onClick={controls.toggleFullscreen} title={controls.isFullscreen?'Exit Fullscreen':'Fullscreen'} className="hover:text-gray-300">{controls.isFullscreen? <FiMinimize /> : <FiMaximize />}</button>
      </div>
    </div>
  );
}