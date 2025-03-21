// components/CommentsSection.tsx
import { FC, useRef, useState } from 'react';
import {
  FiFilter,
  FiX,
  FiThumbsUp,
  FiThumbsDown,
  FiMoreHorizontal,
  FiArrowDown,
  FiShare2,
} from 'react-icons/fi';
import useOutsideClick from '@/hooks/useOutsideClick'; // adjust the path as needed

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
}

const CommentsSection: FC<CommentsSectionProps> = ({ comments, commentsEnabled }) => {
  const [isOpen, setIsOpen] = useState(true);
  const containerRef = useRef<HTMLElement>(null);

  // Call the custom hook: when a click outside of containerRef happens, close the section.
  useOutsideClick(containerRef, () => {
    setIsOpen(false);
  });

  // If the section is closed, render nothing
  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 p-4 overflow-y-auto absolute md:relative top-0 right-0 bottom-0 w-full md:w-1/3"
    >
      {/* Comments header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Comments</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">4k</span>
          <button className="p-1">
            <FiFilter />
          </button>
          <button className="p-1">
            <FiX />
          </button>
        </div>
      </div>
      <hr className="mb-4" />
      {/* Comments list */}
      {commentsEnabled ? (
        comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex">
                <img
                  src={comment.userIcon || "/placeholder.png"}
                  alt={comment.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="ml-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{comment.username}</span>
                    <span className="text-xs text-gray-500">{comment.age}</span>
                  </div>
                  <p>{comment.text}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <button className="flex items-center space-x-1">
                      <FiThumbsUp />
                      <span className="text-xs">{comment.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1">
                      <FiThumbsDown />
                      <span className="text-xs">Dislike</span>
                    </button>
                    <button className="text-xs">Reply</button>
                    <button className="p-1">
                      <FiMoreHorizontal />
                    </button>
                  </div>
                  {comment.repliesCount && (
                    <div className="flex items-center mt-1">
                      <button className="flex items-center space-x-1">
                        <FiArrowDown />
                        <span className="text-xs">
                          {comment.repliesCount} Replies
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No comments yet.</p>
        )
      ) : (
        <p className="text-center text-gray-500">Comments turned off.</p>
      )}
      <hr className="my-4" />
      {/* Comment input */}
      <div className="flex items-center">
        <img
          src={"/placeholder.png"}
          alt="User"
          className="w-8 h-8 rounded-full"
        />
        <input
          type="text"
          placeholder="Add a comment"
          className="flex-1 ml-2 border-b border-gray-300 focus:border-gray-500 outline-none"
        />
        <button className="ml-2 text-blue-500 disabled:opacity-50" disabled>
          Comment
        </button>
        <button className="ml-2 text-gray-500">Cancel</button>
      </div>
      {/* Share and More options */}
      <div className="flex items-center mt-4 space-x-4">
        <button className="flex items-center space-x-1">
          <FiShare2 />
          <span>Share</span>
        </button>
        <button className="p-1">
          <FiMoreHorizontal />
        </button>
      </div>
    </div>
  );
};

export default CommentsSection;
