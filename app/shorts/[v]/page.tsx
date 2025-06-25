"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/watch/Header";
import Sidebar from "@/components/watch/Sidebar";
import VideoPlayer from "./shortVideoPlayer";
import ShortsSkeleton from './ShortSkeleton';
import VideoActions from "./VideoActions";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import CommentsSection from "./CommentsSection";
import { Comment } from "@/types";

// Backend data structure for shorts
interface ShortData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPublic: boolean;
  allowComments: boolean;
  allowDuet: boolean;
  monetization: {
    enabled: boolean;
    reason: string | null;
  };
  tags: string[];
  mentions: string[];
  location: string | null;
  createdAt: string;
  channel: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
  };
  user: {
    id: string;
    username: string;
    displayName: string;
    profilePic: string;
    verified: boolean;
  };
}

const ShortVideoPage = () => {
  const params = useParams();
  const initialVideoId = Array.isArray(params?.v) ? params.v[0] : params?.v;
  const router = useRouter();

  const [currentVideo, setCurrentVideo] = useState<ShortData | null>(null);
  const [nextVideo, setNextVideo] = useState<ShortData | null>(null);
  // Track history of videos for "back" navigation.
  const [videoHistory, setVideoHistory] = useState<ShortData[]>([]);
  const [loading, setLoading] = useState(true);

  // Video control states.
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0.5);
  // New state: whether the comments panel is showing.
  const [showComments, setShowComments] = useState(false);

  // Refs for the scroll container and current video element.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentVideoRef = useRef<HTMLVideoElement>(null!);

  // Add keyboard navigation handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        handleScrollUp();
      } else if (event.key === "ArrowDown") {
        handleScrollDown();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentVideo, nextVideo, videoHistory]);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (event.deltaY > 0) {
        handleScrollDown();
      } else if (event.deltaY < 0) {
        handleScrollUp();
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleScroll);
      return () => container.removeEventListener("wheel", handleScroll);
    }
  }, [currentVideo, nextVideo, videoHistory]);

  // On mount, read the saved volume cookie.
  useEffect(() => {
    const cookieStr = document.cookie.split("; ").find(row => row.startsWith("volume="));
    if (cookieStr) {
      const volValue = parseFloat(cookieStr.split("=")[1]);
      if (!isNaN(volValue)) {
        setVolume(volValue);
      }
    }
  }, []);

  // Update volume cookie (expires in 1 year).
  const updateVolumeCookie = (vol: number) => {
    const maxAge = 60 * 60 * 24 * 365; // seconds
    document.cookie = `volume=${vol}; path=/; max-age=${maxAge}`;
  };

  // Fetch current video by ID or default.
  const fetchCurrentVideo = async (videoId?: string): Promise<ShortData | null> => {
    try {
      let apiData: ShortData;
      if (videoId) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoId}`);
        if (!res.ok) throw new Error('Failed to fetch video');
        apiData = await res.json();
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shorts?page=1&limit=1`
        );
        if (!res.ok) throw new Error('Failed to fetch videos');
        const result = await res.json();
        apiData = result.shorts[0];
      }
      return apiData;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Fetch next video.
  const fetchNextVideo = async (): Promise<ShortData | null> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shorts?page=1&limit=1`
      );
      if (!res.ok) throw new Error('Failed to fetch next video');
      const result = await res.json();
      const apiData = result.shorts[0];
      return apiData;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Helper: update URL with current short id.
  const updateUrl = (id: string) => {
    window.history.pushState(null, '', `/shorts/${id}`);
  };

  useEffect(() => {
    const init = async () => {
      const current = await fetchCurrentVideo(initialVideoId);
      if (current) {
        setCurrentVideo(current);
        updateUrl(current.id);
        const next = await fetchNextVideo();
        setNextVideo(next);
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        currentVideoRef.current.volume = volume;
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
    updateVolumeCookie(newVolume);
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

  // Navigation: scroll down to next video.
  const handleScrollDown = async () => {
    if (!nextVideo || !scrollContainerRef.current || !currentVideo) return;
    scrollContainerRef.current.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
    setTimeout(async () => {
      setVideoHistory((prev) => [...prev, currentVideo]);
      setCurrentVideo(nextVideo);
      updateUrl(nextVideo.id);
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

  // Navigation: scroll up to previous video.
  const handleScrollUp = () => {
    if (videoHistory.length === 0 || !scrollContainerRef.current || !currentVideo)
      return;
    const prevVideo = videoHistory[videoHistory.length - 1];
    scrollContainerRef.current.scrollTo({ top: window.innerHeight, behavior: "auto" });
    scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setVideoHistory((prev) => prev.slice(0, -1));
      setCurrentVideo(prevVideo);
      updateUrl(prevVideo.id);
      setIsPaused(false);
      setIsMuted(true);
      if (currentVideoRef.current) {
        currentVideoRef.current.muted = true;
      }
    }, 600);
  };

  // Toggle comments panel visibility.
  const toggleComments = () => {
    console.log('toggleComments called, current showComments:', showComments); // Debug log
    setShowComments((prev) => {
      console.log('Setting showComments from', prev, 'to', !prev); // Debug log
      return !prev;
    });
  };

  if (loading || !currentVideo) {
    return <ShortsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative">
      <Sidebar isOpen={false} onClose={() => {}} />
      <Header />

      <div className="pt-16"> {/* Reduced padding */}
        <div
          ref={scrollContainerRef}
          className="h-screen overflow-hidden flex justify-center"
        >
          <div className="h-[200vh] w-full max-w-[500px] relative">
            {/* Current Video Container */}
            <div className="relative h-screen">
              {/* Video Player Container */}
              <div className="flex items-center justify-center h-full">
                <VideoPlayer
                  videoRef={currentVideoRef}
                  videoSrc={currentVideo.videoUrl}
                  isMuted={isMuted}
                  isPaused={isPaused}
                  volume={volume}
                  onVolumeChange={handleVolumeChange}
                  toggleMute={toggleMute}
                  togglePlayPause={togglePlayPause}
                  channel={{
                    name: currentVideo.channel.name,
                    icon: currentVideo.channel.avatar,
                  }}
                  caption={currentVideo.description || ""}
                  song="Original Audio"
                />
              </div>

              {/* Video Actions - Better positioned */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                <VideoActions 
                  onToggleComments={toggleComments}
                  likeCount={currentVideo.likeCount}
                />
              </div>

              {/* Comments Section - Remove the absolute wrapper */}
              {showComments && (
                <CommentsSection
                  comments={[]} // Will be populated when comments API is implemented
                  commentsEnabled={currentVideo.allowComments}
                  onClose={() => setShowComments(false)}
                />
              )}
            </div>

            {/* Next Video Preview */}
            <div className="h-screen flex items-center justify-center">
              {nextVideo ? (
                <VideoPlayer
                  videoRef={null}
                  videoSrc={nextVideo.videoUrl}
                  isMuted={true}
                  isPaused={true}
                  volume={volume}
                  onVolumeChange={handleVolumeChange}
                  toggleMute={() => {}}
                  togglePlayPause={() => {}}
                  channel={{
                    name: nextVideo.channel.name,
                    icon: nextVideo.channel.avatar,
                  }}
                  caption={nextVideo.description || ""}
                  song="Original Audio"
                />
              ) : (
                <ShortsSkeleton />
              )}
            </div>
          </div>
        </div>

        {/* Navigation arrows - Better positioned */}
        <div className="hidden lg:flex absolute left-4 top-1/2 transform -translate-y-1/2 flex-col items-center space-y-4 z-10">
          <button
            onClick={handleScrollUp}
            disabled={videoHistory.length === 0}
            className="bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-full transition-all duration-200"
            aria-label="Previous video"
          >
            <FaArrowUp className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleScrollDown}
            disabled={!nextVideo}
            className="bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-full transition-all duration-200"
            aria-label="Next video"
          >
            <FaArrowDown className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortVideoPage;
