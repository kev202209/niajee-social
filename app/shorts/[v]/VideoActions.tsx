import { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  MoreHorizontal,
} from 'lucide-react';

interface VideoActionsProps {
  onToggleComments: () => void;
}

const VideoActions = ({ onToggleComments }: VideoActionsProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    // Vertical column; items are centered horizontally
    <div className="flex flex-col items-center space-y-4">
      {/* Like Button with count below */}
      <div className="flex flex-col items-center">
        <button className="p-2 bg-black bg-opacity-70 rounded-full">
          <ThumbsUp size={20} className="text-white" />
        </button>
        <span className="text-xs text-white mt-1">123</span>
      </div>
      {/* Dislike Button with label below */}
      <div className="flex flex-col items-center">
        <button className="p-2 bg-black bg-opacity-70 rounded-full">
          <ThumbsDown size={20} className="text-white" />
        </button>
        <span className="text-xs text-white mt-1">Dislike</span>
      </div>
      {/* Comment Button */}
      <div className="flex flex-col items-center">
        <button 
          onClick={onToggleComments} 
          className="p-2 bg-black bg-opacity-70 rounded-full"
        >
          <MessageCircle size={20} className="text-white" />
        </button>
      </div>
      {/* Share Button with popup */}
      <div className="relative flex flex-col items-center">
        <button 
          onClick={() => setShowShare(!showShare)} 
          className="p-2 bg-black bg-opacity-70 rounded-full"
        >
          <Share2 size={20} className="text-white" />
        </button>
        {showShare && (
          <div className="absolute bottom-full mb-2 right-0 bg-black bg-opacity-90 text-white text-sm rounded p-2 space-y-2">
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                readOnly 
                value={window.location.href} 
                className="bg-transparent border border-gray-500 rounded px-2 py-1 text-xs text-white"
              />
              <button onClick={handleCopy} className="text-blue-400 text-xs">Copy</button>
            </div>
          </div>
        )}
      </div>
      {/* More Button with menu */}
      <div className="relative flex flex-col items-center">
        <button 
          onClick={() => setShowMenu(!showMenu)} 
          className="p-2 bg-black bg-opacity-70 rounded-full"
        >
          <MoreHorizontal size={20} className="text-white" />
        </button>
        {showMenu && (
          <div className="absolute bottom-full mb-2 right-0 bg-black bg-opacity-90 text-white text-sm rounded p-2 space-y-1">
            <button className="w-full text-left">Report</button>
            <button className="w-full text-left">Don't recommend this channel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoActions;
