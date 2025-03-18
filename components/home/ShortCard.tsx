import { Short } from "@/types"; 
import { FC, useEffect, useRef, useState } from "react";
import { FiFlag, FiMessageCircle, FiMoreHorizontal, FiPlusCircle, FiVolume, FiVolumeX, FiXCircle } from "react-icons/fi";
import DropdownMenuPortal from "./DropDownMenu";
import Link from "next/link";

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow cursor-pointer relative w-40 flex-shrink-0">
      {/* Short Video Container with 9:16 Aspect Ratio */}
      <div
        className="relative group rounded-t overflow-hidden aspect-[9/16]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          src={short.videoSrc} // Dynamic video source from backend
          muted={isMuted}
          loop
          playsInline
          className="absolute inset-0 object-cover w-full h-full"
        />
        {/* Volume Button & Slider */}
        <button
          onClick={toggleMute}
          className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
          {isMuted ? <FiVolumeX /> : <FiVolume />}
        </button>
        <div className="absolute bottom-12 right-2 opacity-0 group-hover:opacity-100 transition">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 transform -rotate-90"
          />
        </div>
      </div>
      {/* Details Section */}
      <div className="p-2 relative">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {short.title}
          </p>
          <button ref={menuButtonRef} onClick={handleToggleOptions} className="p-1">
            <FiMoreHorizontal
              style={{ transform: "rotate(90deg)" }}
              className="text-gray-900 dark:text-gray-100"
            />
          </button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {short.views}
        </div>
      </div>
      {/* Render dropdown menu using the portal so it isn’t confined by the Shorts section */}
      {showOptions && dropdownPosition && (
        <DropdownMenuPortal position={dropdownPosition}>
          <div className="w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
            <button className="flex items-center w-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <FiPlusCircle className="mr-2" />
              <span className="text-sm">Add to Queue</span>
            </button>
            <button className="flex items-center w-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <FiFlag className="mr-2" />
              <span className="text-sm">Report</span>
            </button>
            <button className="flex items-center w-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <FiXCircle className="mr-2" />
              <span className="text-sm">Not Interested</span>
            </button>
            <button className="flex items-center w-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <FiMessageCircle className="mr-2" />
              <span className="text-sm">Send Feedback</span>
            </button>
          </div>
        </DropdownMenuPortal>
      )}
    </div>
    </Link>
  );
};

export default ShortCard;
