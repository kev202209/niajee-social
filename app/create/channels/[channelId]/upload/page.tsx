'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Channel } from '@/types';
import { FiUpload, FiLoader, FiCheck } from 'react-icons/fi';

// Import components
import ContentTypeSelector from '../../../../../components/upload/ContentTypeSelector';
import VideoUploader from '../../../../../components/upload/VideoUploader';
import ThumbnailUploader from '../../../../../components/upload/ThumbnailUploader';
import FormFields from '../../../../../components/upload/FormFields';
import UploadProgress from '../../../../../components/upload/UploadProgress';
import NavigationBlocker from '../../../../../components/upload/NavigationBlocker';
import UploadNotification from '../../../../../components/upload/UploadNotification';

// Import hooks and utilities
import { useUploadSocket } from './useUploadSocket';
import { useUploadForm } from '../../../../../hooks/upload/useUploadForm';
import { useFileHandlers } from '../../../../../hooks/upload/useFileHandlers';
import { useUploadState } from '../../../../../hooks/upload/useUploadState';
import { 
  formatBytes, 
  generateUploadId, 
  calculateUploadMetrics, 
  getVideoMetadata,
  getProcessingStepStatus
} from './utils';

const ChannelUploadPage = () => {
  const params = useParams();
  const router = useRouter();
  const channelId = params.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationClosed, setNotificationClosed] = useState(false);

  // Use the new upload state hook
  const {
    uploadState,
    uploadStartTime,
    setUploadStartTime,
    uploadedBytes,
    setUploadedBytes,
    cancelTokenSource,
    setCancelTokenSource,
    setUploading,
    setUploadProgress,
    setUploadSpeed,
    setEstimatedTime,
    setIsProcessing,
    setProcessingStep,
    setProcessingMessage,
    setProcessingProgress,
    setError,
    setSuccess,
    resetUploadState,
  } = useUploadState();

  // Custom hooks
  const {
    form,
    setForm,
    videoPreview,
    setVideoPreview,
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

  const { handleVideoChange, handleThumbnailChange } = useFileHandlers({
    form,
    processVideoFile,
    setForm,
    setThumbnailPreview,
    setError: (error: string | ((prevState: string) => string)) => {
      if (typeof error === 'function') {
        const currentError = uploadState.error || '';
        setError(error(currentError));
      } else {
        setError(error);
      }
    }
  });

  // Socket hook
  const { uploadSocket, uploadIdRef } = useUploadSocket(
    setProcessingStep,
    setProcessingMessage,
    setProcessingProgress,
    setUploading,
    setIsProcessing,
    setSuccess,
    setError,
    form.contentType
  );

  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Music', 'Sports', 
    'Technology', 'Comedy', 'News', 'Lifestyle', 'Travel', 'Other'
  ];

  useEffect(() => {
    fetchChannel();
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

  const fetchChannel = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
        withCredentials: true
      });
      
      setChannel(response.data.channel || response.data);
    } catch (error) {
      console.error('Error fetching channel:', error);
      setError('Failed to load channel data');
    } finally {
      setLoading(false);
    }
  };

  // Cancel upload function
  const cancelUpload = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Upload cancelled by user');
      resetUploadState();
      uploadIdRef.current = '';
      setShowNotification(false);
      setNotificationClosed(true);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.video) {
      setError('Please select a video file');
      return;
    }
    
    if (!form.title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!uploadSocket) {
      setError('Upload connection not ready. Please try again.');
      return;
    }

    // Generate unique upload ID and store in ref
    const newUploadId = generateUploadId();
    uploadIdRef.current = newUploadId;

    // Register the upload session and join room when socket is connected
    if (uploadSocket.connected) {
      console.log('Registering upload session:', newUploadId);
      uploadSocket.emit('register-upload-session', { uploadId: newUploadId });
      uploadSocket.emit('join-upload-room', { uploadId: newUploadId });
    } else {
      setError('Upload socket not connected. Please try again.');
      return;
    }

    resetUploadState();
    setUploading(true);
    setUploadStartTime(Date.now());
    setNotificationClosed(false);

    // Create cancel token
    const source = axios.CancelToken.source();
    setCancelTokenSource(source);

    try {
      const formData = new FormData();
      formData.append('video', form.video);
      formData.append('title', form.title);
      formData.append('channelId', channelId);
      formData.append('uploadId', newUploadId);
      formData.append('socketId', uploadSocket.id || '');

      if (form.contentType === 'short') {
        const metadata = await getVideoMetadata(form.video);
        
        // ✅ UPDATED: Use correct field names for shorts API
        formData.append('caption', form.description || form.caption || ''); // ✅ Backend expects 'caption'
        formData.append('song', form.song || ''); // ✅ New song field
        formData.append('tags', JSON.stringify(form.tags || []));
        formData.append('mentions', JSON.stringify(form.mentions || []));
        formData.append('location', form.location || '');
        formData.append('duration', metadata.duration.toString());
        formData.append('fileSize', form.video.size.toString());
        formData.append('resolution', metadata.resolution);
        
        // ✅ UPDATED: Use correct boolean field names
        formData.append('commentsEnabled', (form.commentsEnabled ?? true).toString()); // ✅ Backend expects 'commentsEnabled'
        formData.append('allowLikes', (form.allowLikes ?? true).toString());
        formData.append('allowDuet', (form.allowDuet ?? true).toString());
        formData.append('isPublic', (form.isPublic ?? true).toString());
        formData.append('isSensitive', (form.isSensitive ?? false).toString());

        // ✅ Optional thumbnail for shorts
        if (form.thumbnail) {
          formData.append('thumbnail', form.thumbnail);
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/upload`,
          formData,
          {
            withCredentials: true,
            cancelToken: source.token,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                ((progressEvent.loaded || 0) * 100) / (progressEvent.total || 1)
              );
              setUploadProgress(percentCompleted);
              
              if (percentCompleted === 100) {
                setIsProcessing(true);
                setProcessingStep('received');
                setProcessingMessage('Upload complete, starting processing...');
                setUploadSpeed('');
                setEstimatedTime('');
              } else {
                calculateUploadMetrics(
                  progressEvent, 
                  uploadStartTime, 
                  setUploadSpeed, 
                  setEstimatedTime, 
                  setUploadedBytes
                );
              }
            },
          }
        );
      } else {
        // For regular videos - ensure all values are strings
        formData.append('description', form.description || '');
        formData.append('category', form.category || '');
        formData.append('visibility', form.visibility);
        formData.append('tags', JSON.stringify(form.tags || []));
        
        // Only append thumbnail if it exists
        if (form.thumbnail) {
          formData.append('thumbnail', form.thumbnail);
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload`,
          formData,
          {
            withCredentials: true,
            cancelToken: source.token,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                ((progressEvent.loaded || 0) * 100) / (progressEvent.total || 1)
              );
              setUploadProgress(percentCompleted);
              
              if (percentCompleted === 100) {
                setIsProcessing(true);
                setProcessingStep('received');
                setProcessingMessage('Upload complete, starting processing...');
                setUploadSpeed('');
                setEstimatedTime('');
              } else {
                calculateUploadMetrics(
                  progressEvent, 
                  uploadStartTime, 
                  setUploadSpeed, 
                  setEstimatedTime, 
                  setUploadedBytes
                );
              }
            },
          }
        );
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        setError('Upload cancelled');
      } else {
        console.error('Upload error:', error);
        setError(error.response?.data?.message || 'Upload failed. Please try again.');
      }
      resetUploadState();
      uploadIdRef.current = '';
      setShowNotification(false);
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
        when={uploadState.uploading && !uploadState.isProcessing}
        onBeforeUnload={handleBeforeUnload}
        allowNavigation={() => uploadState.processingStep === 'complete'}
      />

      {/* Upload Notification */}
      <UploadNotification
        isVisible={showNotification && uploadState.uploading}
        uploadProgress={uploadState.uploadProgress}
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
          // Scroll to progress section
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

              {/* Thumbnail Upload (for both videos and shorts now) */}
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
              disabled={uploadState.uploading || !form.video || !form.title.trim() || !uploadSocket}
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
                  {!uploadSocket && ' (Connecting...)'}
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