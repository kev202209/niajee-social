'use client';
import { useState, useRef } from 'react';
import { Flag, X } from 'lucide-react';
import { toast } from 'sonner';
import useOutsideClick from '@/hooks/useOutsideClick';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle?: string;
  type?: 'shorts' | 'videos'; // Add type prop to determine API endpoint
}

const ReportModal = ({ 
  isOpen, 
  onClose, 
  videoId, 
  videoTitle,
  type = 'shorts' // Default to shorts for backward compatibility
}: ReportModalProps) => {
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null!);
  
  // Close modal when clicking outside
  useOutsideClick(modalRef, () => {
    if (!reportSubmitting) {
      onClose();
    }
  });

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting.");
      return;
    }
    
    setReportSubmitting(true);
    
    try {
      // Use different API endpoints based on type
      const endpoint = type === 'shorts' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoId}/report`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/report`;

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          reason: reportReason.trim(),
          description: reportDescription.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to report video');
      }

      toast.success(data.message || 'Video reported successfully');
      onClose();
      
      // Reset form
      setReportReason("");
      setReportDescription("");
      
    } catch (error: any) {
      console.error('Error reporting video:', error);
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        toast.error('Please log in to report videos');
      } else {
        toast.error(error.message || 'Failed to report video. Please try again.');
      }
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!reportSubmitting) {
      setReportReason("");
      setReportDescription("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      
      {/* Modal Container */}
      <div className="min-h-screen px-4 flex items-center justify-center py-8">
        <div 
          ref={modalRef}
          className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Report Video
                </h2>
                {videoTitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">
                    "{videoTitle}"
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={reportSubmitting}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={submitReport} className="p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help us understand what's happening with this video. Your report is anonymous and helps keep our community safe.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                What's the issue? <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                required
                disabled={reportSubmitting}
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam or misleading content</option>
                <option value="inappropriate_content">Inappropriate or offensive content</option>
                <option value="harassment">Harassment or bullying</option>
                <option value="violence">Violence or dangerous behavior</option>
                <option value="hate_speech">Hate speech or discrimination</option>
                <option value="copyright">Copyright violation</option>
                <option value="misinformation">False information or misinformation</option>
                <option value="child_safety">Child safety concerns</option>
                <option value="privacy">Privacy violation</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional details <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={4}
                disabled={reportSubmitting}
                placeholder="Please provide additional context that might help us understand the issue better..."
                maxLength={500}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {reportDescription.length}/500
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>What happens next?</strong> Our moderation team will review this report within 24 hours. 
                    We may take action if the content violates our community guidelines.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                onClick={handleClose}
                disabled={reportSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                disabled={reportSubmitting || !reportReason.trim()}
              >
                {reportSubmitting ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;