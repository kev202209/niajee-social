// components/VideoMeta.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FiThumbsUp, FiThumbsDown, FiShare, FiDownload, FiSave, FiMoreVertical } from 'react-icons/fi';
import { mVideo as Video } from '../../types';
import timeAgo from '../../app/utils/timeAgo';
import Button from '../ui/CustomButton';
import { toast } from "sonner";

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
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(video.channel.followerCount);
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

  // Check initial follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${video.channel.id}/follow-status`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [video.channel.id]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (isFollowLoading) return;

    try {
      setIsFollowLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${video.channel.id}/follow`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle follow');
      }

      const data = await response.json();
      
      // Update local state based on response
      setIsFollowing(data.isSubscribed);
      
      // Update follower count
      if (data.isSubscribed) {
        setFollowerCount(prev => prev + 1);
      } else {
        setFollowerCount(prev => Math.max(0, prev - 1));
      }

    } catch (error) {
      console.error('Error toggling follow:', error);

      if (error instanceof Error) {
        if (error.message === 'Cannot subscribe to your own channel') {
          toast.error('You cannot follow your own channel');
        } else if (error.message === 'Channel not found') {
          toast.error('Channel not found');
        } else {
          toast.error('Failed to update follow status. Please try again.');
        }
      } else {
        toast.error('Failed to update follow status. Please try again.');
      }
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Title */}
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">{video.title}</h1>
      
      {/* Channel Info and Subscribe Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <img 
            src={video.channel.avatar} 
            alt={video.channel.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <p className="font-semibold text-base sm:text-lg">{video.channel.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {followerCount === 0 ? '' : `${formatViewCount(followerCount)} ${followerCount === 1 ? 'follower' : 'followers'}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md">
            Membership
          </Button>
          <Button 
            variant={isFollowing ? "secondary" : "primary"} 
            size="md"
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
          >
            {isFollowLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-full transition-colors">
              <FiThumbsUp className="w-4 h-4" />
              <span>{formatViewCount(video.likeCount)}</span>
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-full transition-colors">
              <FiThumbsDown className="w-4 h-4" />
            </button>
          </div>
          
          <Button variant="secondary" size="md">
            <FiShare className="w-4 h-4" />
            <span className="hidden xs:inline">Share</span>
          </Button>
          
          <Button variant="secondary" size="md">
            <FiDownload className="w-4 h-4" />
            <span className="hidden xs:inline">Download</span>
          </Button>
          
          <Button variant="secondary" size="md">
            <FiSave className="w-4 h-4" />
            <span className="hidden xs:inline">Save</span>
          </Button>
        </div>
        
        <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <FiMoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Video Stats and Description */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
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