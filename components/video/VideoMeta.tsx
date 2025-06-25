// components/VideoMeta.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FiThumbsUp, FiThumbsDown, FiShare, FiDownload, FiSave, FiMoreVertical } from 'react-icons/fi';
import { mVideo as Video } from '../../types';
import timeAgo from '../../app/utils/timeAgo';

interface VideoMetaProps {
  video: Video;
}

// Format view count helper
const formatViewCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default function VideoMeta({ video }: VideoMetaProps) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Check if description content overflows
  useEffect(() => {
    const checkOverflow = () => {
      if (descriptionRef.current) {
        const element = descriptionRef.current;
        // Temporarily remove line-clamp to get full height
        element.style.webkitLineClamp = 'unset';
        element.style.display = 'block';
        
        const fullHeight = element.scrollHeight;
        
        // Restore line-clamp
        element.style.webkitLineClamp = '3';
        element.style.display = '-webkit-box';
        
        const clampedHeight = element.offsetHeight;
        
        setShouldShowMore(fullHeight > clampedHeight);
      }
    };

    if (video.description) {
      setTimeout(checkOverflow, 0);
    }
  }, [video.description]);

  return (
    <div className="space-y-4">
      {/* Video Title */}
      <h1 className="text-2xl font-bold leading-tight">{video.title}</h1>
      
      {/* Channel Info and Subscribe Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={video.channel.avatar} 
            alt={video.channel.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <p className="font-semibold text-base">{video.channel.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {/* Add subscriber count if available */}
              {video.channelSubscribers ? `${formatViewCount(video.channelSubscribers)} subscribers` : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Join
          </button>
          <button className="px-6 py-2 text-sm font-medium bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-full transition-colors">
              <FiThumbsUp className="w-4 h-4" />
              <span>{formatViewCount(video.likeCount)}</span>
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-full transition-colors">
              <FiThumbsDown className="w-4 h-4" />
            </button>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <FiShare className="w-4 h-4" />
            <span>Share</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <FiDownload className="w-4 h-4" />
            <span>Download</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <FiSave className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
        
        <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <FiMoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Video Stats and Description */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>{formatViewCount(video.viewCount)} views</span>
          <span className="text-gray-500">•</span>
          <span>{timeAgo(video.createdAt)}</span>
        </div>
        
        <div className="text-sm leading-relaxed">
          <p 
            ref={descriptionRef}
            className={`whitespace-pre-wrap ${!descExpanded ? "line-clamp-3" : ""}`}
          >
            {video.description}
          </p>
          {shouldShowMore && (
            <button
              onClick={() => setDescExpanded(prev => !prev)}
              className="text-blue-600 dark:text-blue-400 font-medium mt-2 hover:underline"
            >
              {descExpanded ? "Show less" : "...more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}