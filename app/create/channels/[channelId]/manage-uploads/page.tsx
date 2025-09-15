'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Channel } from '@/types';
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
  FiEdit
} from 'react-icons/fi';
import { toast } from 'sonner';
import Link from 'next/link';
import AuthenticatedImage from '@/components/Image';
import timeAgo from '@/app/utils/timeAgo';
import { getImageSrc } from '@/app/utils/imageUtils';

interface UploadItem {
  id: string;
  uploadId: string;
  title: string;
  description: string;
  contentType: 'video' | 'short';
  processingStatus: 'processing' | 'complete' | 'failed' | 'queued';
  processingProgress: number;
  thumbnail?: string;
  duration?: number;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  r2Key?: string;
  videoId?: string;
  shortId?: string;
  errorMessage?: string;
}

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
        toast.error('Failed to fetch uploads');
      }
    } catch (err) {
      console.error('Error fetching uploads:', err);
      toast.error('Failed to fetch uploads');
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
        toast.error('Failed to delete upload');
      }
    } catch (err) {
      console.error('Error deleting upload:', err);
      toast.error('Failed to delete upload');
    }
  };

  useEffect(() => {
    fetchChannel();
    fetchUploads();

    // Auto-refresh every 30 seconds for processing uploads
    const interval = setInterval(() => {
      const hasProcessingUploads = uploads.some(upload => 
        upload.processingStatus === 'processing' || upload.processingStatus === 'queued'
      );
      
      if (hasProcessingUploads) {
        fetchUploads();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchChannel, fetchUploads, uploads]);

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
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                    {upload.thumbnail ? (
                      <AuthenticatedImage
                        mediaKey={getImageSrc(upload.thumbnail, '480w')}
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(upload.processingStatus)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(upload.processingStatus)}
                          {upload.processingStatus === 'processing' ? 
                            `Processing (${upload.processingProgress}%)` : 
                            upload.processingStatus.charAt(0).toUpperCase() + upload.processingStatus.slice(1)
                          }
                        </div>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar for Processing */}
                  {upload.processingStatus === 'processing' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Processing video...</span>
                        <span>{upload.processingProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${upload.processingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {upload.processingStatus === 'failed' && upload.errorMessage && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Error: {upload.errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    {upload.processingStatus === 'complete' && (upload.videoId || upload.shortId) && (
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
                    
                    {upload.processingStatus === 'complete' && (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageUploadsPage;