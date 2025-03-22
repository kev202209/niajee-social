"use client";
import { useState, useRef, useEffect } from "react";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiShare,
  FiDownload,
  FiSave,
  FiMoreVertical,
  FiPlay,
  FiPause,
  FiRewind,
  FiFastForward,
  FiVolume2,
  FiVolumeX,
  FiToggleRight,
  FiMessageSquare,
  FiSettings,
  FiMinimize,
  FiMonitor,
  FiMaximize,
} from "react-icons/fi";
import { mVideo as Video } from "../../../types";

export default function VideoPlayer({ video }: { video: Video }) {
  // Basic states
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playPauseAnim, setPlayPauseAnim] = useState<"play" | "pause" | null>(null);

  // Custom control states
  const [ambientMode, setAmbientMode] = useState(true);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMiniplayer, setIsMiniplayer] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs for video and container elements and sleep timer
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update volume on video element when volume or mute state changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Update current time and duration from video element
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const updateTime = () => setCurrentTime(videoEl.currentTime);
    const setMeta = () => setDuration(videoEl.duration);
    videoEl.addEventListener("timeupdate", updateTime);
    videoEl.addEventListener("loadedmetadata", setMeta);
    return () => {
      videoEl.removeEventListener("timeupdate", updateTime);
      videoEl.removeEventListener("loadedmetadata", setMeta);
    };
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Play/Pause toggle and overlay animation
  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (isPlaying) {
      videoEl.pause();
      setIsPlaying(false);
      setPlayPauseAnim("pause");
    } else {
      videoEl.play();
      setIsPlaying(true);
      setPlayPauseAnim("play");
    }
    setTimeout(() => setPlayPauseAnim(null), 1000);
  };

  // Rewind and forward 5 seconds
  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
    }
  };

  const handleForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, duration);
    }
  };

  // Toggle mute/unmute when volume icon is clicked
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Update volume from slider changes
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Format time (in seconds) to "M:SS"
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // Autoplay toggle state (for further logic if needed)
  const toggleAutoplay = () => {
    setIsAutoplay(prev => !prev);
  };

  // Toggle miniplayer mode (small fixed container)
  const toggleMiniplayer = () => {
    setIsMiniplayer(prev => !prev);
    if (isCinemaMode) setIsCinemaMode(false);
  };

  // Toggle cinema mode (full-width container)
  const toggleCinemaMode = () => {
    setIsCinemaMode(prev => !prev);
    if (isMiniplayer) setIsMiniplayer(false);
  };

  // Toggle fullscreen using the Fullscreen API
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Sleep Timer: when a duration is selected, pause the video after that time
  const handleSleepTimerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let seconds = 0;
    if (value.includes("sec")) {
      seconds = parseInt(value);
    } else if (value.includes("hour")) {
      seconds = 3600;
    }
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
    }
    if (seconds > 0) {
      sleepTimerRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }, seconds * 1000);
    }
  };

  // Change playback speed
  const handlePlaybackSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  // Handle clicks on the progress bar for seeking
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percentage * duration;
    }
  };

  // Calculate progress percentage (avoid division by zero)
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div
        ref={videoContainerRef}
        className={`
          relative bg-black rounded overflow-hidden ${ambientMode ? "shadow-xl" : "shadow-sm"}
          ${isCinemaMode ? "w-full" : ""}
          ${isMiniplayer ? "w-64 h-36 fixed bottom-4 right-4" : "aspect-video"}
        `}
      >
        <video
          ref={videoRef}
          src={video.videoSrc}
          autoPlay
          className="w-full h-full rounded"
          onClick={togglePlay}
        />
        {/* Center play/pause overlay animation */}
        {playPauseAnim && (
          <div className="absolute inset-0 flex items-center justify-center">
            {playPauseAnim === "play" ? (
              <FiPlay className="text-white text-6xl animate-fade" />
            ) : (
              <FiPause className="text-white text-6xl animate-fade" />
            )}
          </div>
        )}
        {/* Progress Bar */}
        <div className="absolute bottom-12 left-0 right-0 px-2">
          <div onClick={handleProgressClick} className="w-full h-1 bg-gray-300 cursor-pointer">
            <div
              className="h-full bg-blue-900 relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-900 rounded-full" />
            </div>
          </div>
        </div>
        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent p-2 flex items-center text-white">
          {/* Left group: Rewind, Play/Pause, Forward */}
          <div className="flex items-center space-x-2">
            <button onClick={handleRewind} title="Rewind 5 seconds" className="hover:text-gray-300">
              <FiRewind className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
              className="hover:text-gray-300"
            >
              {isPlaying ? (
                <FiPause className="w-6 h-6" />
              ) : (
                <FiPlay className="w-6 h-6" />
              )}
            </button>
            <button onClick={handleForward} title="Forward 5 seconds" className="hover:text-gray-300">
              <FiFastForward className="w-5 h-5" />
            </button>
          </div>
          {/* Middle group: Volume control and time display */}
          <div
            className="flex items-center space-x-2 ml-4 relative"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button onClick={toggleMute} title="Volume" className="hover:text-gray-300">
              {isMuted ? (
                <FiVolumeX className="w-5 h-5" />
              ) : (
                <FiVolume2 className="w-5 h-5" />
              )}
            </button>
            {showVolumeSlider && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="ml-2"
              />
            )}
            <span className="text-sm">
              {formatTime(currentTime)}/{formatTime(duration)}
            </span>
          </div>
          {/* Right group: Autoplay, Subtitles, Settings, Miniplayer, Cinema Mode, Fullscreen */}
          <div className="flex items-center space-x-2 ml-auto">
            <button onClick={toggleAutoplay} title="Autoplay" className="hover:text-gray-300">
              <FiToggleRight className={`w-5 h-5 ${isAutoplay ? "text-blue-400" : "text-gray-300"}`} />
            </button>
            <button title="Subtitles" className="hover:text-gray-300">
              <FiMessageSquare className="w-5 h-5" />
            </button>
            {/* Settings Popup */}
            <div className="relative">
              <button onClick={() => setShowSettings(!showSettings)} title="Settings" className="hover:text-gray-300">
                <FiSettings className="w-5 h-5" />
              </button>
              {showSettings && (
                <div className="absolute bottom-10 right-0 bg-gray-800 p-4 rounded shadow-lg text-sm w-56">
                  <div className="flex items-center justify-between mb-2">
                    <span>Ambient Mode</span>
                    <button
                      onClick={() => setAmbientMode(!ambientMode)}
                      className="ml-2 bg-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {ambientMode ? "On" : "Off"}
                    </button>
                  </div>
                  <div className="mb-2">
                    <span>Subtitles</span>
                    <select className="ml-2 bg-gray-700 px-1 py-0.5 rounded text-xs">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <span>Sleep Timer</span>
                    <select onChange={handleSleepTimerChange} className="ml-2 bg-gray-700 px-1 py-0.5 rounded text-xs">
                      <option value="0">Off</option>
                      <option value="10 sec">10 sec</option>
                      <option value="20 sec">20 sec</option>
                      <option value="30 sec">30 sec</option>
                      <option value="40 sec">40 sec</option>
                      <option value="50 sec">50 sec</option>
                      <option value="1 hour">1 hour</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <span>Playback Speed</span>
                    <select onChange={handlePlaybackSpeedChange} className="ml-2 bg-gray-700 px-1 py-0.5 rounded text-xs">
                      <option value="0.25">0.25</option>
                      <option value="0.5">0.5</option>
                      <option value="0.75">0.75</option>
                      <option value="1" selected>
                        normal
                      </option>
                      <option value="1.5">1.5</option>
                      <option value="2">2</option>
                    </select>
                  </div>
                  <div>
                    <span>Quality</span>
                    <select className="ml-2 bg-gray-700 px-1 py-0.5 rounded text-xs">
                      <option>1080p</option>
                      <option>720p</option>
                      <option>360p</option>
                      <option>144p</option>
                      <option>Auto</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <button onClick={toggleMiniplayer} title="Miniplayer" className="hover:text-gray-300">
              <FiMinimize className="w-5 h-5" />
            </button>
            <button onClick={toggleCinemaMode} title="Cinema Mode" className="hover:text-gray-300">
              <FiMonitor className="w-5 h-5" />
            </button>
            <button onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} className="hover:text-gray-300">
              {isFullscreen ? (
                <FiMinimize className="w-5 h-5" />
              ) : (
                <FiMaximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Video metadata & actions */}
      <div className="space-y-2">
        <h1 className="text-xl font-bold line-clamp-2">{video.title}</h1>
        <div className="flex items-center gap-2">
          <img
            src={video.channelAvatar}
            alt="Channel"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{video.channelName}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded">Join</button>
            <button className="px-3 py-1 bg-red-600 text-white rounded">Subscribe</button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1">
            <FiThumbsUp className="w-5 h-5" />
            <span>{video.likes}</span>
          </button>
          <button className="flex items-center space-x-1">
            <FiThumbsDown className="w-5 h-5" />
          </button>
          <button className="flex items-center space-x-1">
            <FiShare className="w-5 h-5" />
            <span>Share</span>
          </button>
          <button className="flex items-center space-x-1">
            <FiDownload className="w-5 h-5" />
            <span>Download</span>
          </button>
          <button className="flex items-center space-x-1">
            <FiSave className="w-5 h-5" />
            <span>Save</span>
          </button>
          <button className="flex items-center space-x-1">
            <FiMoreVertical className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {video.views} views · {video.uploadDate}
        </div>
        <div>
          <p className={`text-sm ${!descriptionExpanded ? "line-clamp-3" : ""}`}>
            {video.description}
          </p>
          <button
            onClick={() => setDescriptionExpanded((prev) => !prev)}
            className="text-blue-500 text-sm"
          >
            {descriptionExpanded ? "Show less" : "Show more"}
          </button>
        </div>
      </div>
    </div>
  );
}
