'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Channel } from '@/types';
import { FiUpload, FiLoader, FiCheck } from 'react-icons/fi';
import { toast } from 'sonner';

import ContentTypeSelector from '../../../../../components/upload/ContentTypeSelector';
import VideoUploader from '../../../../../components/upload/VideoUploader';
import ThumbnailUploader from '../../../../../components/upload/ThumbnailUploader';
import FormFields from '../../../../../components/upload/FormFields';
import UploadProgress from '../../../../../components/upload/UploadProgress';
import NavigationBlocker from '../../../../../components/upload/NavigationBlocker';
// import UploadNotification from '../../../../../components/upload/UploadNotification';

import { useUploadForm } from '../../../../../hooks/upload/useUploadForm';
import { useFileHandlers } from '../../../../../hooks/upload/useFileHandlers';
import { GENERIC_ERROR_MESSAGE } from '@/utils/toastMessages';

const ChannelUploadPage = () => {
  const params = useParams();
  const channelId = params.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationClosed, setNotificationClosed] = useState(false);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);

  const [uploadState, setUploadState] = useState({
    uploading: false,
    processing: false,
    progress: 0,
    status: '',
    videoId: null as string | null,
    error: '',
    success: '',
    processingStep: '',
    isProcessing: false,
    uploadProgress: 0,
    processingProgress: 0,
    processingMessage: '',
    uploadSpeed: '',
    estimatedTime: '',
    // NEW: Thumbnail upload states
    thumbnailUploading: false,
    thumbnailUploaded: false,
    thumbnailError: ''
  });

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

  const { handleVideoChange, handleThumbnailChange } = useFileHandlers({
    form,
    processVideoFile,
    setForm,
    setThumbnailPreview,
    setError: () => {}
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
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    if (uploadState.uploading && !notificationClosed) {
      setShowNotification(true);
    }
  }, [uploadState.uploading, notificationClosed]);

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
      estimatedTime: '',
      thumbnailUploading: false,
      thumbnailUploaded: false,
      thumbnailError: ''
    });
    setUploadedBytes(0);
  };

  const cancelUpload = () => {
    resetUploadState();
    setShowNotification(false);
    setNotificationClosed(true);
  };

  const handleBeforeUnload = () => {
    if (uploadState.uploading) {
      sessionStorage.setItem('uploadInProgress', JSON.stringify({
        videoId: uploadState.videoId,
        contentType: form.contentType,
        title: form.title,
        channelId
      }));
    }
  };

  // ✅ UPDATED: Interface now includes thumbnail data
  interface PresignedResponse {
    videoId?: string;
    shortId?: string;
    video: {
      presignedUrl: string;
      s3Key: string;
      expectedFileName: string;
    };
    thumbnail?: {
      presignedUrl: string;
      s3Key: string;
      fileName: string;
    } | null;
    expiresIn: number;
  }

  // Strongly typed request body for presigned URL request
  type PresignedUploadRequestBody = {
    fileName: string;
    fileSize: number;
    channelId: string;
    thumbnailFile?: {
      fileName: string;
      fileSize: number;
    };
  };

  // ✅ UPDATED: Now supports thumbnail file in the request
  const requestPresignedUrl = async (
    fileName: string, 
    fileSize: number, 
    channelId: string, 
    contentType: 'video' | 'short',
    thumbnailFile?: File
  ): Promise<PresignedResponse> => {
    const endpoint = contentType === 'short' ? '/api/shorts/presigned-upload' : '/api/videos/presigned-upload';
    
    // ✅ NEW: Include thumbnail file info if provided
    const requestBody: PresignedUploadRequestBody = { 
      fileName, 
      fileSize, 
      channelId 
    };

    if (thumbnailFile) {
      requestBody.thumbnailFile = {
        fileName: thumbnailFile.name,
        fileSize: thumbnailFile.size
      };
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });
    
    if (!res.ok) {
      const errorData = (await res.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errorData?.message || 'Failed to get upload URL');
    }
    
    return (await res.json()) as PresignedResponse;
  };

  const uploadToR2 = async (presignedUrl: string, file: File) => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'video/mp4' }
    });
    if (!response.ok) throw new Error('Upload to R2 failed');
    return response;
  };

  // ✅ NEW: Separate function for thumbnail upload
  const uploadThumbnailToR2 = async (presignedUrl: string, file: File) => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'image/jpeg' }
    });
    if (!response.ok) throw new Error('Thumbnail upload to R2 failed');
    return response;
  };

  interface Metadata {
    title: string;
    description: string;
    channelId: string;
    contentType: string;
    tags: string[];
    category: string;
    visibility: string;
    isMemberOnly?: boolean;
    requiredTierId?: string | null;
  }

  // Strongly typed processing bodies
  type StartProcessingVideoBody = {
    videoId: string;
    s3Key: string;
    title: string;
    description: string;
    channelId: string;
    contentType: 'video';
    tags: string[];
    category: string;
    visibility: string;
    thumbnailS3Key?: string;
    isMemberOnly?: boolean;
    requiredTierId?: string | null;
  };

  type StartProcessingShortBody = {
    shortId: string;
    s3Key: string;
    title: string;
    description: string;
    channelId: string;
    contentType: 'short';
    tags: string[];
    category: string;
    visibility: string;
    thumbnailS3Key?: string;
    isMemberOnly?: boolean;
    requiredTierId?: string | null;
  };

  type StartProcessingResult = {
    status?: string;
    message?: string;
    [k: string]: unknown;
  };

  // ✅ UPDATED: Now supports thumbnailS3Key parameter
  const startProcessing = async (
    contentId: string, 
    s3Key: string, 
    metadata: Metadata,
    thumbnailS3Key?: string
  ): Promise<StartProcessingResult> => {
    const endpoint = metadata.contentType === 'short' ? '/api/shorts/start-processing' : '/api/videos/start-processing';
    
    let requestBody: StartProcessingVideoBody | StartProcessingShortBody;

    if (metadata.contentType === 'short') {
      requestBody = {
        shortId: contentId,
        s3Key,
        title: metadata.title,
        description: metadata.description,
        channelId: metadata.channelId,
        contentType: 'short',
        tags: metadata.tags,
        category: metadata.category,
        visibility: metadata.visibility,
        ...(thumbnailS3Key ? { thumbnailS3Key } : {}),
        ...(metadata.isMemberOnly ? { isMemberOnly: metadata.isMemberOnly } : {}),
        ...(metadata.requiredTierId ? { requiredTierId: metadata.requiredTierId } : {})
      };
    } else {
      requestBody = {
        videoId: contentId,
        s3Key,
        title: metadata.title,
        description: metadata.description,
        channelId: metadata.channelId,
        contentType: 'video',
        tags: metadata.tags,
        category: metadata.category,
        visibility: metadata.visibility,
        ...(thumbnailS3Key ? { thumbnailS3Key } : {}),
        ...(metadata.isMemberOnly ? { isMemberOnly: metadata.isMemberOnly } : {}),
        ...(metadata.requiredTierId ? { requiredTierId: metadata.requiredTierId } : {})
      };
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });
    
    if (!res.ok) {
      const errorData = (await res.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errorData?.message || 'Failed to start processing');
    }
    
    return (await res.json()) as StartProcessingResult;
  };

  // ✅ UPDATED: Complete rewrite of handleSubmit to support thumbnail uploads
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.video || !form.title.trim()) {
      setUploadState(prev => ({ ...prev, error: 'Please select a video and enter a title' }));
      return;
    }
    
    setUploadState(prev => ({ 
      ...prev, 
      uploading: true, 
      error: '', 
      success: '',
      thumbnailError: '',
      uploadProgress: 0
    }));

    try {
      // ✅ STEP 1: Request presigned URLs (including thumbnail if provided)
      console.log('🎬 [UPLOAD] Step 1: Requesting presigned URLs...');
      setUploadState(prev => ({ ...prev, status: 'Getting upload URLs...', uploadProgress: 10 }));
      
      const presigned = await requestPresignedUrl(
        form.video.name, 
        form.video.size, 
        channelId, 
        form.contentType,
        form.thumbnail // ✅ NEW: Pass thumbnail file if selected
      );
      
      // Use the correct ID from response
      const contentId = presigned.shortId || presigned.videoId;
      if (!contentId) throw new Error('No content ID received from backend');
      
      // Store the ID in state
      setUploadState(prev => ({ ...prev, videoId: contentId }));

      console.log('🎬 [UPLOAD] Presigned URLs received:', {
        contentId,
        videoS3Key: presigned.video.s3Key,
        thumbnailS3Key: presigned.thumbnail?.s3Key,
        hasThumbnail: !!presigned.thumbnail
      });

      // ✅ STEP 2: Upload thumbnail first (if provided)
      let thumbnailS3Key: string | undefined;
      if (presigned.thumbnail && form.thumbnail) {
        console.log('🖼️ [UPLOAD] Step 2a: Uploading thumbnail...');
        setUploadState(prev => ({ 
          ...prev, 
          status: 'Uploading thumbnail...', 
          uploadProgress: 20,
          thumbnailUploading: true 
        }));

        try {
          await uploadThumbnailToR2(presigned.thumbnail.presignedUrl, form.thumbnail);
          thumbnailS3Key = presigned.thumbnail.s3Key;
          
          setUploadState(prev => ({ 
            ...prev, 
            thumbnailUploading: false,
            thumbnailUploaded: true 
          }));
          
          console.log('🖼️ [UPLOAD] Thumbnail uploaded successfully to:', thumbnailS3Key);
          toast.success('Thumbnail uploaded successfully!');
          
        } catch (thumbnailError) {
          console.error('🖼️ [UPLOAD] Thumbnail upload failed:', thumbnailError);
          setUploadState(prev => ({ 
            ...prev, 
            thumbnailUploading: false,
            thumbnailError: 'Thumbnail upload failed. Video will be uploaded without custom thumbnail.' 
          }));
          // Don't throw - continue with video upload
          toast.warning('Thumbnail upload failed, continuing with video upload');
        }
      }

      // ✅ STEP 3: Upload video file
      console.log('🎬 [UPLOAD] Step 3: Uploading video...');
      setUploadState(prev => ({ 
        ...prev, 
        status: 'Uploading video...', 
        uploadProgress: 40 
      }));

      const renamedFile = new File([form.video], presigned.video.expectedFileName, { 
        type: form.video.type 
      });

      await uploadToR2(presigned.video.presignedUrl, renamedFile);
      setUploadedBytes(renamedFile.size);
      
      setUploadState(prev => ({ 
        ...prev, 
        uploadProgress: 80,
        status: 'Video uploaded, starting processing...' 
      }));

      console.log('🎬 [UPLOAD] Video uploaded successfully');

      // ✅ STEP 4: Start processing with all data
      console.log('🎬 [UPLOAD] Step 4: Starting processing...');
      setUploadState(prev => ({
        ...prev,
        uploadProgress: 90,
        status: 'Starting processing...'
      }));

      const processingResult = await startProcessing(
        contentId, 
        presigned.video.s3Key, 
        {
          title: form.title,
          description: form.description,
          channelId,
          contentType: form.contentType,
          tags: form.tags,
          category: form.category,
          visibility: form.visibility,
          isMemberOnly: form.isMemberOnly,
          requiredTierId: form.requiredTierId
        },
        thumbnailS3Key // ✅ NEW: Pass thumbnail S3 key if uploaded
      );

      console.log('🎬 [UPLOAD] Processing started:', processingResult);

      setUploadState(prev => ({
        ...prev,
        uploadProgress: 100,
        progress: 100,
        uploading: false,
        processing: true,
        isProcessing: true,
        status: 'Processing started!'
      }));

      // ✅ Success feedback
      const successMessage = thumbnailS3Key 
        ? 'Upload completed! Video and thumbnail are being processed.'
        : 'Upload completed! Video is being processed.';
      
      toast.success(successMessage);
      
      setTimeout(() => {
        window.location.href = `/create/channels/${channelId}/manage-uploads`;
      }, 1200);

    } catch (err) {
      console.error('🎬 [UPLOAD] Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        processing: false, 
        error: errorMessage,
        thumbnailUploading: false
      }));
      
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
      <NavigationBlocker
        when={uploadState.uploading}
        onBeforeUnload={handleBeforeUnload}
        allowNavigation={() => uploadState.processingStep === 'complete'}
      />

      {/* <UploadNotification
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
          document.querySelector('[data-upload-progress]')?.scrollIntoView({
            behavior: 'smooth'
          });
        }}
      /> */}

      {/* Updated root container: Responsive padding */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Updated header: Stack on mobile */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Upload Content
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Share your videos and shorts with the world
              </p>
            </div>
          </div>
        </header>

        <ContentTypeSelector
          contentType={form.contentType}
          handleContentTypeChange={handleContentTypeChange}
          uploading={uploadState.uploading}
        />

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Updated grid: Responsive gap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <VideoUploader
                videoPreview={videoPreview}
                handleVideoChange={handleVideoChange}
                contentType={form.contentType}
                uploading={uploadState.uploading}
                clearVideo={clearVideo}
              />

              <ThumbnailUploader
                thumbnailPreview={thumbnailPreview}
                handleThumbnailChange={handleThumbnailChange}
                uploading={uploadState.uploading || uploadState.thumbnailUploading}
                clearThumbnail={clearThumbnail}
              />

              {/* Thumbnail upload status: Responsive padding */}
              {uploadState.thumbnailUploading && (
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiLoader className="w-4 h-4 text-blue-600 animate-spin" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Uploading thumbnail...
                    </p>
                  </div>
                </div>
              )}

              {uploadState.thumbnailUploaded && (
                <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Thumbnail uploaded successfully!
                    </p>
                  </div>
                </div>
              )}

              {uploadState.thumbnailError && (
                <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 line-clamp-2">
                    ⚠️ {uploadState.thumbnailError}
                  </p>
                </div>
              )}
            </div>

            <FormFields
              form={form}
              handleInputChange={handleInputChange}
              addTag={addTag}
              removeTag={removeTag}
              addMention={addMention}
              removeMention={removeMention}
              uploading={uploadState.uploading}
              categories={categories}
              membershipEnabled={channel.membershipEnabled}
              membershipTiers={channel.membershipTiers}
            />
          </div>

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

          {/* Success/Error: Responsive padding */}
          {uploadState.success && (
            <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-center gap-2">
                <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  {uploadState.success}
                </p>
              </div>
            </div>
          )}

          {uploadState.error && (
            <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 line-clamp-2">
                {uploadState.error}
              </p>
            </div>
          )}

          {/* Updated buttons: Responsive padding and flex-wrap */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:pt-6">
            <button
              type="button"
              onClick={() => uploadState.uploading ? cancelUpload() : window.history.back()}
              disabled={uploadState.isProcessing}
              className={`flex-1 px-4 py-3 sm:px-6 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium ${
                uploadState.isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploadState.uploading
                ? (uploadState.isProcessing ? 'Processing...' : 'Cancel Upload')
                : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={uploadState.uploading || !form.video || !form.title.trim()}
              className={`flex-1 px-4 py-3 sm:px-6 sm:py-3 rounded-lg transition font-medium flex items-center justify-center gap-2 ${
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
                    {uploadState.thumbnailUploading ? 'Uploading Thumbnail...' : `Uploading... (${uploadState.uploadProgress}%)`}
                  </>
                )
              ) : (
                <>
                  <FiUpload className="w-4 h-4" />
                  Upload {form.contentType === 'short' ? 'Short' : 'Video'}
                  {form.thumbnail && ' + Thumbnail'}
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