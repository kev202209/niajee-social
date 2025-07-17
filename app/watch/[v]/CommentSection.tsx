"use client";

import { useState, useEffect, useRef } from "react";
import { FiThumbsUp, FiThumbsDown, FiMoreHorizontal, FiHeart, FiMessageCircle, FiSend, FiChevronDown, FiChevronUp, FiEdit3 } from "react-icons/fi";
import { Comment, CreateCommentDto } from '../../../types';
import { useAuth } from '@/contexts/AuthContext';
import TextAreaWithLimit from '@/components/ui/TextAreaWithLimit';
import Image from 'next/image';

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
  
  // Edit functionality state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const editTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Early return if comments are not allowed
  if (!allowComments) {
    return (
      <div className="mt-8 p-6 text-center text-gray-600 dark:text-gray-400">
        <FiMessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Comments are not allowed for this video.</p>
      </div>
    );
  }

  // Fetch comments for videos
  const fetchComments = async () => {
    if (!videoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
          setComments([]);
          setCommentsCount(0);
          return;
        }
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data = await response.json();
      setComments(data.comments || []);
      
      // Fetch comments count
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
        text: newComment.trim(),
        parentId: undefined,
        videoId: videoId,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/video/${videoId}`,
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit comment');
      }

      const data = await response.json();
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
        text: replyContent.trim(),
        parentId,
        videoId: videoId,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/video/${videoId}`,
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

  // Edit comment
  const handleEditComment = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setTimeout(() => editTextAreaRef.current?.focus(), 100);
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/video/comment/${commentId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ text: editContent.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update comment');
      }

      const data = await response.json();

      // Update comment in the list
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: editContent.trim() };
        }
        // Also check replies
        return {
          ...comment,
          replies: comment.replies?.map(reply => {
            if (reply.id === commentId) {
              return { ...reply, content: editContent.trim() };
            }
            return reply;
          })
        };
      }));

      setEditingId(null);
      setEditContent('');
    } catch (err: any) {
      console.error('Error updating comment:', err);
      setError(err.message || 'Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  // Like comment
  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/video/comment/${commentId}/like`,
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
    setConfirmDeleteId(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/video/comment/${commentId}`,
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
  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isOwn = user && comment.user.id === user.id;
    
    return (
      <div className={`flex gap-3 ${isReply ? 'ml-12' : ''} relative`}>
        <Image
          src={comment.user.profilePic || '/placeholder.png'}
          alt={comment.user.username}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full flex-shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.png';
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
            {isOwn && (
              <span className="text-xs text-blue-500 font-semibold">(You)</span>
            )}
          </div>
          
          {editingId === comment.id ? (
            <div className="space-y-2">
              <TextAreaWithLimit
                ref={editTextAreaRef}
                value={editContent}
                onChange={setEditContent}
                placeholder="Edit your comment..."
                maxChars={500}
                minRows={2}
                maxRows={6}
                className="w-full"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSubmit(comment.id)}
                  disabled={!editContent.trim() || submitting}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
          
          {editingId !== comment.id && (
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
              
              {isOwn && (
                <>
                  <button
                    onClick={() => handleEditComment(comment)}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(comment.id)}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* Confirm delete popup */}
          {confirmDeleteId === comment.id && (
            <div className="absolute z-10 left-20 top-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
              <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                Are you sure you want to delete this comment?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <div className="flex gap-3">
                <Image
                  src={user?.profilePic || '/placeholder.png'}
                  alt="You"
                  width={32}
                  height={32}
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
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiMessageCircle className="w-5 h-5" />
          {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
          {commentsCount > 0 && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              ({comments.length} shown)
            </span>
          )}
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
            <Image
              src={user?.profilePic || '/placeholder.png'}
              alt="You"
              width={40}
              height={40}
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