import { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
} from 'lucide-react';

interface VideoActionsProps {
  onToggleComments: () => void;
  likeCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const VideoActions = ({ 
  onToggleComments, 
  likeCount = 123, 
  isLiked = false,
  isBookmarked = false 
}: VideoActionsProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

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
    <div className="flex flex-col items-center space-y-6">
      {/* Like Button */}
      <div className="flex flex-col items-center">
        <button 
          onClick={() => setLiked(!liked)}
          className={`p-3 rounded-full backdrop-blur-sm transition-all ${
            liked 
              ? 'bg-red-500 bg-opacity-90' 
              : 'bg-black bg-opacity-50 hover:bg-opacity-70'
          }`}
        >
          <ThumbsUp 
            size={24} 
            className={`${liked ? 'text-white fill-white' : 'text-white'}`} 
          />
        </button>
        <span className="text-xs mt-1 font-medium text-gray-900 dark:text-gray-100">
          {formatCount(likeCount + (liked && !isLiked ? 1 : 0))}
        </span>
      </div>

      {/* Dislike Button */}
      <div className="flex flex-col items-center">
        <button className="p-3 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all">
          <ThumbsDown size={24} className="text-white" />
        </button>
        <span className="text-xs mt-1 text-gray-900 dark:text-gray-100">Dislike</span>
      </div>

      {/* Comment Button */}
      <div className="flex flex-col items-center">
        <button 
          onClick={onToggleComments}
          className="p-3 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
        >
          <MessageCircle size={24} className="text-white" />
        </button>
        <span className="text-xs mt-1 text-gray-900 dark:text-gray-100">Comment</span>
      </div>

      {/* Bookmark Button */}
      <div className="flex flex-col items-center">
        <button 
          onClick={() => setBookmarked(!bookmarked)}
          className={`p-3 rounded-full backdrop-blur-sm transition-all ${
            bookmarked 
              ? 'bg-yellow-500 bg-opacity-90' 
              : 'bg-black bg-opacity-50 hover:bg-opacity-70'
          }`}
        >
          <Bookmark 
            size={24} 
            className={`${bookmarked ? 'text-white fill-white' : 'text-white'}`} 
          />
        </button>
        <span className="text-xs mt-1 text-gray-900 dark:text-gray-100">Save</span>
      </div>

      {/* Share Button */}
      <div className="relative flex flex-col items-center">
        <button 
          onClick={() => setShowShare(!showShare)} 
          className="p-3 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
        >
          <Share2 size={24} className="text-white" />
        </button>
        <span className="text-xs mt-1 text-gray-900 dark:text-gray-100">Share</span>
        
        {showShare && (
          <div className="absolute bottom-full mb-2 right-0 bg-black bg-opacity-90 backdrop-blur-sm rounded-lg p-3 min-w-48">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  readOnly 
                  value={window.location.href} 
                  className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs text-gray-900 dark:text-gray-100 flex-1"
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
          className="p-3 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
        >
          <MoreHorizontal size={24} className="text-white" />
        </button>
        
        {showMenu && (
          <div className="absolute bottom-full mb-2 right-0  bg-gray-100/60 dark:bg-black  backdrop-blur-sm rounded-lg p-2 min-w-48">
            <button className="w-full text-left px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm text-black dark:text-gray-100">
              Report
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm text-black dark:text-gray-100">
              Don't recommend channel
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm text-black dark:text-gray-100">
              Copy link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoActions;
