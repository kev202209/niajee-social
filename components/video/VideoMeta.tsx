// components/VideoMeta.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Share2, 
  Download, 
  Bookmark, 
  MoreHorizontal,
  Copy,
  Facebook,
  Twitter,
  Mail,
  Link,
  Flag,
  EyeOff 
} from 'lucide-react';
import { mVideo as Video } from '../../types';
import timeAgo from '../../app/utils/timeAgo';
import Button from '../ui/CustomButton';
import LikeButton from '../LikeButton';
import ReportModal from '@/app/shorts/[v]/ReportModal'; // Import the report modal
import { toast } from "sonner";
import useOutsideClick from '@/hooks/useOutsideClick';

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
  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(undefined);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(video.channel.followerCount);
  const [likeCount, setLikeCount] = useState(video.likeCount);
  const [isLiked, setIsLiked] = useState(false);
  
  // New states for additional functionality
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState({
    bookmark: false,
    download: false,
    notInterested: false
  });

  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Outside click handlers
  useOutsideClick(shareRef, () => setShowShare(false));
  useOutsideClick(moreMenuRef, () => setShowMoreMenu(false));

  // Check if description content overflows
  useEffect(() => {
    const checkOverflow = () => {
      if (descriptionRef.current) {
        const element = descriptionRef.current;
        element.style.webkitLineClamp = 'unset';
        element.style.display = 'block';
        
        const fullHeight = element.scrollHeight;
        
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

  // Handle like toggle
  const handleLikeToggle = async (liked: boolean) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${video.id}/like`,
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
        throw new Error(errorData.message || 'Failed to toggle like');
      }

      const data = await response.json();
      
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);

    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status. Please try again.');
      setIsLiked(!liked);
    }
  };

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
      
      setIsFollowing(data.isSubscribed);
      
      if (data.isSubscribed) {
        setFollowerCount(prev => prev + 1);
      } else {
        setFollowerCount(prev => Math.max(0, prev - 1));
      }

      toast.success(data.isSubscribed ? 'Following channel' : 'Unfollowed channel');

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

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (loading.bookmark) return;
    
    setLoading(prev => ({ ...prev, bookmark: true }));
    const optimisticBookmark = !isBookmarked;
    setIsBookmarked(optimisticBookmark);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${video.id}/bookmark`,
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
        throw new Error(errorData.message || 'Failed to toggle bookmark');
      }

      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
      
      toast.success(data.isBookmarked ? 'Video saved' : 'Video removed from saved');
      
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark status. Please try again.');
      setIsBookmarked(!optimisticBookmark);
    } finally {
      setLoading(prev => ({ ...prev, bookmark: false }));
    }
  };

  // Handle download
  const handleDownload = async () => {
    setLoading(prev => ({ ...prev, download: true }));
    
    try {
      // You might want to get the download URL from your API
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${video.id}/download`;
      
      const response = await fetch(downloadUrl, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download video');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Download started');
      
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error('Failed to download video. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, download: false }));
    }
  };

  // Handle share
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
    setShowShare(false);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this video: ${video.title}`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${text}&body=${url}`;
        break;
      default:
        return;
    }
    
    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    
    setShowShare(false);
  };

  // Handle not interested
  const handleNotInterested = async () => {
    if (loading.notInterested) return;
    
    setLoading(prev => ({ ...prev, notInterested: true }));
    setShowMoreMenu(false);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${video.id}/not-interested`,
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
        throw new Error(errorData.message || 'Failed to mark as not interested');
      }

      toast.success('We\'ll show you fewer videos like this');
      
    } catch (error) {
      console.error('Error marking as not interested:', error);
      toast.error('Failed to update preferences. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, notInterested: false }));
    }
  };

  // Handle report
  const handleReport = () => {
    setShowMoreMenu(false);
    setShowReport(true);
  };

  useEffect(() => {
    setIsFollowing(!!video.channel.isSubscribed);
  }, [video.channel.isSubscribed]);

  return (
    <>
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
              variant={isFollowing ? undefined : "primary"}
              size="md"
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className={
                isFollowing
                  ? "relative bg-gradient-animation dark:bg-gradient-animation-dark text-white border-0 shadow font-semibold"
                  : ""
              }
            >
              {isFollowLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden px-4 py-2">
              <LikeButton
                isLiked={isLiked}
                onLike={handleLikeToggle}
                size={18}
                className="mr-2"
              />
              <span className="text-sm font-medium pl-2">{formatViewCount(likeCount)}</span>
            </div>
            
            {/* Share Button */}
            <div className="relative">
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => setShowShare(!showShare)}
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden xs:inline">Share</span>
              </Button>
              
              {showShare && (
                <div 
                  ref={shareRef}
                  className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-64 z-50"
                >
                  <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Share this video</h3>
                  <div className="space-y-3">
                    {/* Quick copy link */}
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={window.location.href} 
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs text-gray-900 dark:text-white flex-1 truncate"
                      />
                      <button 
                        onClick={handleCopyLink} 
                        className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs transition-colors text-white flex items-center gap-1"
                      >
                        <Copy size={12} />
                        Copy
                      </button>
                    </div>
                    
                    {/* Share buttons */}
                    <div className="flex flex-col space-y-1">
                      <button 
                        onClick={() => handleShare('facebook')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-900 dark:text-white flex items-center gap-2"
                      >
                        <Facebook size={16} className="text-blue-500" />
                        Share on Facebook
                      </button>
                      <button 
                        onClick={() => handleShare('twitter')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-900 dark:text-white flex items-center gap-2"
                      >
                        <Twitter size={16} className="text-blue-400" />
                        Share on Twitter
                      </button>
                      <button 
                        onClick={() => handleShare('email')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-900 dark:text-white flex items-center gap-2"
                      >
                        <Mail size={16} className="text-gray-400" />
                        Share via Email
                      </button>
                      <button 
                        onClick={handleCopyLink}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-900 dark:text-white flex items-center gap-2"
                      >
                        <Link size={16} className="text-gray-400" />
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Download Button */}
            <Button 
              variant="secondary" 
              size="md"
              onClick={handleDownload}
              disabled={loading.download}
            >
              {loading.download ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden xs:inline">
                {loading.download ? 'Downloading...' : 'Download'}
              </span>
            </Button>
            
            {/* Save/Bookmark Button */}
            <Button 
              variant="secondary" 
              size="md"
              onClick={handleBookmarkToggle}
              disabled={loading.bookmark}
              className={isBookmarked ? 'text-yellow-600 dark:text-yellow-400' : ''}
            >
              {loading.bookmark ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <Bookmark 
                  className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} 
                />
              )}
              <span className="hidden xs:inline">
                {loading.bookmark ? 'Saving...' : (isBookmarked ? 'Saved' : 'Save')}
              </span>
            </Button>
          </div>
          
          {/* More Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showMoreMenu && (
              <div 
                ref={moreMenuRef}
                className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-48 z-50"
              >
                <button 
                  onClick={handleReport}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-900 dark:text-white flex items-center gap-2"
                >
                  <Flag size={16} />
                  Report
                </button>
                <button 
                  onClick={handleNotInterested}
                  disabled={loading.notInterested}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-900 dark:text-white flex items-center gap-2 disabled:opacity-50"
                >
                  <EyeOff size={16} />
                  {loading.notInterested ? 'Processing...' : 'Not Interested'}
                </button>
              </div>
            )}
          </div>
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

      {/* Report Modal */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        videoId={video.id}
        videoTitle={video.title}
        type="videos" // Add this prop
      />
    </>
  );
}