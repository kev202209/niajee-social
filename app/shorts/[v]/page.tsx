"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/watch/Header";
import Sidebar from "@/components/watch/Sidebar";
import VideoPlayer from "./shortVideoPlayer";
import ShortsSkeleton from './ShortSkeleton';
import VideoActions from "./VideoActions";
import ReportModal from "./ReportModal"; 
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import CommentsSection from "./CommentsSection";
import { getFullUrl } from "@/app/utils/videourl";
import { Comment } from "@/types";

// Updated backend data structure for shorts
interface ShortData {
  id: string;
  title: string;
  description?: string;
  videoUrl: {
    [quality: string]: string;
  } | string; // Handle both formats
  videoSrc?: string; // Direct video source URL
  masterPlaylist?: string;
  qualities?: string[];
  thumbnailUrl: string | null;
  duration: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  isPublic: boolean;
  isLiked: boolean;
  isSaved: boolean;
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
    isFollowed: boolean;
  };
  user?: {
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
  
  // Add report modal state
  const [showReport, setShowReport] = useState(false);

  // Refs for the scroll container and current video element.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentVideoRef = useRef<HTMLVideoElement>(null!);

  // Helper function to get the best video URL
  const getBestVideoUrl = (video: ShortData): string => {
    // If videoSrc is provided, use it
    if (video.videoSrc) {
      return getFullUrl(video.videoSrc);
    }

    // If masterPlaylist is provided, use it for HLS
    if (video.masterPlaylist) {
      return getFullUrl(video.masterPlaylist);
    }

    // If videoUrl is a string, return it
    if (typeof video.videoUrl === 'string') {
      return getFullUrl(video.videoUrl);
    }

    // If videoUrl is an object, pick the best quality
    if (typeof video.videoUrl === 'object') {
      const qualities = video.qualities || Object.keys(video.videoUrl);
      const preferredQualities = ['1080p', '720p', '480p', '360p', '240p'];
      for (const quality of preferredQualities) {
        if (video.videoUrl[quality]) {
          return getFullUrl(video.videoUrl[quality]);
        }
      }
      // Fallback to first available quality
      const firstQuality = Object.keys(video.videoUrl)[0];
      if (firstQuality) {
        return getFullUrl(video.videoUrl[firstQuality]);
      }
    }

    return '';
  };

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

  // On mount, read the saved volume from localStorage.
  useEffect(() => {
    try {
      const savedVolume = localStorage.getItem('video-volume');
      if (savedVolume) {
        const volValue = parseFloat(savedVolume);
        if (!isNaN(volValue) && volValue >= 0 && volValue <= 1) {
          setVolume(volValue);
        }
      }
    } catch (error) {
      console.warn('Failed to read volume from localStorage:', error);
    }
  }, []);

  // Update volume in localStorage
  const updateVolumeStorage = (vol: number) => {
    try {
      localStorage.setItem('video-volume', vol.toString());
    } catch (error) {
      console.warn('Failed to save volume to localStorage:', error);
    }
  };

  // Fetch current video by ID or default.
  const fetchCurrentVideo = async (videoId?: string): Promise<ShortData | null> => {
    try {
      let apiData: ShortData;
      if (videoId) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoId}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error('Failed to fetch video');
        const data = await res.json();
        apiData = data.short || data;
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shorts?page=1&limit=1`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error('Failed to fetch videos');
        const result = await res.json();
        apiData = result.shorts[0] || result.data[0];
      }

      // Ensure user object exists (use channel data as fallback)
      if (!apiData.user && apiData.channel) {
        apiData.user = {
          id: apiData.channel.id,
          username: apiData.channel.handle.replace('@', ''),
          displayName: apiData.channel.name,
          profilePic: apiData.channel.avatar,
          verified: apiData.channel.verified
        };
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/shorts?page=1&limit=1`,
        { credentials: "include" } // <-- Add this line
      );
      if (!res.ok) throw new Error('Failed to fetch next video');
      const result = await res.json();
      const apiData = result.shorts[0] || result.data[0];
      
      // Ensure user object exists
      if (!apiData.user && apiData.channel) {
        apiData.user = {
          id: apiData.channel.id,
          username: apiData.channel.handle.replace('@', ''),
          displayName: apiData.channel.name,
          profilePic: apiData.channel.avatar,
          verified: apiData.channel.verified
        };
      }

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
    updateVolumeStorage(newVolume);
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
    setShowComments((prev) => !prev);
  };

  // Handle show report modal
  const handleShowReport = () => {
    setShowReport(true);
  };

  if (loading || !currentVideo) {
    return <ShortsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative">
      <Sidebar isOpen={false} onClose={() => {}} />
      <Header />

      <div className="pt-10">
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
                  videoSrc={getBestVideoUrl(currentVideo)}
                  videoId={currentVideo.id}
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
                  caption={currentVideo.description || currentVideo.title || ""}
                  song="Original Audio"
                />
              </div>

              {/* Video Actions */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                <VideoActions 
                  video={currentVideo}
                  onToggleComments={toggleComments}
                  onShowReport={handleShowReport}
                />
              </div>

              {/* Comments Section */}
              {showComments && (
                <CommentsSection
                  shortId={currentVideo.id}
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
                  videoSrc={getBestVideoUrl(nextVideo)}
                  videoId={nextVideo.id}
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
                  caption={nextVideo.description || nextVideo.title || ""}
                  song="Original Audio"
                />
              ) : (
                <ShortsSkeleton />
              )}
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
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

      {/* Report Modal - Rendered at page level */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        videoId={currentVideo.id}
        videoTitle={currentVideo.title}
      />
    </div>
  );
};

export default ShortVideoPage;
