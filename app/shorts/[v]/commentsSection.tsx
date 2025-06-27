// ./CommentsSection.tsx
import { FC, useRef, useState, useEffect } from 'react';
import {
  FiFilter,
  FiX,
  FiThumbsUp,
  FiThumbsDown,
  FiMoreHorizontal,
  FiArrowDown,
  FiShare2,
} from 'react-icons/fi';
import { useAuth } from "@/contexts/AuthContext"; // Add this import

interface Comment {
  id: number;
  username: string;
  userIcon: string | null;
  age: string;
  text: string;
  likes: string;
  repliesCount?: number;
}

interface CommentsSectionProps {
  comments: Comment[];
  commentsEnabled: boolean;
  onClose: () => void;
}

const CommentsSection: FC<CommentsSectionProps> = ({ comments, commentsEnabled, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth(); // Get the logged-in user

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Delay the actual close to allow animation to complete
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <>
      {/* Backdrop - only on mobile */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 lg:hidden ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Comments Panel - Mobile Version */}
      <div className={`
        fixed z-50 bg-white dark:bg-gray-900
        lg:hidden
        bottom-0 left-0 right-0 h-2/3
        rounded-t-2xl
        transform transition-transform duration-300 ease-out
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      `}>
        
        {/* Mobile drag indicator */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        {/* Comments header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {comments.length > 0 ? `${comments.length}` : '4k'}
            </span>
            <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <FiFilter size={18} />
            </button>
            <button 
              onClick={handleClose} 
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Comments list - scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {commentsEnabled ? (
            comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <img
                    src={comment.userIcon || "/placeholder.png"}
                    alt={comment.username}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {comment.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{comment.age}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {comment.text}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                        <FiThumbsUp size={14} />
                        <span className="text-xs">{comment.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                        <FiThumbsDown size={14} />
                      </button>
                      <button className="text-xs text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                        Reply
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <FiMoreHorizontal size={14} />
                      </button>
                    </div>
                    {comment.repliesCount && comment.repliesCount > 0 && (
                      <button className="flex items-center space-x-1 mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                        <FiArrowDown size={12} />
                        <span className="text-xs">
                          {comment.repliesCount} {comment.repliesCount === 1 ? 'Reply' : 'Replies'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <FiShare2 size={48} />
                </div>
                <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
                  No comments yet
                </p>
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Be the first to comment!
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <FiX size={48} />
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
                Comments are turned off
              </p>
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-1">
                The creator has disabled comments for this video
              </p>
            </div>
          )}
        </div>

        {/* Comment input - fixed at bottom */}
        {commentsEnabled && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-3">
              <img
                src={user?.profilePic || "/placeholder.png"}
                alt="User"
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">
                Post
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments Panel - Desktop Version */}
      <div className={`
        hidden lg:flex flex-col
        fixed z-50 bg-white dark:bg-gray-900
        top-16 right-0 bottom-0 w-96
        rounded-l-2xl
        transform transition-transform duration-300 ease-out
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        {/* Comments header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {comments.length > 0 ? `${comments.length}` : '4k'}
            </span>
            <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <FiFilter size={18} />
            </button>
            <button 
              onClick={handleClose} 
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Comments list - scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {commentsEnabled ? (
            comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <img
                    src={comment.userIcon || "/placeholder.png"}
                    alt={comment.username}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {comment.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{comment.age}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {comment.text}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                        <FiThumbsUp size={14} />
                        <span className="text-xs">{comment.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                        <FiThumbsDown size={14} />
                      </button>
                      <button className="text-xs text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                        Reply
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <FiMoreHorizontal size={14} />
                      </button>
                    </div>
                    {comment.repliesCount && comment.repliesCount > 0 && (
                      <button className="flex items-center space-x-1 mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                        <FiArrowDown size={12} />
                        <span className="text-xs">
                          {comment.repliesCount} {comment.repliesCount === 1 ? 'Reply' : 'Replies'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <FiShare2 size={48} />
                </div>
                <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
                  No comments yet
                </p>
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Be the first to comment!
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <FiX size={48} />
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
                Comments are turned off
              </p>
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-1">
                The creator has disabled comments for this video
              </p>
            </div>
          )}
        </div>

        {/* Comment input - fixed at bottom */}
        {commentsEnabled && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-3">
              <img
                src={user?.profilePic || "/placeholder.png"}
                alt="User"
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CommentsSection;
