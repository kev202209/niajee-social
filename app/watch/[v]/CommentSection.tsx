"use client";

import { useState, useEffect } from "react";
import { FiThumbsUp, FiThumbsDown, FiMoreHorizontal, FiHeart, FiMessageCircle, FiSend, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Comment, CreateCommentDto } from '../../../types';
import { useAuth } from '@/contexts/AuthContext';
import TextAreaWithLimit from '@/components/ui/TextAreaWithLimit';

interface CommentsSectionProps {
  videoId: string;
  allowComments?: boolean;
}

export default function CommentsSection({ videoId, allowComments = true }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ✅ Early return if comments are not allowed
  if (!allowComments) {
    return (
      <div className="mt-8 p-6 text-center text-gray-600 dark:text-gray-400">
        <FiMessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Comments are not allowed for this video.</p>
      </div>
    );
  }

  // ✅ Updated fetch comments with new endpoints
  const fetchComments = async () => {
    if (!videoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ Updated endpoint: GET /api/comments/video/{videoId}
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/video/${videoId}`,
        { 
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Video not found or no comments
          setComments([]);
          setCommentsCount(0);
          return;
        }
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data = await response.json();
      setComments(data.comments || []);
      
      // ✅ Updated endpoint: GET /api/comments/video/{videoId}/count
      try {
        const countResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/comments/video/${videoId}/count`,
          { 
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        if (countResponse.ok) {
          const countData = await countResponse.json();
          setCommentsCount(countData.count || 0);
        } else {
          // Fallback to comments array length
          setCommentsCount(data.comments?.length || 0);
        }
      } catch (countError) {
        console.warn('Failed to fetch comment count, using array length');
        setCommentsCount(data.comments?.length || 0);
      }

    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
      setComments([]);
      setCommentsCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const commentData: CreateCommentDto = {
        text: newComment.trim(),    // ✅ Changed from 'content' to 'text'
        videoId,
        parentId: undefined,       // ✅ Explicitly set to undefined for root comments
      };

      console.log('Sending comment data:', commentData); // Debug log

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(commentData),
        }
      );

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Response error:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to submit comment');
      }

      const data = await response.json();
      console.log('Response data:', data); // Debug log

      // Add new comment to the list
      setComments(prev => [data.comment, ...prev]);
      setCommentsCount(prev => prev + 1);
      setNewComment('');
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setError(err.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !isAuthenticated || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const replyData: CreateCommentDto = {
        text: replyContent.trim(),  // ✅ Changed from 'content' to 'text'
        videoId,
        parentId,                   // ✅ Set the parent ID for replies
      };

      console.log('Sending reply data:', replyData); // Debug log

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(replyData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit reply');
      }

      const data = await response.json();

      // Add reply to the parent comment
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), data.comment],
            repliesCount: (comment.repliesCount || 0) + 1
          };
        }
        return comment;
      }));

      setReplyContent('');
      setReplyingTo(null);
      setCommentsCount(prev => prev + 1);
    } catch (err: any) {
      console.error('Error submitting reply:', err);
      setError(err.message || 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  // Like comment
  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}/like`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to like comment');
      }

      // Update comment like status
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1
          };
        }
        // Also check replies
        return {
          ...comment,
          replies: comment.replies?.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                isLiked: !reply.isLiked,
                likeCount: reply.isLiked ? reply.likeCount - 1 : reply.likeCount + 1
              };
            }
            return reply;
          })
        };
      }));
    } catch (err: any) {
      console.error('Error liking comment:', err);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated || !confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Remove comment from list
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setCommentsCount(prev => prev - 1);
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.message || 'Failed to delete comment');
    }
  };

  // Toggle replies visibility
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

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  };

  // Comment component
  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`flex gap-3 ${isReply ? 'ml-12' : ''}`}>
      <img
        src={comment.user.profilePic || '/default-avatar.png'}
        alt={comment.user.username}
        className="w-10 h-10 rounded-full flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/default-avatar.png';
        }}
      />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {comment.user.displayName || comment.user.username}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>
        
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
        
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => handleLikeComment(comment.id)}
            className={`flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors ${
              comment.isLiked ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
            }`}
            disabled={!isAuthenticated}
          >
            <FiThumbsUp className="w-4 h-4" />
            <span>{comment.likeCount || 0}</span>
          </button>
          
          <button
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
            disabled={!isAuthenticated}
          >
            <FiThumbsDown className="w-4 h-4" />
          </button>
          
          {!isReply && isAuthenticated && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
            >
              Reply
            </button>
          )}
          
          {comment.user.id === user?.id && (
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
            >
              Delete
            </button>
          )}
        </div>
        
        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="mt-3">
            <div className="flex gap-3">
              <img
                src={user?.profilePic || '/default-avatar.png'}
                alt="You"
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <TextAreaWithLimit
                  value={replyContent}
                  onChange={setReplyContent}
                  placeholder={`Reply to ${comment.user.displayName || comment.user.username}...`}
                  maxChars={500}
                  minRows={1}
                  maxRows={4}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim() || submitting}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Replying...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleReplies(comment.id)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {expandedReplies.has(comment.id) ? (
                <>
                  <FiChevronUp className="w-4 h-4" />
                  Hide {comment.replies.length} replies
                </>
              ) : (
                <>
                  <FiChevronDown className="w-4 h-4" />
                  Show {comment.replies.length} replies
                </>
              )}
            </button>
            
            {expandedReplies.has(comment.id) && (
              <div className="space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiMessageCircle className="w-5 h-5" />
          {commentsCount} Comments
        </h2>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="popular">Most popular</option>
        </select>
      </div>

      {/* Add comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex gap-3">
            <img
              src={user?.profilePic || '/default-avatar.png'}
              alt="You"
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <TextAreaWithLimit
                value={newComment}
                onChange={setNewComment}
                placeholder="Add a comment..."
                maxChars={500}
                minRows={1}
                maxRows={6}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="w-4 h-4" />
                  {submitting ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 border border-gray-300 dark:border-gray-600 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sign in to leave a comment
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="flex gap-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <FiMessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            No comments yet
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Be the first to share what you think!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}