'use client';

import { useEffect, useState, use, useCallback } from "react";
import VideoPlayer from "@/components/video/VideoPlayer";
import Header from "@/components/home/header";
import SuggestedVideos from "./SuggestedVideos";
import CommentsSection from "./CommentSection";
import Sidebar from "@/components/home/sidebar";
import { mVideo as Video } from "../../../types";
import { FiAlertCircle, FiWifi, FiRefreshCw, FiVideo } from "react-icons/fi";

// Skeleton Components
const VideoPlayerSkeleton = () => (
  <div className="space-y-4">
    <div className="relative aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center">
          <FiVideo className="w-8 h-8 text-gray-500" />
        </div>
      </div>
    </div>
    
    {/* Title skeleton */}
    <div className="space-y-2">
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
    </div>
    
    {/* Channel info skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="space-y-1">
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
      </div>
    </div>
    
    {/* Action buttons skeleton */}
    <div className="flex gap-2">
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
    </div>
    
    {/* Description skeleton */}
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
      </div>
    </div>
  </div>
);

const SuggestedVideosSkeleton = () => (
  <div className="space-y-4">
    <div className="flex gap-2 mb-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
      ))}
    </div>
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex gap-2 p-2">
        <div className="w-40 h-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

const CommentsSkeleton = () => (
  <div className="mt-8 space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
    </div>
    
    <div className="flex gap-3">
      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
      <div className="flex-1 space-y-2">
        <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
      </div>
    </div>
    
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex gap-3">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="flex gap-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Error Component
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => {
  const is500Error = error.includes('500') || error.includes('Internal Server Error');
  const isNetworkError = error.includes('Failed to fetch') || error.includes('Network Error');
  
  const getErrorIcon = () => {
    if (isNetworkError) return <FiWifi className="w-16 h-16 text-gray-400" />;
    if (is500Error) return <FiAlertCircle className="w-16 h-16 text-red-400" />;
    return <FiVideo className="w-16 h-16 text-gray-400" />;
  };
  
  const getErrorTitle = () => {
    if (isNetworkError) return "Connection Error";
    if (is500Error) return "Something went wrong";
    return "Video not found";
  };
  
  const getErrorMessage = () => {
    if (isNetworkError) return "Please check your internet connection and try again.";
    if (is500Error) return "We're experiencing technical difficulties. Please try again in a moment.";
    return "The video you're looking for doesn't exist or has been removed.";
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-16">
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="flex justify-center items-center mb-2">
            {getErrorIcon()}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
            {getErrorTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getErrorMessage()}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-16">
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4 ml-10">
        <div className="md:w-2/3 space-y-4">
          <VideoPlayerSkeleton />
          <CommentsSkeleton />
        </div>
        <div className="md:w-1/3">
          <SuggestedVideosSkeleton />
        </div>
      </div>
    </div>
  </div>
);

export default function WatchPage({ params }: { params: Promise<{ v: string }> }) {
  // Unwrap the params Promise using React.use()
  const { v: videoId } = use(params);
  
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch video data only
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}`, {
        cache: "no-store",
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (!data.video) throw new Error('Video data not found in response');
      
      setVideo(data.video);
      
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      const message =
        err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err) || 'Error loading video';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Show loading skeleton
  if (loading) {
    return (
      <>
        <Header />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <LoadingSkeleton />
      </>
    );
  }

  // Show error state
  if (error || !video) {
    return (
      <>
        <Header />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <ErrorState 
          error={error || "Video not found"} 
          onRetry={fetchData} 
        />
      </>
    );
  }

  // Show normal content
  return (
    <>
      <Header />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-16">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col md:flex-row gap-4 ml-10">
            <div className="md:w-2/3 space-y-4">
              <VideoPlayer video={video} />
              <CommentsSection videoId={videoId} allowComments={video.allowComments} />
            </div>
            <div className="md:w-1/3">
              <SuggestedVideos videoId={videoId} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}