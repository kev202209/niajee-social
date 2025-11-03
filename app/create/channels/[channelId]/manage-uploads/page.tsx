'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Channel, UploadItem, ProcessingStatus, getThumbnailSrc } from '@/types';
import { 
  FiUpload, 
  FiLoader, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiVideo, 
  FiSmartphone,
  FiRefreshCw,
  FiTrash2,
  FiEye,
  FiEdit,
  FiImage,
  FiX as FiClose // Alias for close icon
} from 'react-icons/fi';
import { toast } from 'sonner';
import Link from 'next/link';
import AuthenticatedImage from '@/components/Image';
import timeAgo from '@/utils/timeAgo';
import { GENERIC_ERROR_MESSAGE } from '@/utils/toastMessages';
import { formatDuration } from '@/utils/formatUtils';
import { useAuth } from '@/contexts/AuthContext';
import LoadingDots from '@/components/LoadingDots'; // ADD this import

const ManageUploadsPage = () => {
  const params = useParams();
  const channelId = params.channelId as string;
  
  const { ensureCsrf } = useAuth(); // ADD

  const [channel, setChannel] = useState<Channel | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [uploadToDelete, setUploadToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false); // ADD for delete loading
  const lastRefreshRef = useRef<number>(0);
  const lastFetchRef = useRef<number>(0); // NEW: Track last fetch time

  const fetchChannel = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setChannel(data.channel || data);
      }
    } catch (err) {
      console.error('Error fetching channel:', err);
    }
  }, [channelId]);

  const fetchUploads = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 10000) { // NEW: Enforce 10-second minimum between fetches
      return;
    }
    lastFetchRef.current = now;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/uploads`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUploads(data.uploads || []);
      } else {
        toast.error('Something went wrong. Try again Later or refresh the page and try again');
      }
    } catch (err) {
      console.error('Error fetching uploads:', err);
      toast.error('Something went wrong. Try again Later or refresh the page and try again');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [channelId]);

  const refreshUploads = async () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < 5000) { // 5-second cooldown for manual refresh
      return;
    }
    lastRefreshRef.current = now;
    setRefreshing(true);
    await fetchUploads();
  };

  const handleDeleteClick = (uploadId: string) => {
    console.log('handleDeleteClick called with uploadId:', uploadId);
    setUploadToDelete(uploadId);
    setShowDeleteModal(true);
    console.log('Modal should now be visible for uploadId:', uploadId);
  };

  const confirmDelete = async () => {
    console.log('confirmDelete started for uploadId:', uploadToDelete);
    if (!uploadToDelete) {
      console.log('No uploadToDelete set, exiting');
      return;
    }

    // Find the upload to determine contentType
    const upload = uploads.find(u => u.id === uploadToDelete);
    if (!upload) {
      console.log('Upload not found, exiting');
      toast.error(GENERIC_ERROR_MESSAGE);
      return;
    }

    setShowDeleteModal(false);
    setDeleting(true);
    console.log('Deleting state set to true, modal closed');

    try {
      console.log('Fetching CSRF token...');
      const csrf = await ensureCsrf();
      console.log('CSRF token obtained');

      // Determine endpoint based on contentType
      const endpoint = upload.contentType === 'short' 
        ? `/api/shorts/${uploadToDelete}` 
        : `/api/videos/${uploadToDelete}`;
      console.log('Sending DELETE request to:', `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'x-csrf-token': csrf,
        },
      });
      console.log('Response received, status:', response.status);

      if (response.ok) {
        console.log('Delete successful, updating uploads list');
        setUploads(prev => prev.filter(u => u.id !== uploadToDelete));
        toast.success('Upload deleted successfully');
      } else {
        console.log('Delete failed with status:', response.status);
        toast.error(GENERIC_ERROR_MESSAGE);
      }
    } catch (err) {
      console.error('Error in confirmDelete:', err);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      console.log('confirmDelete finished, resetting states');
      setUploadToDelete(null);
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    console.log('cancelDelete called, closing modal');
    setShowDeleteModal(false);
    setUploadToDelete(null);
  };

  // Helper functions for the new status structure
  const getOverallStatus = (processingStatus: ProcessingStatus): string => {
    const videoStatus = processingStatus.video?.status;
    const thumbnailStatus = processingStatus.thumbnail?.status;

    // If video failed, overall is failed
    if (videoStatus === 'failed') return 'failed';
    
    // If video is still processing or queued, overall follows video status
    if (videoStatus === 'processing' || videoStatus === 'queued') return videoStatus;
    
    // If video is complete but thumbnail is still processing, show processing
    if (videoStatus === 'complete' && (thumbnailStatus === 'processing' || thumbnailStatus === 'queued')) {
      return 'processing';
    }
    
    // If video is complete and thumbnail is done (or no thumbnail), show complete
    if (videoStatus === 'complete') return 'complete';
    
    return 'queued';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <FiCheck className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <FiX className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <FiLoader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'queued':
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (processingStatus: ProcessingStatus): string => {
    const overallStatus = getOverallStatus(processingStatus);
    const videoStatus = processingStatus.video?.status;
    const thumbnailStatus = processingStatus.thumbnail?.status;
    const progress = processingStatus.video?.progress;

    if (overallStatus === 'processing') {
      if (videoStatus === 'processing') {
        return progress ? `Processing Video (${progress}%)` : 'Processing Video';
      }
      if (videoStatus === 'complete' && thumbnailStatus === 'processing') {
        return 'Processing Thumbnail';
      }
    }
    
    return overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1);
  };



  useEffect(() => {
    fetchChannel();
    fetchUploads();

    // Auto-refresh every 10 seconds for processing uploads (changed from 2 minutes)
    const interval = setInterval(() => {
      if (document.hidden) return; // Skip if tab is not active
      const hasProcessingUploads = uploads.some(upload => {
        const overallStatus = getOverallStatus(upload.processingStatus);
        return overallStatus === 'processing'; // Only active processing, not queued
      });
      
      if (hasProcessingUploads) {
        fetchUploads();
      }
    }, 10000); // NEW: 10-second interval

    return () => clearInterval(interval);
  }, [fetchChannel, fetchUploads, uploads]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    // Updated root container: Responsive padding (smaller on mobile, larger on desktop)
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Updated header: Stack elements vertically on mobile for better space usage */}
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Uploads
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Track and manage your content uploads for {channel?.name}
            </p>
          </div>
          
          {/* Updated button group: Stack on mobile, flex on larger screens */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={refreshUploads}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <Link
              href={`/create/channels/${channelId}/upload`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FiUpload className="w-4 h-4" />
              New Upload
            </Link>
          </div>
        </div>
      </header>

      {uploads.length === 0 ? (
        // Updated empty state: Smaller icon and text on mobile
        <div className="text-center py-8 sm:py-12">
          <FiVideo className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No uploads yet
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            Start by uploading your first video or short
          </p>
          <Link
            href={`/create/channels/${channelId}/upload`}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
          >
            <FiUpload className="w-4 h-4" />
            Upload Content
          </Link>
        </div>
      ) : (
        // Updated uploads list: Responsive spacing
        <div className="space-y-4 sm:space-y-6">
          {uploads.map((upload) => {
            const overallStatus = getOverallStatus(upload.processingStatus);
            const statusText = getStatusText(upload.processingStatus);
            const videoProgress = upload.processingStatus.video?.progress;
            
            return (
              // Updated card: Responsive padding and layout
              <div
                key={upload.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
              >
                {/* Updated flex layout: Stack vertically on mobile, flex on larger screens */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Updated thumbnail: Smaller on mobile */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-16 sm:w-32 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                      {upload.thumbnail?.data ? (
                        <AuthenticatedImage
                          mediaKey={getThumbnailSrc(upload.thumbnail)}
                          alt={upload.title}
                          width={96} // Smaller default for mobile
                          height={64}
                          className="w-full h-full object-cover"
                          fallbackSrc="/placeholder-video.jpg"
                        />
                      ) : (
                        upload.contentType === 'short' ? 
                          <FiSmartphone className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" /> : 
                          <FiVideo className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Updated content info: Full width, responsive text */}
                  <div className="flex-1 min-w-0">
                    {/* Updated header flex: Stack on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {upload.title}
                        </h3>
                        {upload.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {upload.description}
                          </p>
                        )}
                        {/* Updated metadata: Smaller text, flex-wrap for mobile */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{upload.contentType}</span>
                          {/* <span>{formatFileSize(upload.fileSize)}</span> */}
                          {upload.duration && <span>{formatDuration(upload.duration)}</span>}
                          <span>{timeAgo(upload.createdAt)}</span>
                        </div>
                      </div>

                      {/* Updated status badge: Smaller on mobile */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className={`px-2 py-1 sm:px-3 rounded-full text-xs font-medium ${getStatusColor(overallStatus)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(overallStatus)}
                            <span className="hidden sm:inline">{statusText}</span> {/* Hide text on mobile for brevity */}
                          </div>
                        </span>
                      </div>
                    </div>

                    {/* Updated detailed status: Responsive spacing */}
                    <div className="mt-3 space-y-2">
                      {/* Video Processing Status */}
                      {upload.processingStatus.video && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiVideo className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Video:</span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(upload.processingStatus.video.status)}`}>
                            {upload.processingStatus.video.status}
                            {upload.processingStatus.video.status === 'processing' && videoProgress && 
                              ` (${videoProgress}%)`
                            }
                          </span>
                        </div>
                      )}

                      {/* Thumbnail Processing Status */}
                      {(upload.processingStatus.thumbnail || upload.thumbnail?.status) && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiImage className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Thumbnail:</span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(
                            upload.processingStatus.thumbnail?.status || upload.thumbnail?.status || 'unknown'
                          )}`}>
                            {upload.processingStatus.thumbnail?.status || upload.thumbnail?.status || 'unknown'}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({upload.processingStatus.thumbnail?.type || upload.thumbnail?.type || 'unknown'})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Updated progress bar: Responsive width */}
                    {upload.processingStatus.video?.status === 'processing' && videoProgress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Processing video...</span>
                          <span>{videoProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${videoProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Updated error messages: Responsive padding */}
                    {upload.processingStatus.video?.status === 'failed' && upload.processingStatus.video.errorMessage && (
                      <div className="mt-3 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">
                          Video Error: {upload.processingStatus.video.errorMessage}
                        </p>
                      </div>
                    )}

                    {upload.processingStatus.thumbnail?.status === 'failed' && upload.processingStatus.thumbnail.errorMessage && (
                      <div className="mt-3 p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                          Thumbnail Error: {upload.processingStatus.thumbnail.errorMessage}
                        </p>
                      </div>
                    )}

                    {/* Updated actions: Flex-wrap for mobile, touch-friendly sizes */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {overallStatus === 'complete' && (upload.videoId || upload.shortId) && (
                        <Link
                          href={upload.contentType === 'short' ? 
                            `/shorts/${upload.shortId}` : 
                            `/watch/${upload.videoId}`
                          }
                          className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/30 transition text-xs sm:text-sm"
                        >
                          <FiEye className="w-3 h-3" />
                          View
                        </Link>
                      )}
                      
                      {overallStatus === 'complete' && (
                        <Link
                          href={`/create/channels/${channelId}/editor/${upload.contentType === 'short' ? upload.shortId : upload.videoId}`}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30 transition text-xs sm:text-sm"
                        >
                          <FiEdit className="w-3 h-3" />
                          Edit
                        </Link>
                      )}
                      
                      <button
                        onClick={() => handleDeleteClick(upload.id)} // CHANGED: upload.id instead of upload.uploadId
                        className="inline-flex items-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/30 transition text-xs sm:text-sm"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Deletion
              </h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <FiClose className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this upload? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? <LoadingDots /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUploadsPage;