// components/ControlBar.tsx
'use client';
import React, { useState } from 'react';
import {
  FiRewind, FiPlay, FiPause, FiVolume2, FiVolumeX, FiToggleRight,
  FiSettings, FiMonitor, FiMaximize, FiMinimize, FiFastForward,
} from 'react-icons/fi';
// import { FaStepForward,FaStepBackward  } from "react-icons/fa";
import { PictureInPicture2,  Captions } from 'lucide-react';
import { VideoPlayerControls } from '../../hooks/useVideoPlayer';
import SettingsPopup from './SettingsPopup';
import ProgressBar from './ProgressBar';

export default function ControlBar({ controls, videoId }: { controls: VideoPlayerControls, videoId: string }) {
  const [showVolSlider, setShowVolSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div
      className={`
        absolute bottom-0 left-0 right-0
        px-2 py-2
        flex flex-col
        text-white
        bg-black/60
        transition-opacity duration-300
        ${controls.controlsVisible ? 'opacity-100' : 'opacity-0'}
        ${controls.mouseIdle ? 'pointer-events-none' : 'pointer-events-auto'}
        z-30
      `}
      style={{ fontSize: '1.1rem' }}
    >
      {/* ProgressBar at the top */}
      <ProgressBar controls={controls} />

      {/* Controls row */}
      <div className="flex flex-wrap items-center w-full mt-2">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <button onClick={controls.handleRewind} title="Rewind" className="hover:text-gray-300"><FiRewind /></button>
          <button onClick={controls.togglePlay} title={controls.isPlaying ? 'Pause' : 'Play'} className="hover:text-gray-300">
            {controls.isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          <button onClick={controls.handleForward} title="Forward" className="hover:text-gray-300"><FiFastForward /></button>
        </div>
        <div
          className="flex items-center space-x-2 ml-4 relative mb-2 sm:mb-0"
          onMouseEnter={() => setShowVolSlider(true)}
          onMouseLeave={() => setShowVolSlider(false)}
        >
          <button onClick={controls.toggleMute} title="Volume" className="hover:text-gray-300">
            {controls.isMuted ? <FiVolumeX /> : <FiVolume2 />}
          </button>
          {showVolSlider && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={controls.volume}
              onChange={e => controls.setVolume(parseFloat(e.currentTarget.value))}
              className="ml-2 w-20"
            />
          )}
          <span className="text-xs sm:text-sm">
            {Math.floor(controls.currentTime / 60)}:{String(Math.floor(controls.currentTime % 60)).padStart(2, '0')}
            /
            {Math.floor(controls.duration / 60)}:{String(Math.floor(controls.duration % 60)).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center space-x-2 ml-auto flex-wrap">
          {/* <button onClick={controls.toggleAutoplay} title="Autoplay" className="hover:text-gray-300">
            <FiToggleRight className={controls.isAutoplay ? 'text-blue-400' : ''} />
          </button> */}
          {/* <button title="Subtitles" className="hover:text-gray-300">< Captions /></button> */}
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
          {/* <button onClick={controls.toggleMiniplayer} title="Miniplayer" className="hover:text-gray-300"><PictureInPicture2 /></button> */}
          {/* <button onClick={controls.toggleCinemaMode} title="Cinema Mode" className="hover:text-gray-300"><FiMonitor /></button> */}
          <button onClick={controls.toggleFullscreen} title={controls.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} className="hover:text-gray-300">
            {controls.isFullscreen ? <FiMinimize /> : <FiMaximize />}
          </button>
        </div>
      </div>
    </div>
  );
}