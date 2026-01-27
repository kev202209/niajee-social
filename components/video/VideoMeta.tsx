// components/VideoMeta.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Share2, 
  Download, 
  Save, 
  MoreHorizontal,
  Flag,
  EyeOff 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthRequiredModal from '@/components/modals/AuthRequiredModal';
import { mVideo as Video } from '../../types';
import timeAgo from '../../utils/timeAgo';
import Button from '../ui/CustomButton';
import LikeButton from '../LikeButton';
import ReportModal from '@/app/shorts/[v]/ReportModal';
import ShareModal from './ShareModal';
import { toast } from "sonner";
import useOutsideClick from '@/hooks/useOutsideClick';
import { formatCount } from '@/utils/formatUtils';
import ShareService from '@/utils/ShareService';
import AuthenticatedImage from "@/components/Image";
import { getImageSrc } from '@/utils/imageUtils';
import { GENERIC_ERROR_MESSAGE } from '@/utils/toastMessages'

interface VideoMetaProps {
  video: Video;
}

export default function VideoMeta({ video }: VideoMetaProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [descExpanded, setDescExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(video.channel.followerCount || 0);
  const [isFollowing, setIsFollowing] = useState(video.channel.isFollowed || false);
  const [likeCount, setLikeCount] = useState(video.likeCount);
  const [shareCount, setShareCount] = useState(video.shareCount || 0);
  const [saveCount, setSaveCount] = useState(video.saveCount || 0);
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  
  const [isSaved, setIsSaved] = useState(video.isSaved || false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalAction, setAuthModalAction] = useState<'like' | 'comment' | 'save' | 'share'>('like');
  
  const [loading, setLoading] = useState({
    save: false,
    download: false,
    notInterested: false
  });

  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Outside click handlers
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
    if (!isAuthenticated) {
      setAuthModalAction('like');
      setAuthModalOpen(true);
      return;
    }

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
      toast.error(GENERIC_ERROR_MESSAGE);
      setIsLiked(!liked);
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      setAuthModalAction('like');
      setAuthModalOpen(true);
      return;
    }

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
      
      setIsFollowing(data.isFollowed);
      
      if (data.isFollowed) {
        setFollowerCount(prev => prev + 1);
      } else {
        setFollowerCount(prev => Math.max(0, prev - 1));
      }

      toast.success(data.isFollowed ? 'Following channel' : 'Unfollowed channel');

    } catch (error) {
      console.error('Error toggling follow:', error);

      if (error instanceof Error) {
        if (error.message === 'Cannot subscribe to your own channel') {
          toast.error('You cannot follow your own channel');
        } else if (error.message === 'Channel not found') {
          toast.error('Channel not found');
        } else {
          toast.error(GENERIC_ERROR_MESSAGE);
        }
      } else {
        toast.error(GENERIC_ERROR_MESSAGE);
      }
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Handle save toggle
  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      setAuthModalAction('save');
      setAuthModalOpen(true);
      return;
    }

    if (loading.save) return;
    
    setLoading(prev => ({ ...prev, save: true }));
    const optimisticSave = !isSaved;
    setIsSaved(optimisticSave);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${video.id}/save`,
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
        throw new Error(errorData.message || 'Failed to toggle save');
      }

      const data = await response.json();
      setIsSaved(data.isSaved);
      
      // Update save count based on save status
      if (data.isSaved) {
        setSaveCount(prev => prev + 1);
      } else {
        setSaveCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success(data.isSaved ? 'Video saved' : 'Video removed from saved');
      
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
      setIsSaved(!optimisticSave);
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // Handle download
  const handleDownload = async () => {
    setLoading(prev => ({ ...prev, download: true }));
    
    try {
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
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setLoading(prev => ({ ...prev, download: false }));
    }
  };

  // Handle share with proper native share timing
  const handleShare = async () => {
    if (!isAuthenticated) {
      setAuthModalAction('share');
      setAuthModalOpen(true);
      return;
    }

    const result = await ShareService.share(
      video.id,
      video.title,
      'video'
    );

    if (result.success) {
      // Native share succeeded
      if (result.shareCount) {
        setShareCount(result.shareCount);
      } else {
        setShareCount(prev => prev + 1);
      }
      toast.success('Shared successfully!');
    } else if (result.rateLimited) {
      // Rate limited
      toast.error(`You've shared this video too many times. Please wait ${result.timeLeft} before sharing again.`);
    } else if (result.userCancelled) {
      // User cancelled native share, do nothing
    } else if (result.showFallback) {
      // Show fallback modal
      setShowShareModal(true);
    }
  };

  const handleShareComplete = (newCount?: number) => {
    if (newCount !== undefined) {
      setShareCount(newCount);
    } else {
      setShareCount(prev => prev + 1);
    }
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
      toast.error(GENERIC_ERROR_MESSAGE);
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
    setIsFollowing(video.channel.isFollowed || false);
  }, [video.channel.isFollowed]);

  return (
    <>
      <div className="space-y-4">
        {/* Video Title */}
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">{video.title}</h1>
        
        {/* Channel Info and Subscribe Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/channels/${video.channel.handle}`}>
              <AuthenticatedImage
                mediaKey={video.channel.avatar ? getImageSrc(video.channel.avatar, '480w') : ''}
                alt={video.channel.name}
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                fallbackSrc="/placeholder.png"
              />
            </Link>
            <div className="flex flex-col">
              <p className="font-semibold text-base sm:text-lg">{video.channel.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {followerCount === 0 ? '' : `${formatCount(followerCount)} ${followerCount === 1 ? 'subscriber' : 'subscribers'}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {video.needsMembership && (
              <Link href={`/channels/${video.channel.handle}/membership`}>
                <Button variant="outline" size="md" className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600">
                  Join Membership
                </Button>
              </Link>
            )}
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
              {isFollowLoading ? 'Loading...' : (isFollowing ? 'Subscribed' : 'Subscribe')}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center bg-inherit rounded-full px-4 py-2">
              <LikeButton
                isLiked={isLiked}
                onLike={handleLikeToggle}
                size={18}
                className="mr-2 text-gray-700 dark:text-gray-300"
              />
              <span className="text-sm font-medium pl-2">{formatCount(likeCount)}</span>
            </div>

            {/* Share Button */}
            <Button
              variant="secondary"
              size="md"
              onClick={handleShare}
              className="flex items-center gap-2 bg-inherit group"
            >
              <span className="transition-colors text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                <Share2 className="w-4 h-4" />
              </span>
              <span className="hidden xs:inline">Share</span>
              <span className="text-sm font-medium text-black dark:text-white">
                {formatCount(shareCount)}
              </span>
            </Button>

            {/* Download Button */}
            <Button
              variant="secondary"
              size="md"
              onClick={handleDownload}
              disabled={loading.download}
              className="bg-inherit group"
            >
              {loading.download ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <span className="transition-colors text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <Download className="w-4 h-4" />
                </span>
              )}
              <span className="hidden xs:inline">
                {loading.download ? 'Downloading...' : 'Download'}
              </span>
            </Button>
            
            {/* Save/Save Button */}
            <Button
              variant="secondary"
              size="md"
              onClick={handleSaveToggle}
              disabled={loading.save}
              className="flex items-center gap-2 bg-inherit group"
            >
              {loading.save ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <span className={`transition-colors ${isSaved ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                  <Save className="w-4 h-4" />
                </span>
              )}
              <span className="hidden xs:inline">
                {loading.save ? 'Saving...' : (isSaved ? 'Saved' : 'Save')}
              </span>
              <span className="text-sm font-medium text-black dark:text-white">
                {formatCount(saveCount)}
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
            <span>{formatCount(video.viewCount)} views</span>
            <span className="text-gray-500">•</span>
            <span>{timeAgo(video.createdAt)}</span>
            {video.category && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-blue-600 dark:text-blue-400">{video.category}</span>
              </>
            )}
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

          {/* Tags Section */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {video.tags.map((tag, index) => (
                <Link 
                  key={index} 
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionType={authModalAction}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        videoId={video.id}
        videoTitle={video.title}
        type="videos"
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoTitle={video.title}
        videoId={video.id}
        onShareComplete={handleShareComplete}
        contentType="video"
      />
    </>
  );
}