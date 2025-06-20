import { FC, useCallback, useEffect, useRef, useState } from "react";
import VideoCard from "./VideoCard";
import ShortsRow from "./ShortsRow";
import MainContentSkeleton from "./MainContentSkeleton";
import { Short, Video } from "../../types";
import { FiRefreshCw, FiVideo, FiPlayCircle } from "react-icons/fi";

const MainContent: FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Short[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);

  // Function to fetch data from the backend
  const fetchContent = async (pageNumber: number, isRetry: boolean = false) => {
    setLoading(true);
    if (isRetry) {
      setError(null);
      setPage(1);
      setVideos([]);
      setShorts([]);
      setInitialLoadComplete(false);
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content?page=${pageNumber}`);
      if (response.ok) {
        const data = await response.json();
        
        if (isRetry || pageNumber === 1) {
          // Replace data on retry or initial load
          setVideos(data.videos || []);
          setShorts(data.shorts || []);
        } else {
          // Append new data to existing state for pagination
          setVideos((prev) => [...prev, ...(data.videos || [])]);
          setShorts((prev) => [...prev, ...(data.shorts || [])]);
        }
      } else {
        setError("Failed to load content");
        console.error("Failed to fetch content");
      }
    } catch (error) {
      setError("Something went wrong while loading content");
      console.error("Error fetching content", error);
    } finally {
      setLoading(false);
      if (pageNumber === 1) {
        setInitialLoadComplete(true);
      }
    }
  };

  // Fetch initial content and additional pages as the "page" state updates
  useEffect(() => {
    fetchContent(page);
  }, [page]);

  // Handle retry functionality
  const handleRetry = () => {
    fetchContent(1, true);
  };

  // Intersection Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastSegmentRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          // Increase page number to load next batch
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
  );

  // Show skeleton during initial load
  if (loading && !initialLoadComplete) {
    return <MainContentSkeleton />;
  }

  // Show error state
  if (error && initialLoadComplete) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <FiVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
          </div>
          <button
            onClick={handleRetry}
            disabled={loading}
            className={`
              inline-flex items-center gap-2 px-6 py-3 
              bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
              text-white rounded-lg transition-colors duration-200 
              font-medium text-sm
              ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (initialLoadComplete && videos.length === 0 && shorts.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <FiPlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No content available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There's no content to show right now. Check back later or try refreshing.
            </p>
          </div>
          <button
            onClick={handleRetry}
            disabled={loading}
            className={`
              inline-flex items-center gap-2 px-6 py-3 
              bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
              text-white rounded-lg transition-colors duration-200 
              font-medium text-sm
              ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh Content'}
          </button>
        </div>
      </div>
    );
  }

  // Group videos into chunks of 8 for display purposes
  const videoChunks: Video[][] = [];
  for (let i = 0; i < videos.length; i += 8) {
    videoChunks.push(videos.slice(i, i + 8));
  }

  // Show content with optional refresh button in header
  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Optional header with refresh button */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Discover
          </h2>
          <button
            onClick={handleRetry}
            disabled={loading}
            className={`
              p-2 hover:bg-gray-100 dark:hover:bg-gray-800 
              rounded-full transition-colors duration-200
              ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
            title="Refresh content"
          >
            <FiRefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-8">
        {videoChunks.map((chunk, index) => (
          <div key={index}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {chunk.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
            {shorts.length > 0 && <ShortsRow shorts={shorts} />}
            {index === videoChunks.length - 1 && (
              <div ref={lastSegmentRef} className="h-1" />
            )}
          </div>
        ))}
        
        {/* Loading indicator for pagination */}
        {loading && initialLoadComplete && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FiRefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading more content...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
