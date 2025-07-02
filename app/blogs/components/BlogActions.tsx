import { Blog } from "@/types";
import { useState, useEffect } from "react";
import { FiHeart, FiBookmark, FiFlag } from "react-icons/fi";
import { toast } from "sonner";

interface BlogActionsProps {
  blog: Blog;
}

export default function BlogActions({ blog }: BlogActionsProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(blog.likeCount || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Initialize state from blog data if user interaction data is available
  useEffect(() => {
    if (blog.userInteraction) {
      setLiked(blog.userInteraction.liked);
      setBookmarked(blog.userInteraction.bookmarked);
    }
  }, [blog.userInteraction]);

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const previousLiked = liked;
    const previousCount = likeCount;
    
    // Optimistic update
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blog.id}/like`, {
        method: 'POST',
        credentials: 'include', // For auth cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle like');
      }

      // Update with server response
      setLiked(data.data.liked);
      setLikeCount(data.data.likeCount);
      
      toast.success(data.message);
    } catch (error: any) {
      // Revert optimistic update on error
      setLiked(previousLiked);
      setLikeCount(previousCount);
      
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        toast.error('Please log in to like blogs');
        // Redirect to login or show login modal
      } else {
        toast.error(error.message || 'Failed to toggle like');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const previousBookmarked = bookmarked;
    
    // Optimistic update
    setBookmarked(!bookmarked);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blog.id}/bookmark`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName: 'default' // You can make this dynamic later
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle bookmark');
      }

      // Update with server response
      setBookmarked(data.data.bookmarked);
      
      toast.success(data.message);
    } catch (error: any) {
      // Revert optimistic update on error
      setBookmarked(previousBookmarked);
      
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        toast.error('Please log in to bookmark blogs');
      } else {
        toast.error(error.message || 'Failed to toggle bookmark');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = () => {
    setShowReport(true);
    setReportReason("");
    setReportDescription("");
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting.");
      return;
    }
    setReportSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blog.id}/report`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, description: reportDescription }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to report blog");
      toast.success(data.message || "Blog reported successfully.");
      setShowReport(false);
    } catch (error: any) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        toast.error('Please log in to report blogs');
      } else {
        toast.error(error.message || "Failed to report blog");
      }
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 relative">
      <button
        className={`flex items-center gap-1 transition-colors ${
          liked ? "text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-500"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleLike}
        disabled={isLoading}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <FiHeart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
        <span className="flex items-center gap-1">
          {liked ? "Liked" : "Like"}
          {likeCount > 0 && (
            <span className="text-sm text-gray-400">({likeCount})</span>
          )}
        </span>
      </button>
      
      <button
        className={`flex items-center gap-1 transition-colors ${
          bookmarked ? "text-yellow-500" : "text-gray-500 dark:text-gray-400 hover:text-yellow-500"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleBookmark}
        disabled={isLoading}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
      >
        <FiBookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
        <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
      </button>
      
      <button
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Report"
        onClick={handleReport}
      >
        <FiFlag className="w-5 h-5" />
        <span>Report</span>
      </button>

      {/* Report Popup */}
      {showReport && (
        <div className="absolute z-20 top-10 left-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80">
          <form onSubmit={submitReport} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Reason <span className="text-red-500">*</span></label>
              <input
                className="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                required
                disabled={reportSubmitting}
                placeholder="Spam, inappropriate, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description <span className="text-gray-400">(optional)</span></label>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={reportDescription}
                onChange={e => setReportDescription(e.target.value)}
                rows={3}
                disabled={reportSubmitting}
                placeholder="Add more details (optional)"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                onClick={() => setShowReport(false)}
                disabled={reportSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                disabled={reportSubmitting}
              >
                {reportSubmitting ? "Reporting..." : "Report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}