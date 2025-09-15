import { FC, useRef, useState, useEffect, useCallback } from 'react';
import {
  FiFilter,
  FiX,
  FiThumbsUp,
  FiThumbsDown,
  FiShare2,
  FiSend,
  FiEdit3,
} from 'react-icons/fi';
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedImage from "@/components/Image";
import timeAgo from '@/app/utils/timeAgo';
import { getImageSrc } from '@/app/utils/imageUtils';

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    username: string;
    displayName?: string;
    profilePic: string | null;
  };
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  replies?: Comment[];
  repliesCount?: number;
}

interface CommentsSectionProps {
  shortId: string;
  commentsEnabled: boolean;
  onClose: () => void;
}

const CommentsSection: FC<CommentsSectionProps> = ({ shortId, commentsEnabled, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // now displayed in UI
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  
  // Edit functionality state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // Focus states for minimized forms
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isDesktopInputFocused, setIsDesktopInputFocused] = useState(false);
  
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Fetch comments for shorts
  const fetchComments = useCallback(async () => {
    if (!commentsEnabled) return;
     try {
       setLoading(true);
       setError(null);

       const response = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/api/comments/short/${shortId}`,
         { 
           method: 'GET',
           credentials: 'include',
           headers: { 'Accept': 'application/json' }
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

      const data: unknown = await response.json();
      const fetched = (data as { comments?: Comment[] })?.comments ?? [];
      setComments(fetched);
       
       // Fetch comments count
       try {
         const countResponse = await fetch(
           `${process.env.NEXT_PUBLIC_API_URL}/api/comments/short/${shortId}/count`,
           { 
             method: 'GET',
             credentials: 'include',
             headers: { 'Accept': 'application/json' }
           }
         );

         if (countResponse.ok) {
          const countData: unknown = await countResponse.json();
            setCommentsCount(
              (countData as { count?: number })?.count ??
              fetched.length
            );
         } else {
           setCommentsCount(fetched.length);
         }
       } catch {
        setCommentsCount(fetched.length);
       }

    } catch (err: unknown) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
       setComments([]);
       setCommentsCount(0);
     } finally {
       setLoading(false);
     }
  }, [shortId, commentsEnabled]);

  useEffect(() => {
    setIsVisible(true);
    if (commentsEnabled && shortId) {
      fetchComments();
    }
  }, [shortId, commentsEnabled, fetchComments]); // include fetchComments
 
  // Submit new comment
   const handleSubmitComment = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!newComment.trim() || !isAuthenticated || submitting) return;

     try {
       setSubmitting(true);
       setError(null);
       const response = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/api/comments/short/${shortId}`,
         {
           method: 'POST',
           credentials: 'include',
           headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json',
           },
           body: JSON.stringify({
             text: newComment.trim(),
             parentId: undefined,
           }),
         }
       );

       if (!response.ok) {
         const errorData: unknown = await response.json().catch(() => ({}));
         throw new Error((errorData as { message?: string })?.message || 'Failed to submit comment');
       }

      const data: unknown = await response.json();
      const created = (data as { comment?: Comment })?.comment;
      if (created) setComments(prev => [created, ...prev]);
       setCommentsCount(prev => prev + 1);
       setNewComment('');
       setIsInputFocused(false);
       setIsDesktopInputFocused(false);
     } catch (err: unknown) {
      console.error('Error submitting comment:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit comment';
      setError(message);
     } finally {
       setSubmitting(false);
     }
   };

  // Edit comment
  const handleEditComment = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  const handleEditSubmit = async (commentId: string) => {
     if (!editContent.trim() || submitting) return;
     try {
       setSubmitting(true);
       setError(null);
       const response = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/api/comments/short/comment/${commentId}`,
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
         const errorData: unknown = await response.json().catch(() => ({}));
         throw new Error((errorData as { message?: string })?.message || 'Failed to update comment');
       }
       setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editContent.trim() } : c));
       setEditingId(null);
       setEditContent('');
     } catch (err: unknown) {
      console.error('Error updating comment:', err);
      const message = err instanceof Error ? err.message : 'Failed to update comment';
      setError(message);
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
         `${process.env.NEXT_PUBLIC_API_URL}/api/comments/short/comment/${commentId}/like`,
         {
           method: 'POST',
           credentials: 'include',
           headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json',
           },
         }
       );
       if (!response.ok) throw new Error('Failed to like comment');
       setComments(prev => prev.map(c => c.id === commentId
         ? { ...c, isLiked: !c.isLiked, likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1 }
         : c));
     } catch (err: unknown) {
      console.error('Error liking comment:', err);
     }
   };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
     setConfirmDeleteId(null);
     try {
       const response = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/api/comments/short/comment/${commentId}`,
         {
           method: 'DELETE',
           credentials: 'include',
           headers: { 'Accept': 'application/json' }
         }
       );
       if (!response.ok) throw new Error('Failed to delete comment');
       setComments(prev => prev.filter(c => c.id !== commentId));
       setCommentsCount(prev => prev - 1);
     } catch (err: unknown) {
      console.error('Error deleting comment:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(message);
     }
   };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Comment item component to avoid duplication
  const CommentItem = ({ comment }: { comment: Comment }) => {
    const isOwn = user && comment.user.id === user.id;
    
    return (
      <div className="flex space-x-3 relative">
        <AuthenticatedImage
          mediaKey={getImageSrc(comment.user.profilePic, '480w') || ""}
          alt={comment.user.username}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full flex-shrink-0"
          fallbackSrc="/placeholder.png"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">
              {comment.user.displayName || comment.user.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo(comment.createdAt)}
            </span>
            {isOwn && (
              <span className="text-xs text-blue-500 font-semibold">(You)</span>
            )}
          </div>
          
          {editingId === comment.id ? (
            <div className="mt-2 space-y-2">
              <input
                ref={editInputRef}
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled={submitting}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSubmit(comment.id)}
                  disabled={!editContent.trim() || submitting}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {comment.content}
            </p>
          )}
          
          {editingId !== comment.id && (
            <div className="flex items-center space-x-4 mt-2">
              <button 
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center space-x-1 hover:text-blue-500 dark:hover:text-blue-400 ${
                  comment.isLiked ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                }`}
                disabled={!isAuthenticated}
              >
                <FiThumbsUp size={14} />
                <span className="text-xs">{comment.likeCount}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                <FiThumbsDown size={14} />
              </button>
              <button className="text-xs text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                Reply
              </button>
              {isOwn && (
                <>
                  <button 
                    onClick={() => handleEditComment(comment)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <FiEdit3 size={14} />
                    <span className="text-xs">Edit</span>
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(comment.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* Confirm delete popup */}
          {confirmDeleteId === comment.id && (
            <div className="absolute z-10 left-10 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-3">
              <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                Delete this comment?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 lg:hidden ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Comments Panel - Mobile Version (Bottom Sheet) */}
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
              {commentsCount}
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
         {error && (
           <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-300">
             {error}
           </div>
         )}
          {!commentsEnabled ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <FiX size={48} />
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
                Comments are turned off
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
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
          )}
        </div>

        {/* Mobile Comment input - Minimized */}
        {commentsEnabled && (
          <form onSubmit={handleSubmitComment} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="p-2">
              <div className="flex items-center space-x-2">
                <AuthenticatedImage
                  mediaKey={getImageSrc(user?.profilePic, '480w') || ""}
                  alt="User"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  fallbackSrc="/placeholder.png"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="Add a comment..."
                    className="w-full py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={!isAuthenticated || submitting}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newComment.trim() || !isAuthenticated || submitting}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FiSend size={16} />
                  )}
                </button>
              </div>
              {/* Expanded buttons when focused */}
              {isInputFocused && newComment.trim() && (
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewComment('');
                      setIsInputFocused(false);
                    }}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {submitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Desktop Comments Panel - Slides from Right */}
      <div className={`
        hidden lg:flex lg:flex-col
        fixed z-50 bg-white dark:bg-gray-900
        top-16 right-0 bottom-0 w-96
        border-l border-gray-200 dark:border-gray-700
        shadow-2xl
        transform transition-transform duration-300 ease-out
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        {/* Desktop Comments header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {commentsCount}
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

        {/* Desktop Comments list - scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
         {error && (
           <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-300">
             {error}
           </div>
         )}
          {!commentsEnabled ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <FiX size={48} />
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
                Comments are turned off
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
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
          )}
        </div>

        {/* Desktop Comment input - Minimized */}
        {commentsEnabled && (
          <form onSubmit={handleSubmitComment} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="p-3">
              <div className="flex items-center space-x-2">
                <AuthenticatedImage
                  mediaKey={getImageSrc(user?.profilePic, '480w') || ""}
                  alt="User"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  fallbackSrc="/placeholder.png"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onFocus={() => setIsDesktopInputFocused(true)}
                    onBlur={() => setIsDesktopInputFocused(false)}
                    placeholder="Add a comment..."
                    className="w-full py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={!isAuthenticated || submitting}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newComment.trim() || !isAuthenticated || submitting}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FiSend size={16} />
                  )}
                </button>
              </div>
              {/* Expanded buttons when focused */}
              {isDesktopInputFocused && newComment.trim() && (
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewComment('');
                      setIsDesktopInputFocused(false);
                    }}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {submitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default CommentsSection;