import { Blog } from "@/types";
import { useState, useEffect } from "react";
import { FiHeart, FiBookmark, FiFlag } from "react-icons/fi";
import { toast } from "sonner";

interface BlogActionsProps {
  blog: Blog;
}

export default function BlogActions({ blog }: BlogActionsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
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
      setSaved(blog.userInteraction.saved);
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
        throw new Error(data?.message || 'Failed to toggle like');
      }

      // Update with server response
      setLiked(data.data.liked);
      setLikeCount(data.data.likeCount);
      
      toast.success(data.message);
    } catch (err: unknown) {
      // Revert optimistic update on error
      setLiked(previousLiked);
      setLikeCount(previousCount);

      const message = err instanceof Error ? err.message : String(err);

      if (message.includes('401') || /unauthor/i.test(message)) {
        toast.error('Please log in to like blogs');
        // Redirect to login or show login modal
      } else {
        toast.error(message || 'Failed to toggle like');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const previousSaved = saved;
    
    // Optimistic update
    setSaved(!saved);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blog.id}/save`, {
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
        throw new Error(data?.message || 'Failed to toggle save');
      }

      // Update with server response
      setSaved(data.data.saved);
      
      toast.success(data.message);
    } catch (err: unknown) {
      // Revert optimistic update on error
      setSaved(previousSaved);

      const message = err instanceof Error ? err.message : String(err);

      if (message.includes('401') || /unauthor/i.test(message)) {
        toast.error('Please log in to save blogs');
      } else {
        toast.error(message || 'Failed to toggle save');
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
      if (!response.ok || !data.success) throw new Error(data?.message || "Failed to report blog");
      toast.success(data.message || "Blog reported successfully.");
      setShowReport(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('401') || /unauthor/i.test(message)) {
        toast.error('Please log in to report blogs');
      } else {
        toast.error(message || "Failed to report blog");
      }
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 relative">
      <button
        className={`flex items-center gap-1 text-sm transition-colors ${
          liked ? "text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-500"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleLike}
        disabled={isLoading}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <FiHeart className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? "fill-current" : ""}`} />
        <span className="flex items-center gap-1 text-xs sm:text-sm">
          {liked ? "Liked" : "Like"}
          {likeCount > 0 && (
            <span className="text-gray-400">({likeCount})</span>
          )}
        </span>
      </button>
      
      <button
        className={`flex items-center gap-1 text-sm transition-colors ${
          saved ? "text-yellow-500" : "text-gray-500 dark:text-gray-400 hover:text-yellow-500"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleSave}
        disabled={isLoading}
        aria-label={saved ? "Remove save" : "Save"}
      >
        <FiBookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${saved ? "fill-current" : ""}`} />
        <span className="text-xs sm:text-sm">{saved ? "Saved" : "Save"}</span>
      </button>
      
      <button
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors text-sm"
        aria-label="Report"
        onClick={handleReport}
      >
        <FiFlag className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-xs sm:text-sm">Report</span>
      </button>

      {/* Report Popup - Mobile responsive */}
      {showReport && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setShowReport(false)}
          />
          
          <div className="fixed sm:absolute z-50 inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:top-10 sm:left-0 sm:translate-y-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-auto sm:w-80 max-w-md">
            <form onSubmit={submitReport} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  required
                  disabled={reportSubmitting}
                  placeholder="Spam, inappropriate, etc."
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                  className="px-3 py-1.5 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  onClick={() => setShowReport(false)}
                  disabled={reportSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                  disabled={reportSubmitting}
                >
                  {reportSubmitting ? "Reporting..." : "Report"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}