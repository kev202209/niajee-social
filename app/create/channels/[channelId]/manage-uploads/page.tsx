'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  FiImage
} from 'react-icons/fi';
import { toast } from 'sonner';
import Link from 'next/link';
import AuthenticatedImage from '@/components/Image';
import timeAgo from '@/utils/timeAgo';
import { GENERIC_ERROR_MESSAGE } from '@/utils/toastMessages';

const ManageUploadsPage = () => {
  const params = useParams();
  const channelId = params.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    setRefreshing(true);
    await fetchUploads();
  };

  const deleteUpload = async (uploadId: string) => {
    if (!confirm('Are you sure you want to delete this upload?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/${uploadId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setUploads(prev => prev.filter(upload => upload.uploadId !== uploadId));
        toast.success('Upload deleted successfully');
      } else {
        toast.error(GENERIC_ERROR_MESSAGE);
      }
    } catch (err) {
      console.error('Error deleting upload:', err);
      toast.error(GENERIC_ERROR_MESSAGE);
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchChannel();
    fetchUploads();

    // Auto-refresh every 30 seconds for processing uploads
    const interval = setInterval(() => {
      const hasProcessingUploads = uploads.some(upload => {
        const overallStatus = getOverallStatus(upload.processingStatus);
        return overallStatus === 'processing' || overallStatus === 'queued';
      });
      
      if (hasProcessingUploads) {
        fetchUploads();
      }
    }, 30000);

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
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Uploads
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage your content uploads for {channel?.name}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={refreshUploads}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <Link
              href={`/create/channels/${channelId}/upload`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FiUpload className="w-4 h-4" />
              New Upload
            </Link>
          </div>
        </div>
      </header>

      {uploads.length === 0 ? (
        <div className="text-center py-12">
          <FiVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No uploads yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by uploading your first video or short
          </p>
          <Link
            href={`/create/channels/${channelId}/upload`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiUpload className="w-4 h-4" />
            Upload Content
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {uploads.map((upload) => {
            const overallStatus = getOverallStatus(upload.processingStatus);
            const statusText = getStatusText(upload.processingStatus);
            const videoProgress = upload.processingStatus.video?.progress;
            
            return (
              <div
                key={upload.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                      {upload.thumbnail?.data ? (
                        <AuthenticatedImage
                          mediaKey={getThumbnailSrc(upload.thumbnail)}
                          alt={upload.title}
                          width={128}
                          height={80}
                          className="w-full h-full object-cover"
                          fallbackSrc="/placeholder-video.jpg"
                        />
                      ) : (
                        upload.contentType === 'short' ? 
                          <FiSmartphone className="w-8 h-8 text-gray-400" /> : 
                          <FiVideo className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {upload.title}
                        </h3>
                        {upload.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {upload.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{upload.contentType}</span>
                          <span>{formatFileSize(upload.fileSize)}</span>
                          {upload.duration && <span>{formatDuration(upload.duration)}</span>}
                          <span>{timeAgo(upload.createdAt)}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(overallStatus)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(overallStatus)}
                            {statusText}
                          </div>
                        </span>
                      </div>
                    </div>

                    {/* Detailed Status Information */}
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

                    {/* Progress Bar for Video Processing */}
                    {upload.processingStatus.video?.status === 'processing' && videoProgress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
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

                    {/* Error Messages */}
                    {upload.processingStatus.video?.status === 'failed' && upload.processingStatus.video.errorMessage && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          Video Error: {upload.processingStatus.video.errorMessage}
                        </p>
                      </div>
                    )}

                    {upload.processingStatus.thumbnail?.status === 'failed' && upload.processingStatus.thumbnail.errorMessage && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Thumbnail Error: {upload.processingStatus.thumbnail.errorMessage}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      {overallStatus === 'complete' && (upload.videoId || upload.shortId) && (
                        <Link
                          href={upload.contentType === 'short' ? 
                            `/shorts/${upload.shortId}` : 
                            `/watch/${upload.videoId}`
                          }
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/30 transition text-sm"
                        >
                          <FiEye className="w-3 h-3" />
                          View
                        </Link>
                      )}
                      
                      {overallStatus === 'complete' && (
                        <Link
                          href={`/create/channels/${channelId}/editor/${upload.contentType === 'short' ? upload.shortId : upload.videoId}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30 transition text-sm"
                        >
                          <FiEdit className="w-3 h-3" />
                          Edit
                        </Link>
                      )}
                      
                      <button
                        onClick={() => deleteUpload(upload.uploadId)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/30 transition text-sm"
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
    </div>
  );
};

export default ManageUploadsPage;