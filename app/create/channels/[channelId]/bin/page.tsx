// app/create/channels/[channelId]/bin/page.tsx
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
  FiX as FiClose,
  FiRotateCcw // ADD: Icon for Restore
} from 'react-icons/fi';
import { toast } from 'sonner';
import Link from 'next/link';
import AuthenticatedImage from '@/components/Image';
import timeAgo from '@/utils/timeAgo';
import { GENERIC_ERROR_MESSAGE } from '@/utils/toastMessages';
import { formatDuration } from '@/utils/formatUtils';
import { useAuth } from '@/contexts/AuthContext';
import LoadingDots from '@/components/LoadingDots';

const BinPage = () => {
  const params = useParams();
  const channelId = params.channelId as string;
  
  const { ensureCsrf } = useAuth();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [uploadToAction, setUploadToAction] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const lastRefreshRef = useRef<number>(0);
  const lastFetchRef = useRef<number>(0);

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

  const fetchDeletedUploads = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 10000) {
      return;
    }
    lastFetchRef.current = now;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/deleted-uploads`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUploads(data.uploads || []);
      } else {
        toast.error('Something went wrong. Try again Later or refresh the page and try again');
      }
    } catch (err) {
      console.error('Error fetching deleted uploads:', err);
      toast.error('Something went wrong. Try again Later or refresh the page and try again');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [channelId]);

  const refreshUploads = async () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < 5000) {
      return;
    }
    lastRefreshRef.current = now;
    setRefreshing(true);
    await fetchDeletedUploads();
  };

  const handleRestoreClick = (uploadId: string) => {
    setUploadToAction(uploadId);
    setShowRestoreModal(true);
  };

  const handleDeleteClick = (uploadId: string) => {
    setUploadToAction(uploadId);
    setShowDeleteModal(true);
  };

  const confirmRestore = async () => {
    if (!uploadToAction) return;
    setShowRestoreModal(false);
    setRestoring(true);

    try {
      const upload = uploads.find(u => u.id === uploadToAction);
      if (!upload) {
        toast.error(GENERIC_ERROR_MESSAGE);
        return;
      }

      const csrf = await ensureCsrf();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/restore-content`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({
          contentId: uploadToAction,
          contentType: upload.contentType as 'video' | 'short',
        }),
      });

      if (response.ok) {
        setUploads(prev => prev.filter(u => u.id !== uploadToAction));
        toast.success('Upload restored successfully');
      } else {
        toast.error(GENERIC_ERROR_MESSAGE);
      }
    } catch (err) {
      console.error('Error restoring upload:', err);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setUploadToAction(null);
      setRestoring(false);
    }
  };

  const confirmPermanentDelete = async () => {
    if (!uploadToAction) return;
    setShowDeleteModal(false);
    setDeleting(true);

    try {
      const csrf = await ensureCsrf();
      // ASSUME: Permanent delete endpoint (adjust if different, e.g., add ?permanent=true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/${uploadToAction}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'x-csrf-token': csrf,
        },
      });

      if (response.ok) {
        setUploads(prev => prev.filter(u => u.id !== uploadToAction));
        toast.success('Upload permanently deleted');
      } else {
        toast.error(GENERIC_ERROR_MESSAGE);
      }
    } catch (err) {
      console.error('Error permanently deleting upload:', err);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setUploadToAction(null);
      setDeleting(false);
    }
  };

  const cancelAction = () => {
    setShowRestoreModal(false);
    setShowDeleteModal(false);
    setUploadToAction(null);
  };

  // Helper functions (same as manage-uploads)
  const getOverallStatus = (processingStatus: ProcessingStatus): string => {
    const videoStatus = processingStatus.video?.status;
    const thumbnailStatus = processingStatus.thumbnail?.status;

    if (videoStatus === 'failed') return 'failed';
    if (videoStatus === 'processing' || videoStatus === 'queued') return videoStatus;
    if (videoStatus === 'complete' && (thumbnailStatus === 'processing' || thumbnailStatus === 'queued')) {
      return 'processing';
    }
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
    fetchDeletedUploads();
  }, [fetchChannel, fetchDeletedUploads]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bin
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage deleted uploads for {channel?.name}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={refreshUploads}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {uploads.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <FiTrash2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Bin is empty
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            No deleted uploads found
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {uploads.map((upload) => {
            const overallStatus = getOverallStatus(upload.processingStatus);
            const statusText = getStatusText(upload.processingStatus);
            const videoProgress = upload.processingStatus.video?.progress;
            
            return (
              <div
                key={upload.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-16 sm:w-32 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                      {upload.thumbnail?.data ? (
                        <AuthenticatedImage
                          mediaKey={getThumbnailSrc(upload.thumbnail)}
                          alt={upload.title}
                          width={96}
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

                  <div className="flex-1 min-w-0">
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
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{upload.contentType}</span>
                          {upload.duration && <span>{formatDuration(upload.duration)}</span>}
                          <span>{timeAgo(upload.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className={`px-2 py-1 sm:px-3 rounded-full text-xs font-medium ${getStatusColor(overallStatus)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(overallStatus)}
                            <span className="hidden sm:inline">{statusText}</span>
                          </div>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <button
                        onClick={() => handleRestoreClick(upload.id)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/30 transition text-xs sm:text-sm"
                      >
                        <FiRotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(upload.id)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/30 transition text-xs sm:text-sm"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Delete Permanently
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Restore
              </h3>
              <button
                onClick={cancelAction}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <FiClose className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to restore this upload?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelAction}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                disabled={restoring}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {restoring ? <LoadingDots /> : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Permanent Deletion
              </h3>
              <button
                onClick={cancelAction}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <FiClose className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete the upload. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelAction}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmPermanentDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? <LoadingDots /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BinPage;