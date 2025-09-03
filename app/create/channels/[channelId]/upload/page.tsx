'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Channel } from '@/types';
import { FiUpload, FiLoader, FiCheck } from 'react-icons/fi';
import { toast } from 'sonner'; // Add import for toast

// Import components
import ContentTypeSelector from '../../../../../components/upload/ContentTypeSelector';
import VideoUploader from '../../../../../components/upload/VideoUploader';
import ThumbnailUploader from '../../../../../components/upload/ThumbnailUploader';
import FormFields from '../../../../../components/upload/FormFields';
import UploadProgress from '../../../../../components/upload/UploadProgress';
import NavigationBlocker from '../../../../../components/upload/NavigationBlocker';
import UploadNotification from '../../../../../components/upload/UploadNotification';

// Import hooks and utilities
import { useUploadForm } from '../../../../../hooks/upload/useUploadForm';
import { useFileHandlers } from '../../../../../hooks/upload/useFileHandlers';

const ChannelUploadPage = () => {
  const params = useParams();
  const channelId = params.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationClosed, setNotificationClosed] = useState(false);
  const uploadIdRef = useRef<string>(''); // Added ref for upload ID
  const [uploadedBytes, setUploadedBytes] = useState<number>(0); // Added for tracking

  // Expanded uploadState to include all properties expected by components
  const [uploadState, setUploadState] = useState({
    uploading: false,
    processing: false,
    progress: 0,
    status: '',
    videoId: null as string | null,
    error: '',
    success: '',
    processingStep: '', // Added
    isProcessing: false, // Added
    uploadProgress: 0, // Added
    processingProgress: 0, // Added
    processingMessage: '', // Added
    uploadSpeed: '', // Added
    estimatedTime: '' // Added
  });

  // Custom hooks
  const {
    form,
    setForm,
    videoPreview,
    thumbnailPreview,
    setThumbnailPreview,
    handleContentTypeChange,
    handleInputChange,
    processVideoFile,
    clearVideo,
    clearThumbnail,
    addTag,
    removeTag,
    addMention,
    removeMention,
  } = useUploadForm();

  const [fileError, setFileError] = useState<string>('');

  const { handleVideoChange, handleThumbnailChange } = useFileHandlers({
    form,
    processVideoFile,
    setForm,
    setThumbnailPreview,
    setError: setFileError,
  });

  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Music', 'Sports', 
    'Technology', 'Comedy', 'News', 'Lifestyle', 'Travel', 'Other'
  ];

  const fetchChannel = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
        withCredentials: true
      });
      setChannel(response.data.channel || response.data);
    } catch (err) {
      console.error('Error fetching channel:', err);
      toast.error('Failed to load channel data');
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  // Show notification when uploading starts
  useEffect(() => {
    if (uploadState.uploading && !notificationClosed) {
      setShowNotification(true);
    }
  }, [uploadState.uploading, notificationClosed]);

  // Auto-hide notification when upload completes after 5 seconds
  useEffect(() => {
    if (uploadState.processingStep === 'complete' && showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
        setNotificationClosed(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadState.processingStep, showNotification]);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  // Reset upload state function
  const resetUploadState = () => {
    setUploadState({
      uploading: false,
      processing: false,
      progress: 0,
      status: '',
      videoId: null,
      error: '',
      success: '',
      processingStep: '',
      isProcessing: false,
      uploadProgress: 0,
      processingProgress: 0,
      processingMessage: '',
      uploadSpeed: '',
      estimatedTime: ''
    });
    setUploadedBytes(0);
    uploadIdRef.current = '';
  };

  // Cancel upload function
  const cancelUpload = () => {
    resetUploadState();
    setShowNotification(false);
    setNotificationClosed(true);
  };

  // Handle navigation when upload is in progress
  const handleBeforeUnload = () => {
    if (uploadState.uploading) {
      // Store upload state in sessionStorage for potential recovery
      sessionStorage.setItem('uploadInProgress', JSON.stringify({
        uploadId: uploadIdRef.current,
        contentType: form.contentType,
        title: form.title,
        channelId
      }));
    }
  };

  // Request presigned URL for upload
  const requestPresignedUrl = async (file: File, channelId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/presigned-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        channelId,
        contentType: form.contentType
      })
    });
    if (!response.ok) throw new Error('Failed to get upload URL');
    return await response.json();
  };

  // Upload file to R2 using presigned URL
  const uploadToR2 = async (presignedUrl: string, file: File) => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'video/mp4' }
    });
    if (!response.ok) throw new Error('Upload to R2 failed');
    return response;
  };

  // In startProcessing, define a proper type for metadata:
  interface Metadata {
    title: string;
    description: string;
    channelId: string;
    contentType: string;
    tags: string[];
    category: string;
    visibility: string;
  }

  // Start processing the video after upload
  const startProcessing = async (uploadId: string, r2Key: string, metadata: Metadata) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/start-processing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        uploadId,
        r2Key,
        title: metadata.title,
        description: metadata.description,
        channelId: metadata.channelId,
        contentType: metadata.contentType,
        tags: metadata.tags,
        category: metadata.category,
        visibility: metadata.visibility
      })
    });
    if (!response.ok) throw new Error('Failed to start processing');
    return await response.json();
  };

  // Poll video status
  const pollVideoStatus = (videoId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}`, {
          credentials: 'include'
        });
        const video = await response.json();
        
        if (video.processingStatus === 'complete') {
          clearInterval(interval);
          setUploadState(prev => ({ ...prev, status: 'complete', success: 'Video ready!' }));
        } else if (video.processingStatus === 'failed') {
          clearInterval(interval);
          setUploadState(prev => ({ ...prev, status: 'failed', error: 'Processing failed' }));
        } else {
          setUploadState(prev => ({ ...prev, status: 'processing' }));
        }
      } catch  {
        clearInterval(interval);
        setUploadState(prev => ({ ...prev, status: 'failed', error: 'Status check failed' }));
      }
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.video || !form.title.trim()) {
      setUploadState({ ...uploadState, error: 'Please select a video and enter a title' });
      return;
    }

    setUploadState({ ...uploadState, uploading: true, progress: 0, error: '', success: '' });

    try {
      // Step 1: Request presigned URL
      const { uploadId, presignedUrl, r2Key } = await requestPresignedUrl(form.video, channelId);
      uploadIdRef.current = uploadId; // Set ref

      // Step 2: Upload to R2
      setUploadState(prev => ({ ...prev, progress: 50, uploadProgress: 50 }));
      await uploadToR2(presignedUrl, form.video);
      setUploadedBytes(form.video.size); // Track bytes
      setUploadState(prev => ({ ...prev, progress: 100, uploadProgress: 100, uploading: false, processing: true, isProcessing: true }));

      // Step 3: Start processing
      const { videoId } = await startProcessing(uploadId, r2Key, {
        title: form.title,
        description: form.description,
        channelId,
        contentType: form.contentType,
        tags: form.tags,
        category: form.category,
        visibility: form.visibility
      });

      // Step 4: Poll for status
      pollVideoStatus(videoId);
      
    } catch {
      const errorMessage = 'Upload failed';
      setUploadState({ ...uploadState, uploading: false, processing: false, error: errorMessage });
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Channel not found</p>
      </div>
    );
  }

  return (
    <>
      {/* Navigation Blocker */}
      <NavigationBlocker
        when={uploadState.uploading}
        onBeforeUnload={handleBeforeUnload}
        allowNavigation={() => uploadState.processingStep === 'complete'} // Fixed: Return boolean
      />

      {/* Upload Notification */}
      <UploadNotification
        isVisible={showNotification && uploadState.uploading}
        uploadProgress={uploadState.uploadProgress} // Fixed: Use correct property
        processingProgress={uploadState.processingProgress}
        isProcessing={uploadState.isProcessing}
        processingStep={uploadState.processingStep}
        contentType={form.contentType}
        onClose={() => {
          setShowNotification(false);
          setNotificationClosed(true);
        }}
        onViewProgress={() => {
          setShowNotification(false);
          document.querySelector('[data-upload-progress]')?.scrollIntoView({ 
            behavior: 'smooth' 
          });
        }}
      />

      <div className="p-8 max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Content
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your videos and shorts with the world
          </p>
        </header>

        {/* Content Type Selector */}
        <ContentTypeSelector 
          contentType={form.contentType}
          handleContentTypeChange={handleContentTypeChange}
          uploading={uploadState.uploading}
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Video Upload */}
            <div className="space-y-6">
              {/* Video Upload */}
              <VideoUploader
                videoPreview={videoPreview}
                handleVideoChange={handleVideoChange}
                contentType={form.contentType}
                uploading={uploadState.uploading}
                clearVideo={clearVideo}
              />

              {/* Thumbnail Upload */}
              <ThumbnailUploader
                thumbnailPreview={thumbnailPreview}
                handleThumbnailChange={handleThumbnailChange}
                uploading={uploadState.uploading}
                clearThumbnail={clearThumbnail}
              />
            </div>

            {/* Right Column - Content Details */}
            <FormFields
              form={form}
              handleInputChange={handleInputChange}
              addTag={addTag}
              removeTag={removeTag}
              addMention={addMention}
              removeMention={removeMention}
              uploading={uploadState.uploading}
              categories={categories}
            />
          </div>

          {/* Upload Progress */}
          <div data-upload-progress>
            <UploadProgress
              uploading={uploadState.uploading}
              isProcessing={uploadState.isProcessing}
              uploadProgress={uploadState.uploadProgress}
              processingProgress={uploadState.processingProgress}
              processingStep={uploadState.processingStep}
              processingMessage={uploadState.processingMessage}
              uploadSpeed={uploadState.uploadSpeed}
              estimatedTime={uploadState.estimatedTime}
              uploadedBytes={uploadedBytes}
              fileSize={form.video?.size || 0}
              contentType={form.contentType}
              cancelUpload={cancelUpload}
            />
          </div>

          {/* Success/Error Messages */}
          {uploadState.success && (
            <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-center gap-2">
                <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-green-800 dark:text-green-200 text-sm">{uploadState.success}</p>
              </div>
            </div>
          )}

          {uploadState.error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{uploadState.error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => uploadState.uploading ? cancelUpload() : window.history.back()}
              disabled={uploadState.isProcessing}
              className={`flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium ${
                uploadState.isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploadState.uploading ? (uploadState.isProcessing ? 'Processing...' : 'Cancel Upload') : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={uploadState.uploading || !form.video || !form.title.trim()}
              className={`flex-1 px-6 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2 ${
                uploadState.uploading 
                  ? (uploadState.isProcessing 
                      ? 'bg-purple-500 text-white cursor-not-allowed' 
                      : 'bg-blue-500 text-white cursor-not-allowed')
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed'
              }`}
            >
              {uploadState.uploading ? (
                uploadState.isProcessing ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Processing... ({uploadState.processingProgress}%)
                  </>
                ) : (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Uploading... ({uploadState.uploadProgress}%)
                  </>
                )
              ) : (
                <>
                  <FiUpload className="w-4 h-4" />
                  Upload {form.contentType === 'short' ? 'Short' : 'Video'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChannelUploadPage;