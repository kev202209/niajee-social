import { useState, useRef } from 'react';
import {
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  Plus,
  Flag,
  EyeOff,
  Copy,
  Facebook,
  Twitter,
  Mail,
  Link,
} from 'lucide-react';
import LikeButton from "@/components/LikeButton";
import { toast } from "sonner";
import useOutsideClick from "@/hooks/useOutsideClick";

interface VideoActionsProps {
  videoId: string;
  channelId: string;
  onToggleComments: () => void;
  onShowReport: () => void; // Add this prop
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isFollowing?: boolean;
  channel: {
    name: string;
    icon: string;
    verified?: boolean;
  };
}

const VideoActions = ({ 
  videoId,
  channelId,
  onToggleComments,
  onShowReport, // Add this prop
  likeCount = 123,
  commentCount = 45,
  isLiked = false,
  isBookmarked = false,
  isFollowing = false,
  channel
}: VideoActionsProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState({
    like: false,
    bookmark: false,
    follow: false,
    notInterested: false
  });

  // Refs for outside click handling
  const menuRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  // Outside click handlers
  useOutsideClick(menuRef, () => setShowMenu(false));
  useOutsideClick(shareRef, () => setShowShare(false));

  // Handle report
  const handleReport = () => {
    setShowMenu(false);
    onShowReport(); // Call the parent function
  };

  // Handle like toggle
  const handleLikeToggle = async (newLiked: boolean) => {
    setLoading(prev => ({ ...prev, like: true }));
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoId}/like`,
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
      
      setLiked(data.isLiked);
      setCurrentLikeCount(data.likeCount);
      
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status. Please try again.');
      setLiked(!newLiked);
    } finally {
      setLoading(prev => ({ ...prev, like: false }));
    }
  };

  // Handle follow toggle
  const handleFollowToggle = async () => {
    if (loading.follow) return;
    
    setLoading(prev => ({ ...prev, follow: true }));
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/follow`,
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
      setFollowing(data.isSubscribed);
      
      toast.success(data.isSubscribed ? 'Following channel' : 'Unfollowed channel');
      
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, follow: false }));
    }
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (loading.bookmark) return;
    
    setLoading(prev => ({ ...prev, bookmark: true }));
    const optimisticBookmark = !bookmarked;
    setBookmarked(optimisticBookmark);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoId}/bookmark`,
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
      setBookmarked(data.isBookmarked);
      
      toast.success(data.isBookmarked ? 'Video saved' : 'Video removed from saved');
      
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark status. Please try again.');
      setBookmarked(!optimisticBookmark);
    } finally {
      setLoading(prev => ({ ...prev, bookmark: false }));
    }
  };

  // Handle not interested
  const handleNotInterested = async () => {
    if (loading.notInterested) return;
    
    setLoading(prev => ({ ...prev, notInterested: true }));
    setShowMenu(false);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoId}/not-interested`,
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this video: ${channel.name}`);
    
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

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Channel Avatar with Follow Button */}
      <div className="relative flex flex-col items-center">
        <div className="relative">
          <img
            src={channel.icon || "/placeholder.png"}
            alt={channel.name}
            className="w-12 h-12 rounded-full border-2 border-white object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.png';
            }}
          />
          {/* Follow/Unfollow Button */}
          {!following && (
            <button
              onClick={handleFollowToggle}
              disabled={loading.follow}
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading.follow ? (
                <div className="w-3 h-3 animate-spin rounded-full border border-white border-t-transparent"></div>
              ) : (
                <Plus size={14} className="text-white" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Like Button with Animation */}
      <div className="flex flex-col items-center">
        <div className="p-3 rounded-full hover:bg-black/20 transition-all">
          <LikeButton 
            isLiked={liked}
            onLike={handleLikeToggle}
            size={26}
          />
        </div>
        <span className="text-xs mt-1 font-medium text-white">
          {formatCount(currentLikeCount)}
        </span>
      </div>

      {/* Comment Button with Count */}
      <div className="flex flex-col items-center">
        <button 
          onClick={onToggleComments}
          className="p-3 rounded-full hover:bg-black/20 transition-all"
        >
          <MessageCircle size={26} className="text-white" />
        </button>
        <span className="text-xs mt-1 font-medium text-white">
          {formatCount(commentCount)}
        </span>
      </div>

      {/* Bookmark Button */}
      <div className="flex flex-col items-center">
        <button 
          onClick={handleBookmarkToggle}
          disabled={loading.bookmark}
          className={`p-3 rounded-full backdrop-blur-sm transition-all ${
            bookmarked 
              ? 'bg-yellow-500/20' 
              : 'hover:bg-black/20'
          }`}
        >
          {loading.bookmark ? (
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <Bookmark 
              size={26} 
              className={`${
                bookmarked 
                  ? 'text-yellow-500 fill-yellow-500' 
                  : 'text-white hover:text-yellow-400'
              } transition-colors`} 
            />
          )}
        </button>
        <span className="text-xs mt-1 font-medium text-white">Save</span>
      </div>

      {/* Share Button */}
      <div className="relative flex flex-col items-center">
        <button 
          onClick={() => setShowShare(!showShare)} 
          className="p-3 rounded-full hover:bg-black/20 transition-all"
        >
          <Share2 size={26} className="text-white" />
        </button>
        <span className="text-xs mt-1 font-medium text-white">Share</span>
        
        {showShare && (
          <div 
            ref={shareRef}
            className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-64 z-50 border border-gray-600"
          >
            <h3 className="text-white font-medium mb-3">Share this video</h3>
            <div className="space-y-3">
              {/* Quick copy link */}
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  readOnly 
                  value={window.location.href} 
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white flex-1 truncate"
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
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm text-white flex items-center gap-2"
                >
                  <Facebook size={16} className="text-blue-500" />
                  Share on Facebook
                </button>
                <button 
                  onClick={() => handleShare('twitter')}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm text-white flex items-center gap-2"
                >
                  <Twitter size={16} className="text-blue-400" />
                  Share on Twitter
                </button>
                <button 
                  onClick={() => handleShare('email')}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm text-white flex items-center gap-2"
                >
                  <Mail size={16} className="text-gray-400" />
                  Share via Email
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm text-white flex items-center gap-2"
                >
                  <Link size={16} className="text-gray-400" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* More Button */}
      <div className="relative flex flex-col items-center">
        <button 
          onClick={() => setShowMenu(!showMenu)} 
          className="p-3 rounded-full hover:bg-black/20 transition-all"
        >
          <MoreHorizontal size={26} className="text-white" />
        </button>
        
        {showMenu && (
          <div 
            ref={menuRef}
            className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-48 z-50 border border-gray-600"
          >
            <button 
              onClick={handleReport}
              className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm text-white flex items-center gap-2"
            >
              <Flag size={16} />
              Report
            </button>
            <button 
              onClick={handleNotInterested}
              disabled={loading.notInterested}
              className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm text-white flex items-center gap-2 disabled:opacity-50"
            >
              <EyeOff size={16} />
              {loading.notInterested ? 'Processing...' : 'Not Interested'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoActions;