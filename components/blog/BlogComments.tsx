import { useState, useRef } from "react";
import { BlogComment } from "@/types";
import { FiSend, FiMessageCircle, FiChevronDown, FiChevronUp, FiHeart } from "react-icons/fi";
import AuthenticatedImage from "@/components/Image"; 
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import timeAgo from '@/utils/timeAgo';
import { getImageSrc } from '@/utils/imageUtils';

interface BlogCommentsProps {
  blogId: string;
  comments: BlogComment[];
  loading?: boolean;
  onCommentAdded?: () => void;
}


export default function BlogComments({ blogId, comments, loading, onCommentAdded }: BlogCommentsProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blogId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to post comment");
      }

      setComment("");
      onCommentAdded?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleDelete = async (commentId: string) => {
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete comment");
      onCommentAdded?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to delete comment");
    }
  };

  const handleEdit = (comment: BlogComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/comments/${commentId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update comment");
      setEditingId(null);
      setEditContent("");
      onCommentAdded?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to update comment");
    }
  };

  const handleLike = async (commentId: string) => {
    setLikeLoading(commentId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/comments/${commentId}/like`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to like comment");
      onCommentAdded?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to like comment");
    } finally {
      setLikeLoading(null);
    }
  };

  // Skeleton loader for comments
  const Skeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Recursive comment item
  const CommentItem = ({ c, isReply = false }: { c: BlogComment; isReply?: boolean }) => {
    const isOwn = user && c.user?.id === user.id;
    return (
      <div className={`flex gap-2 sm:gap-3 ${isReply ? "ml-8 sm:ml-12" : ""} relative min-w-0`}>
        <AuthenticatedImage
          mediaKey={getImageSrc(c.user?.profilePic, '480w') || ""}
          alt={c.user?.displayName || c.user?.username || "User"}
          width={40}
          height={40}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
          fallbackSrc="/placeholder.png"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
              {c.user?.displayName || c.user?.username || "User"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{timeAgo(c.createdAt)}</span>
            {isOwn && (
              <span className="text-xs text-blue-500 font-semibold whitespace-nowrap">(You)</span>
            )}
          </div>
          {editingId === c.id ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleEditSubmit(c.id);
              }}
              className="flex flex-col sm:flex-row gap-2 mt-1"
            >
              <input
                ref={editInputRef}
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-0"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                disabled={submitting}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="text-blue-600 hover:underline text-sm px-2"
                  disabled={submitting}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="text-gray-500 hover:underline text-sm px-2"
                  onClick={() => setEditingId(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-words whitespace-pre-wrap">{c.content}</p>
          )}
          <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <button
              className={`flex items-center gap-1 ${likeLoading === c.id ? "opacity-50" : "hover:text-pink-600"}`}
              onClick={() => handleLike(c.id)}
              disabled={!user || likeLoading === c.id}
              aria-label="Like comment"
            >
              <FiHeart className={`w-3 h-3 sm:w-4 sm:h-4 ${likeLoading === c.id ? "animate-pulse" : ""}`} />
              <span className="text-xs">{c.likeCount}</span>
            </button>
            {isOwn && editingId !== c.id && (
              <>
                <button
                  className="text-blue-600 hover:underline text-xs"
                  onClick={() => handleEdit(c)}
                  disabled={submitting}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline text-xs"
                  onClick={() => setConfirmDeleteId(c.id)}
                  disabled={submitting}
                >
                  Delete
                </button>
                {/* Confirm popup - Mobile responsive */}
                {confirmDeleteId === c.id && (
                  <>
                    <div 
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
                      onClick={() => setConfirmDeleteId(null)}
                    />
                    <div className="fixed sm:absolute z-50 inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-20 sm:top-6 sm:translate-y-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-3 flex flex-col gap-2 max-w-xs">
                      <span className="text-sm text-gray-800 dark:text-gray-200">Delete this comment?</span>
                      <div className="flex gap-2 mt-1">
                        <button
                          className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                          onClick={() => handleDelete(c.id)}
                          disabled={submitting}
                        >
                          Yes, delete
                        </button>
                        <button
                          className="flex-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs"
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={submitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {c.replies && c.replies.length > 0 && (
              <button
                onClick={() => toggleReplies(c.id)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs whitespace-nowrap"
              >
                {expandedReplies.has(c.id) ? (
                  <>
                    <FiChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Hide {c.replies.length} replies</span>
                    <span className="xs:hidden">{c.replies.length}</span>
                  </>
                ) : (
                  <>
                    <FiChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Show {c.replies.length} replies</span>
                    <span className="xs:hidden">{c.replies.length}</span>
                  </>
                )}
              </button>
            )}
          </div>
          {c.replies && c.replies.length > 0 && expandedReplies.has(c.id) && (
            <div className="mt-2 space-y-4">
              {c.replies.map(reply => (
                <CommentItem key={reply.id} c={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <FiMessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
      </div>
      {/* Add comment form or login prompt */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-4 sm:mb-6 flex gap-2 sm:gap-3 items-start">
          <AuthenticatedImage
            mediaKey={getImageSrc(user?.profilePic, '480w') || ""}
            width={40}
            height={40}
            alt="You"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
            fallbackSrc="/placeholder.png"
          />
          <input
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-0"
            placeholder="Add a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 flex-shrink-0 text-sm"
            disabled={submitting || !comment.trim()}
          >
            <FiSend className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{submitting ? "Posting..." : "Post"}</span>
          </button>
        </form>
      ) : (
        <div className="mb-4 sm:mb-6 flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
          <FiSend className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>
            <Link href="/login" className="text-blue-600 hover:underline">Login</Link> to comment
          </span>
        </div>
      )}
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm mb-4 break-words">
          {error}
        </div>
      )}
      {/* Comments list or skeleton */}
      {loading ? (
        <Skeleton />
      ) : (
        <ul className="space-y-4 sm:space-y-6 w-full min-w-0">
          {comments.length === 0 && <li className="text-gray-500 dark:text-gray-400 text-sm">No comments yet.</li>}
          {comments.map((c) => (
            <li key={c.id}>
              <CommentItem c={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
