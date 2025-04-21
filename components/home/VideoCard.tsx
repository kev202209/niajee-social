import { FC, useEffect, useRef, useState } from "react";
import { Video } from "../../types";
import Image from "next/image";
import { FiVolume, FiVolumeX, FiMoreHorizontal, FiPlusCircle, FiFlag, FiXCircle, FiMessageCircle } from "react-icons/fi";
import Link from "next/link";
import timeAgo from "../../app/utils/timeAgo";



function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
}



const VideoCard: FC<{ video: Video }> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.5);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  useOutsideClick(optionsRef, () => setShowOptions(false));

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

  return (
    <Link href={`/watch/${video.videoId}`}>
      <div className="bg-white dark:bg-gray-800 rounded shadow cursor-pointer relative">
        {/* Video Thumbnail Container with 3:2 Aspect Ratio */}
        <div
          className="relative group rounded-t overflow-hidden aspect-[3/2]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <video
            ref={videoRef}
            src={video.videoSrc}
            muted={isMuted}
            loop
            playsInline
            className="absolute inset-0 object-cover w-full h-full rounded-b"
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
        <div className="p-2 relative overflow-visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src={video.channelAvatar}
                alt={video.channelName}
                width={24}
                height={24}
                className="rounded-full h-6 w-6"
              />
              <span className="line-clamp-2 ml-2 font-thin text-gray-900 dark:text-gray-100 text-base">
                {video.title}
              </span>


            </div>
            <div className="relative" ref={optionsRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
                className="p-1"
              >
                {/* Rotated to display vertical three-dot icon */}
                <FiMoreHorizontal
                  style={{ transform: "rotate(90deg)" }}
                  className="text-gray-900 dark:text-gray-100"
                />
              </button>
              {showOptions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-100">
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
              )}
            </div>
          </div>
          <div className="mt-1">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {video.channelName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {video.views} views • {timeAgo(video.age)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};


export default VideoCard