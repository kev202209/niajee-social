"use client"; // Client Component for interactivity

import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import { Comment } from '../../../types'

export default function CommentsSection({ comments }: { comments: Comment[] }) {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold">Comments</h2>
      {comments.length === 0 ? (
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          No comments or comments are turned off for this video.
        </p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <img
              src={comment.avatar}
              alt={comment.username}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{comment.username}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {comment.age}
                </span>
              </div>
              <p className="text-sm line-clamp-2">{comment.text}</p>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <button className="flex items-center gap-1">
                  <FiThumbsUp className="w-4 h-4" />
                  <span>{comment.likes}</span>
                </button>
                <button className="flex items-center gap-1">
                  <FiThumbsDown className="w-4 h-4" />
                </button>
                <button>Reply</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}