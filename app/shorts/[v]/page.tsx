"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/watch/Header";
import Sidebar from "@/components/watch/Sidebar";
import VideoPlayer from "./shortVideoPlayer";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface Channel {
  name: string;
  icon: string | null;
  _id?: string;
}

interface Comment {
  username: string;
  userIcon: string | null;
  age: string;
  text: string;
  likes: string;
  repliesCount?: number;
}

interface ShortData {
  _id: string;
  videoSrc: string;
  title: string;
  views: string;
  channel: Channel;
  caption: string;
  song: string;
  commentsEnabled: boolean;
  comments: Comment[];
}

// Helper: ensure URL is absolute.
const getFullUrl = (url: string): string =>
  url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`;

const ShortVideoPage = () => {
  const params = useParams();
  const initialVideoId = params?.v;
  const router = useRouter();

  const [currentVideo, setCurrentVideo] = useState<ShortData | null>(null);
  const [nextVideo, setNextVideo] = useState<ShortData | null>(null);
  const [videoHistory, setVideoHistory] = useState<ShortData[]>([]);
  const [loading, setLoading] = useState(true);

  // Video control states.
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Refs for the scroll container and the current video element.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentVideoRef = useRef<HTMLVideoElement>(null);

  // Fetch current video: either by ID (if provided) or via limit=1.
  const fetchCurrentVideo = async (videoId?: string): Promise<ShortData | null> => {
    try {
      let data: ShortData;
      if (videoId) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoId}`);
        data = await res.json();
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shorts?page=1&limit=1`
        );
        const result = await res.json();
        data = result.shorts[0];
      }
      data.videoSrc = getFullUrl(data.videoSrc);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Fetch the next video from the endpoint.
  const fetchNextVideo = async (): Promise<ShortData | null> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shorts?page=1&limit=1`
      );
      const result = await res.json();
      const data: ShortData = result.shorts[0];
      data.videoSrc = getFullUrl(data.videoSrc);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      const current = await fetchCurrentVideo(initialVideoId);
      if (current) {
        setCurrentVideo(current);
        router.replace(`/shorts/${current._id}`);
        const next = await fetchNextVideo();
        setNextVideo(next);
        setLoading(false);
      }
    };
    init();
  }, [initialVideoId]);

  // Video control functions.
  const toggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (currentVideoRef.current) {
        currentVideoRef.current.muted = newMuted;
      }
      return newMuted;
    });
  };

  const togglePlayPause = () => {
    if (currentVideoRef.current) {
      if (isPaused) {
        // On user interaction, unmute and set volume
        currentVideoRef.current.volume = 0.5;
        setVolume(0.5);
        setIsMuted(false);
        currentVideoRef.current.muted = false;
        currentVideoRef.current.play();
      } else {
        currentVideoRef.current.pause();
      }
      setIsPaused((prev) => !prev);
    }
  };
  

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (currentVideoRef.current) {
      currentVideoRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        currentVideoRef.current.muted = false;
      }
      if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
        currentVideoRef.current.muted = true;
      }
    }
  };

  // Handle scroll down: update states and fetch a new next video.
  const handleScrollDown = async () => {
    if (!nextVideo || !scrollContainerRef.current || !currentVideo) return;
    scrollContainerRef.current.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
    setTimeout(async () => {
      setVideoHistory((prev) => [...prev, currentVideo]);
      setCurrentVideo(nextVideo);
      router.replace(`/shorts/${nextVideo._id}`);
      setIsPaused(false);
      setIsMuted(true);
      if (currentVideoRef.current) {
        currentVideoRef.current.muted = true;
      }
      const newNext = await fetchNextVideo();
      setNextVideo(newNext);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }, 600);
  };

  // Handle scroll up: update state with previous video.
  const handleScrollUp = () => {
    if (videoHistory.length === 0 || !scrollContainerRef.current || !currentVideo)
      return;
    const prevVideo = videoHistory[videoHistory.length - 1];
    scrollContainerRef.current.scrollTo({ top: window.innerHeight, behavior: "auto" });
    scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setVideoHistory((prev) => prev.slice(0, -1));
      setCurrentVideo(prevVideo);
      router.replace(`/shorts/${prevVideo._id}`);
      setIsPaused(false);
      setIsMuted(true);
      if (currentVideoRef.current) {
        currentVideoRef.current.muted = true;
      }
    }, 600);
  };

  if (loading || !currentVideo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative">
      <Sidebar isOpen={false} onClose={() => {}} />
      <Header />

      <div className="pt-20">
        <div
          ref={scrollContainerRef}
          className="h-screen overflow-hidden flex justify-center"
        >
          <div className="h-[200vh] w-full max-w-[500px] relative">
            {/* Current Video (first viewport) */}
            <div className="h-screen relative flex items-center justify-center">
              <VideoPlayer
                videoRef={currentVideoRef}
                videoSrc={currentVideo.videoSrc}
                isMuted={isMuted}
                isPaused={isPaused}
                volume={volume}
                onVolumeChange={handleVolumeChange}
                toggleMute={toggleMute}
                togglePlayPause={togglePlayPause}
                channel={currentVideo.channel}
                caption={currentVideo.caption}
                song={currentVideo.song}
              />
            </div>
            {/* Next Video Preview (second viewport) */}
            <div className="h-screen flex items-center justify-center">
              {nextVideo ? (
                <VideoPlayer
                  videoRef={null} // preview video doesn't need a ref
                  videoSrc={nextVideo.videoSrc}
                  isMuted={true}
                  isPaused={true}
                  volume={volume}
                  onVolumeChange={handleVolumeChange}
                  toggleMute={() => {}}
                  togglePlayPause={() => {}}
                  channel={nextVideo.channel}
                  caption={nextVideo.caption}
                  song={nextVideo.song}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Loading next video...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-4">
          <button
            onClick={handleScrollUp}
            className="bg-black bg-opacity-50 p-2 rounded"
          >
            <FaArrowUp className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={handleScrollDown}
            className="bg-black bg-opacity-50 p-2 rounded"
          >
            <FaArrowDown className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortVideoPage;
