import { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  Plus,
} from 'lucide-react';

interface VideoActionsProps {
  onToggleComments: () => void;
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
  onToggleComments, 
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
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [following, setFollowing] = useState(isFollowing);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
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
              onClick={() => setFollowing(true)}
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Plus size={14} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Like Button with Heart */}
      <div className="flex flex-col items-center">
        <button 
          onClick={() => setLiked(!liked)}
          className={`p-3 rounded-full backdrop-blur-sm transition-all ${
            liked 
              ? 'bg-red-500/20' 
              : 'hover:bg-black/20'
          }`}
        >
          <Heart 
            size={26} 
            className={`${
              liked 
                ? 'text-red-500 fill-red-500' 
                : 'text-white hover:text-red-400'
            } transition-colors`} 
          />
        </button>
        <span className="text-xs mt-1 font-medium text-white">
          {formatCount(likeCount + (liked && !isLiked ? 1 : 0))}
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
          onClick={() => setBookmarked(!bookmarked)}
          className={`p-3 rounded-full backdrop-blur-sm transition-all ${
            bookmarked 
              ? 'bg-yellow-500/20' 
              : 'hover:bg-black/20'
          }`}
        >
          <Bookmark 
            size={26} 
            className={`${
              bookmarked 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-white hover:text-yellow-400'
            } transition-colors`} 
          />
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
          <div className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-3 min-w-48 z-50">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  readOnly 
                  value={window.location.href} 
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white flex-1"
                />
                <button 
                  onClick={handleCopy} 
                  className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs transition-colors text-white"
                >
                  Copy
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
          <div className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-48 z-50">
            <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm text-white">
              Report
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm text-white">
              Not Interested
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm text-white">
              Copy link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoActions;
