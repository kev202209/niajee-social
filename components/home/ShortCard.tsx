import { Short } from "@/types"; 
import { FC, useEffect, useRef, useState } from "react";
import { FiFlag, FiMessageCircle, FiMoreHorizontal, FiPlusCircle, FiVolume, FiVolumeX, FiXCircle, FiUser } from "react-icons/fi";
import DropdownMenuPortal from "./DropDownMenu";
import Link from "next/link";
import Image from "next/image";

const ShortCard: FC<{ short: Short }> = ({ short }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.5);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    videoRef.current?.pause();
  };

  const toggleMute = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (videoRef.current) {
        videoRef.current.muted = newMuted;
      }
      return newMuted;
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
      if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
        videoRef.current.muted = true;
      }
    }
  };

  const handleToggleOptions = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setShowOptions((prev) => !prev);
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuButtonRef.current && !menuButtonRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [showOptions]);

  return (
    <Link href={`/shorts/${short.id}`}>
      <div className="bg-inherit rounded-xl shadow hover:shadow-lg transition-shadow cursor-pointer relative w-40 flex-shrink-0">
        {/* Short Video Container with 9:16 Aspect Ratio */}
        <div
          className="relative group rounded-t-xl overflow-hidden aspect-[9/16]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {short.thumbnail ? (
            <video
              ref={videoRef}
              src={short.videoUrl}
              poster={short.thumbnail}
              muted={isMuted}
              loop
              playsInline
              className="absolute inset-0 object-cover w-full h-full"
            />
          ) : (
            <video
              ref={videoRef}
              src={short.videoUrl}
              muted={isMuted}
              loop
              playsInline
              className="absolute inset-0 object-cover w-full h-full"
            />
          )}
          
          {/* Duration Badge */}
          {/* <div className="absolute top-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(short.duration)}
          </div> */}
          
          {/* Volume Button & Slider */}
          <button
            onClick={toggleMute}
            className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            {isMuted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume className="w-4 h-4" />}
          </button>
          
          <div className="absolute bottom-12 right-2 opacity-0 group-hover:opacity-100 transition">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer transform -rotate-90"
            />
          </div>
        </div>
        
        {/* Details Section */}
        <div className="p-3 relative">
          <div className="flex items-start gap-2 mb-2">
            {/* Channel Avatar */}
            <div className="flex-shrink-0">
              {short.channel.avatar ? (
                <Image
                  src={short.channel.avatar}
                  alt={short.channel.name}
                  width={24}
                  height={24}
                  className="rounded-full w-6 h-6 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <FiUser className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Title and Options */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate w-full leading-tight">
                {short.title}
              </h3>
            </div>
            
            <button 
              ref={menuButtonRef} 
              onClick={handleToggleOptions} 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
            >
              <FiMoreHorizontal
                style={{ transform: "rotate(90deg)" }}
                className="text-gray-600 dark:text-gray-400 w-4 h-4"
              />
            </button>
          </div>
          
          {/* Views count only if >= 10 */}
          {short.views >= 10 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatViews(short.views)} views
            </div>
          )}
        </div>
        
        {/* Render dropdown menu using the portal so it isn't confined by the Shorts section */}
        {showOptions && dropdownPosition && (
          <DropdownMenuPortal position={dropdownPosition}>
            <div className="w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
              <button 
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <FiPlusCircle className="mr-3 w-4 h-4" />
                Add to Queue
              </button>
              <button 
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <FiFlag className="mr-3 w-4 h-4" />
                Report
              </button>
              <button 
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <FiXCircle className="mr-3 w-4 h-4" />
                Not Interested
              </button>
              <button 
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <FiMessageCircle className="mr-3 w-4 h-4" />
                Send Feedback
              </button>
            </div>
          </DropdownMenuPortal>
        )}
      </div>
    </Link>
  );
};

export default ShortCard;
