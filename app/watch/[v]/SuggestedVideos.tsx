"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { FiChevronLeft, FiChevronRight, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { SuggestedVideo, getThumbnailSrc } from "@/types";
import Link from "next/link";
import timeAgo from "@/utils/timeAgo";
import HoverPreviewPlayer from "@/components/media/HoverPreviewPlayer";

interface SuggestedVideosProps {
  videoId: string;
  contentType?: 'video' | 'short';
  category?: string;
  includeVideos?: boolean;
  includeShorts?: boolean;
}

// Extended type to include contentType
interface SuggestedContent extends SuggestedVideo {
  contentType: 'video' | 'short';
}

interface PaginationInfo {
  videosPage: number;
  videosHasMore: boolean;
  shortsPage: number;
  shortsHasMore: boolean;
}

interface SuggestedResponse {
  videos: SuggestedContent[];
  shorts: SuggestedContent[];
  pagination: PaginationInfo | null;
}

export default function SuggestedVideos({ 
  videoId, 
  contentType = 'video',
  category,
  includeVideos = true,
  includeShorts = true 
}: SuggestedVideosProps) {
  const [videos, setVideos] = useState<SuggestedContent[]>([]);
  const [shorts, setShorts] = useState<SuggestedContent[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState<'videos' | 'shorts' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const shortsContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Fetch suggested content
  const fetchSuggestedContent = useCallback(async (
    videosPageNum = 1,
    shortsPageNum = 1,
    append = false
  ) => {
    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(videosPageNum > 1 ? 'videos' : 'shorts');
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        v: videoId,
        type: contentType,
        videosPage: videosPageNum.toString(),
        shortsPage: shortsPageNum.toString(),
        includeVideos: includeVideos.toString(),
        includeShorts: includeShorts.toString(),
      });

      if (category) {
        params.append('category', category);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/content/suggested?${params.toString()}`,
        { cache: "no-store", credentials: 'include' }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json() as SuggestedResponse;
      
      if (append) {
        // Append to existing content
        if (videosPageNum > 1 && data.videos) {
          setVideos(prev => [...prev, ...data.videos]);
        }
        if (shortsPageNum > 1 && data.shorts) {
          setShorts(prev => [...prev, ...data.shorts]);
        }
      } else {
        // Replace content
        setVideos(data.videos ?? []);
        setShorts(data.shorts ?? []);
      }

      setPagination(data.pagination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Error fetching suggested content:', err);
      setError(message || 'Failed to load suggested content');
    } finally {
      setLoading(false);
      setLoadingMore(null);
    }
  }, [videoId, contentType, category, includeVideos, includeShorts]);

  useEffect(() => {
    if (videoId) {
      void fetchSuggestedContent(1, 1, false);
    }
  }, [videoId, fetchSuggestedContent]);

  // Load more videos
  const loadMoreVideos = useCallback(() => {
    if (pagination?.videosHasMore && !loadingMore) {
      const nextPage = pagination.videosPage + 1;
      void fetchSuggestedContent(nextPage, pagination.shortsPage, true);
    }
  }, [pagination, loadingMore, fetchSuggestedContent]);

  // Load more shorts
  const loadMoreShorts = useCallback(() => {
    if (pagination?.shortsHasMore && !loadingMore) {
      const nextPage = pagination.shortsPage + 1;
      void fetchSuggestedContent(pagination.videosPage, nextPage, true);
    }
  }, [pagination, loadingMore, fetchSuggestedContent]);

  // Update arrow visibility for shorts horizontal scroll
  const updateArrows = useCallback(() => {
    const container = shortsContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft + container.offsetWidth < container.scrollWidth - 1
      );
    }
  }, []);

  useEffect(() => {
    const container = shortsContainerRef.current;
    if (container && shorts.length > 0) {
      updateArrows();
      container.addEventListener("scroll", updateArrows);
      window.addEventListener("resize", updateArrows);
      return () => {
        container.removeEventListener("scroll", updateArrows);
        window.removeEventListener("resize", updateArrows);
      };
    }
  }, [shorts.length, updateArrows]);

  const scrollShorts = (direction: 'left' | 'right') => {
    const container = shortsContainerRef.current;
    if (container) {
      const scrollAmount = container.offsetWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Loading skeleton
  const SuggestedVideoSkeleton = () => (
    <div className="flex gap-2 p-2 animate-pulse">
      <div className="w-40 h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );

  const ShortSkeleton = () => (
    <div className="flex-shrink-0 w-32 animate-pulse">
      <div className="aspect-[9/16] bg-gray-300 dark:bg-gray-700 rounded-lg mb-2"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-1"></div>
      <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className="text-center py-8">
      <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {error?.includes('Failed to fetch') || error?.includes('Network') 
          ? 'Unable to load suggested content. Please check your connection.'
          : 'Failed to load suggested content'
        }
      </p>
      <button
        onClick={() => fetchSuggestedContent(1, 1, false)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mx-auto"
      >
        <FiRefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {includeShorts && (
          <div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-3 animate-pulse"></div>
            <div className="flex gap-3 overflow-x-hidden">
              {[...Array(4)].map((_, i) => (
                <ShortSkeleton key={i} />
              ))}
            </div>
          </div>
        )}
        {includeVideos && (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <SuggestedVideoSkeleton key={i} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div className="space-y-6">
      {/* Shorts Section */}
      {includeShorts && shorts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Shorts
            </h3>
            {pagination?.shortsHasMore && (
              <button
                onClick={loadMoreShorts}
                disabled={loadingMore === 'shorts'}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                {loadingMore === 'shorts' ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
          <div className="relative">
            {showLeftArrow && (
              <button
                onClick={() => scrollShorts('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Scroll left"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            <div
              ref={shortsContainerRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {shorts.map((short) => (
                <ShortCard key={short.id} short={short} />
              ))}
            </div>

            {showRightArrow && (
              <button
                onClick={() => scrollShorts('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Scroll right"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {includeVideos && (
        <div className="space-y-4">
          {videos.length > 0 ? (
            <>
              {videos.map((vid) => (
                <SuggestedVideoCard key={vid.id} video={vid} />
              ))}
              
              {pagination?.videosHasMore && (
                <button
                  onClick={loadMoreVideos}
                  disabled={loadingMore === 'videos'}
                  className="w-full py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingMore === 'videos' ? 'Loading more videos...' : 'Load More Videos'}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No suggested videos available
              </p>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Short Card Component
function ShortCard({ short }: { short: SuggestedContent }) {
  type VideoWithExtras = SuggestedContent & {
    durationSeconds?: number;
    videoSrc?: string;
  };

  const hasVideoSrc = (v: SuggestedContent): v is VideoWithExtras =>
    'videoSrc' in v;

  const hasDurationSeconds = (v: SuggestedContent): v is VideoWithExtras =>
    'durationSeconds' in v;

  const durationSeconds = hasDurationSeconds(short) ? short.durationSeconds : undefined;

  return (
    <Link href={`/shorts/${short.id}`} className="flex-shrink-0 w-32">
      <div className="cursor-pointer group">
        <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
          {short.thumbnail && short.thumbnail.status === 'complete' ? (
            <HoverPreviewPlayer
              source={hasVideoSrc(short) ? (short.videoSrc ?? '') : ''}
              poster={getThumbnailSrc(short.thumbnail)}
              durationSeconds={durationSeconds}
              durationLabel={short.duration != null ? String(short.duration) : ''}
              className="w-full h-full"
              sizes="128px"
              rounded={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
              <div className="text-center p-2">
                <div className="w-8 h-8 mx-auto mb-1 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300">Processing</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {short.title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {short.views} views
          </p>
        </div>
      </div>
    </Link>
  );
}

// Video Card Component
function SuggestedVideoCard({ video }: { video: SuggestedContent }) {
  const isNew = (() => {
    const now = new Date();
    const published = new Date(video.age);
    const diffMs = now.getTime() - published.getTime();
    return diffMs < 24 * 60 * 60 * 1000;
  })();

  type VideoWithExtras = SuggestedContent & {
    durationSeconds?: number;
    videoSrc?: string;
  };

  const hasDurationSeconds = (v: SuggestedContent): v is VideoWithExtras =>
    'durationSeconds' in v;

  const hasVideoSrc = (v: SuggestedContent): v is VideoWithExtras =>
    'videoSrc' in v;

  const durationSeconds = hasDurationSeconds(video) ? video.durationSeconds : undefined;

  return (
    <Link href={`/watch/${video.id}`}>
      <div className="flex items-start gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded">
        <div className="relative w-40 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          {video.thumbnail ? (
            <HoverPreviewPlayer
              source={hasVideoSrc(video) ? (video.videoSrc ?? '') : ''}
              poster={getThumbnailSrc(video.thumbnail)}
              durationSeconds={durationSeconds}
              durationLabel={video.duration != null ? String(video.duration) : ''}
              className="w-full h-full"
              sizes="160px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300">No thumbnail</span>
              </div>
            </div>
          )}

          {isNew && (
            <div className="absolute top-1 right-1 text-white border border-red-500 text-xs px-2 py-0.5 rounded-full">
              New
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-white mb-1">
            {video.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
            {video.channelName}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <span>{video.views} views</span>
            <span>•</span>
            <span>{timeAgo(video.age)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
