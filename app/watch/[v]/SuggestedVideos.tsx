"use client";

import { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiClock, FiPlusCircle } from "react-icons/fi";
import { SuggestedVideo } from "../../../types";
import Link from "next/link";
import timeAgo from "@/app/utils/timeAgo";

export default function SuggestedVideos({ suggestedVideos }: { suggestedVideos: SuggestedVideo[] }) {
  const [tags] = useState([
    "All",
    "Music",
    "For You",
    "Related",
    "Politics",
    "Entertainment",
    "Sports",
    "News",
    "Gaming",
  ]);
  const visibleCount = 3;
  const [viewportWidth, setViewportWidth] = useState<number>(0);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const tagRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // On mount, measure the widths of the first three buttons plus gap.
  useEffect(() => {
    const gap = 8; // Tailwind's space-x-2 ~8px gap
    const widths = tagRefs.current.map(el => (el ? el.getBoundingClientRect().width : 0));
    let total = 0;
    for (let i = 0; i < visibleCount; i++) {
      if (widths[i] !== undefined) {
        total += widths[i];
        if (i < visibleCount - 1) total += gap;
      }
    }
    setViewportWidth(total);
  }, [tags]);

  // Update arrow visibility based on container scroll position.
  const updateArrows = () => {
    const container = containerRef.current;
    if (container) {
      setShowLeft(container.scrollLeft > 0);
      setShowRight(container.scrollLeft + container.offsetWidth < container.scrollWidth);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      updateArrows();
      container.addEventListener("scroll", updateArrows);
      window.addEventListener("resize", updateArrows);
      return () => {
        container.removeEventListener("scroll", updateArrows);
        window.removeEventListener("resize", updateArrows);
      };
    }
  }, []);

  const handleLeftClick = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -viewportWidth, behavior: "smooth" });
    }
  };

  const handleRightClick = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: viewportWidth, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="relative mb-4">
        {showLeft && (
          <button
            onClick={handleLeftClick}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="mx-auto" style={{ width: viewportWidth }}>
          <div
            ref={containerRef}
            className="relative overflow-x-auto overflow-y-hidden"
            style={{
              width: 250,
              scrollbarWidth: "none", // For Firefox
              msOverflowStyle: "none", // For IE and Edge
            }}
          >
            <div className="flex space-x-2 transition-all duration-500">
              {tags.map((tag, idx) => (
                <button
                  key={idx}
                  ref={(el) => {
                    tagRefs.current[idx] = el;
                  }}
                  className="min-w-max px-4 py-2 bg-gray-300 dark:bg-gray-800 rounded-full text-center transition-transform hover:translate-y-0.5 whitespace-nowrap m-5"
                >
                  {tag}
                </button>
              ))}
            </div>
            {/* Internal border shadows */}
            {/* <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-gray-300 dark:from-gray-800 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gray-300 dark:from-gray-800 to-transparent" /> */}
          </div>
        </div>
        {showRight && (
          <button
            onClick={handleRightClick}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="space-y-4">
        {suggestedVideos.map((vid) => (
          <SuggestedVideoCard key={vid.id} video={vid} />
        ))}
      </div>
      <style jsx global>{`
        .overflow-x-auto::-webkit-scrollbar,
        .overflow-y-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}

function SuggestedVideoCard({ video }: { video: SuggestedVideo }) {
  const [hover, setHover] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isNew = (() => {
    const now = new Date();
    const published = new Date(video.age);
    const diffMs = now.getTime() - published.getTime();
    return diffMs < 24 * 60 * 60 * 1000; // less than 1 day
  })();

  return (
    <Link href={`/watch/${video.id}`}>
      <div
        className="flex items-start gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="relative w-40 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          {video.thumbnailUrl && !imageError ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="object-cover w-full h-full"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            // Fallback when no thumbnail or image fails to load
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

          {/* Duration badge */}
          {video.duration && (
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
              {video.duration}
            </div>
          )}

          {/* New badge */}
          {isNew && (
            <div className="absolute top-1 right-1 text-white border border-red-500 text-xs px-2 py-0.5 rounded-full">
              New
            </div>
          )}

          {/* Hover overlay */}
          {hover && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black bg-opacity-50 transition-opacity">
              <button className="text-white p-1.5 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition">
                <FiClock className="w-4 h-4" />
              </button>
              <button className="text-white p-1.5 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition">
                <FiPlusCircle className="w-4 h-4" />
              </button>
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
