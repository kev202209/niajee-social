'use client';

import React, { useState, useEffect, useRef, FC } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosProgressEvent } from 'axios';
import { Channel } from '@/types';
import { FiUpload, FiPlay, FiX, FiLoader, FiCheck, FiImage, FiVideo, FiSmartphone } from 'react-icons/fi';
import { io, Socket } from 'socket.io-client';

interface UploadForm {
  title: string;
  description: string;
  tags: string[];
  category: string;
  visibility: 'public' | 'unlisted' | 'private';
  thumbnail?: File;
  video?: File;
  contentType: 'video' | 'short';
  // Short-specific fields
  caption?: string;
  song?: string;
  commentsEnabled: boolean;
  allowLikes: boolean;
  allowDuet: boolean;
  isPublic: boolean;
  isSensitive: boolean;
  mentions: string[];
  location?: string;
}

interface UploadProgressData {
  step: 'received' | 'processing' | 'thumbnail' | 'saving' | 'complete';
  progress: number;
  message: string;
  videoId?: string;
  shortId?: string;
  currentQuality?: string;
  totalQualities?: number;
  currentQualityIndex?: number;
  timestamp?: string;
}

interface UploadErrorData {
  step: string;
  message: string;
  error?: any;
  timestamp?: string;
}

const ChannelUploadPage: FC = () => {
  const params = useParams();
  const router = useRouter();
  const channelId = params.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [form, setForm] = useState<UploadForm>({
    title: '',
    description: '',
    tags: [],
    category: '',
    visibility: 'public',
    contentType: 'video',
    caption: '',
    song: '',
    commentsEnabled: true,
    allowLikes: true,
    allowDuet: true,
    isPublic: true,
    isSensitive: false,
    mentions: [],
    location: '',
  });
  
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [currentTag, setCurrentTag] = useState('');
  const [currentMention, setCurrentMention] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [cancelTokenSource, setCancelTokenSource] = useState<any>(null);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);

  // WebSocket state
  const [uploadSocket, setUploadSocket] = useState<Socket | null>(null);
  
  // 🔄 Use ref for uploadId tracking instead of state
  const uploadIdRef = useRef<string>('');

  // Progress tracking state
  const [uploadStartTime, setUploadStartTime] = useState<number>(0);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);

  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Music', 'Sports', 
    'Technology', 'Comedy', 'News', 'Lifestyle', 'Travel', 'Other'
  ];

  useEffect(() => {
    fetchChannel();
  }, [channelId]);

  // Initialize upload WebSocket connection
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Connect to the upload namespace with websocket transport
    const socket = io(`${API_URL}/upload`, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Upload socket connected:', socket.id);
      setUploadSocket(socket);
    });

    socket.on('connect_error', (error) => {
      console.error('Upload socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Upload socket disconnected:', reason);
    });

    // 🔄 Listen for upload progress updates - no dependency on uploadId state
    socket.on('upload-progress', (data: UploadProgressData & { uploadId: string }) => {
      console.log('Upload progress received:', data);
      
      // 🔄 Use ref value for comparison
      if (data.uploadId === uploadIdRef.current) {
        setProcessingStep(data.step);
        setProcessingMessage(data.message);
        setProcessingProgress(data.progress);
        
        if (data.step === 'complete') {
          setSuccess(`${form.contentType === 'short' ? 'Short' : 'Video'} uploaded successfully!`);
          setUploading(false);
          setIsProcessing(false);
          
          // Optionally redirect to the uploaded content
          if (data.videoId) {
            setTimeout(() => {
              router.push(`/watch/${data.videoId}`);
            }, 2000);
          } else if (data.shortId) {
            setTimeout(() => {
              router.push(`/shorts/${data.shortId}`);
            }, 2000);
          }
        }
      }
    });

    // 🔄 Listen for upload errors - no dependency on uploadId state
    socket.on('upload-error', (data: UploadErrorData & { uploadId: string }) => {
      console.error('Upload error received:', data);
      
      // 🔄 Use ref value for comparison
      if (data.uploadId === uploadIdRef.current) {
        setError(data.message);
        setUploading(false);
        setIsProcessing(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []); // 🔄 Remove dependencies - listeners will always use current ref value

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

  const formatBytes = (bytes: number): string => {
    if (!bytes || isNaN(bytes) || bytes < 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    const sizeIndex = Math.min(i, sizes.length - 1);
    const size = parseFloat((bytes / Math.pow(k, sizeIndex)).toFixed(2));
    
    return `${size} ${sizes[sizeIndex]}`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const calculateUploadMetrics = (progressEvent: AxiosProgressEvent) => {
    const currentTime = Date.now();
    const timeElapsed = (currentTime - uploadStartTime) / 1000;
    const uploadedBytes = progressEvent.loaded || 0;
    const totalBytes = progressEvent.total || 0;
    
    if (timeElapsed > 1 && uploadedBytes > 0 && totalBytes > 0) {
      const bytesPerSecond = uploadedBytes / timeElapsed;
      const remainingBytes = totalBytes - uploadedBytes;
      
      if (bytesPerSecond > 0 && !isNaN(bytesPerSecond) && isFinite(bytesPerSecond)) {
        setUploadSpeed(formatBytes(Math.round(bytesPerSecond)));
        
        if (remainingBytes > 0) {
          const estimatedRemainingTime = remainingBytes / bytesPerSecond;
          if (!isNaN(estimatedRemainingTime) && isFinite(estimatedRemainingTime)) {
            setEstimatedTime(formatTime(estimatedRemainingTime));
          }
        } else {
          setEstimatedTime('Almost done');
        }
      }
      
      setUploadedBytes(uploadedBytes);
    }
  };

  // Generate unique upload ID
  const generateUploadId = (): string => {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      // Ensure the value is always a string
      setForm(prev => ({ ...prev, [name]: value || '' }));
    }
  };

  const handleContentTypeChange = (contentType: 'video' | 'short') => {
    setForm(prev => ({
      ...prev,
      contentType,
      title: '',
      description: '',
      caption: '',
      song: '',
      tags: [],
      mentions: [],
    }));
    
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview('');
    }
    if (thumbnailPreview) {
      setThumbnailPreview('');
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = form.contentType === 'short' ? 100 * 1024 * 1024 : 500 * 1024 * 1024;
      
      if (file.size > maxSize) {
        setError(`File size must be less than ${form.contentType === 'short' ? '100MB' : '500MB'}`);
        return;
      }
      
      if (form.contentType === 'short') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          if (video.duration > 60) {
            setError('Short videos must be 60 seconds or less');
            return;
          }
          processVideoFile(file);
        };
        video.src = URL.createObjectURL(file);
      } else {
        processVideoFile(file);
      }
    }
  };

  const processVideoFile = (file: File) => {
    setForm(prev => ({ ...prev, video: file }));
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    
    if (!form.title) {
      const filename = file.name.replace(/\.[^/.]+$/, "");
      setForm(prev => ({ ...prev, title: filename }));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Thumbnail file size must be less than 5MB');
        return;
      }
      
      setForm(prev => ({ ...prev, thumbnail: file }));
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !form.tags.includes(currentTag.trim()) && form.tags.length < 10) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addMention = () => {
    if (currentMention.trim() && !form.mentions.includes(currentMention.trim()) && form.mentions.length < 5) {
      const mention = currentMention.startsWith('@') ? currentMention.trim() : `@${currentMention.trim()}`;
      setForm(prev => ({ ...prev, mentions: [...prev.mentions, mention] }));
      setCurrentMention('');
    }
  };

  const removeMention = (mentionToRemove: string) => {
    setForm(prev => ({ ...prev, mentions: prev.mentions.filter(mention => mention !== mentionToRemove) }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'tag' | 'mention') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'tag') {
        addTag();
      } else {
        addMention();
      }
    }
  };

  const getVideoMetadata = (file: File): Promise<{ duration: number; resolution: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration);
        const resolution = `${video.videoWidth}x${video.videoHeight}`;
        resolve({ duration, resolution });
      };
      video.src = URL.createObjectURL(file);
    });
  };

  // 🔄 Cancel upload function
  const cancelUpload = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Upload cancelled by user');
      setUploading(false);
      setIsProcessing(false);
      setUploadProgress(0);
      setProcessingProgress(0);
      setUploadSpeed('');
      setEstimatedTime('');
      setUploadedBytes(0);
      setProcessingStep('');
      setProcessingMessage('');
      // 🔄 Clear upload ID ref on cancel
      uploadIdRef.current = '';
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

    // 🔄 Generate unique upload ID and store in ref
    const newUploadId = generateUploadId();
    uploadIdRef.current = newUploadId;

    // ✅ Register the upload session and join room when socket is connected
    if (uploadSocket.connected) {
      console.log('Registering upload session:', newUploadId);
      uploadSocket.emit('register-upload-session', { uploadId: newUploadId });
      uploadSocket.emit('join-upload-room', { uploadId: newUploadId });
    } else {
      setError('Upload socket not connected. Please try again.');
      return;
    }

    setUploading(true);
    setIsProcessing(false);
    setError('');
    setSuccess('');
    setUploadProgress(0);
    setProcessingProgress(0);
    setUploadSpeed('');
    setEstimatedTime('');
    setUploadedBytes(0);
    setUploadStartTime(Date.now());
    setProcessingStep('');
    setProcessingMessage('');

    // Create cancel token
    const source = axios.CancelToken.source();
    setCancelTokenSource(source);

    try {
      const formData = new FormData();
      formData.append('video', form.video);
      formData.append('title', form.title);
      formData.append('channelId', channelId);
      formData.append('uploadId', newUploadId); // ✅ This is crucial for backend tracking
      formData.append('socketId', uploadSocket.id || ''); // ✅ Backend needs this to find the socket

      if (form.contentType === 'short') {
        const metadata = await getVideoMetadata(form.video);
        
        // Ensure all values are strings, not undefined
        formData.append('caption', form.description || form.caption || '');
        formData.append('song', form.song || '');
        formData.append('tags', JSON.stringify(form.tags));
        formData.append('mentions', JSON.stringify(form.mentions));
        formData.append('location', form.location || '');
        formData.append('duration', metadata.duration.toString());
        formData.append('fileSize', form.video.size.toString());
        formData.append('resolution', metadata.resolution);
        formData.append('commentsEnabled', form.commentsEnabled.toString());
        formData.append('allowLikes', form.allowLikes.toString());
        formData.append('allowDuet', form.allowDuet.toString());
        formData.append('isPublic', form.isPublic.toString());
        formData.append('isSensitive', form.isSensitive.toString());

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/upload`,
          formData,
          {
            withCredentials: true,
            cancelToken: source.token,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
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
                calculateUploadMetrics(progressEvent);
              }
            },
          }
        );
      } else {
        // For regular videos - ensure all values are strings
        formData.append('description', form.description || '');
        formData.append('category', form.category || '');
        formData.append('visibility', form.visibility);
        formData.append('tags', JSON.stringify(form.tags));
        
        // Only append thumbnail if it exists
        if (form.thumbnail) {
          formData.append('thumbnail', form.thumbnail);
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload`,
          formData,
          {
            withCredentials: true,
            cancelToken: source.token,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
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
                calculateUploadMetrics(progressEvent);
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
      setUploading(false);
      setIsProcessing(false);
      setCancelTokenSource(null);
      setUploadProgress(0);
      setProcessingProgress(0);
      setUploadSpeed('');
      setEstimatedTime('');
      setUploadedBytes(0);
      // 🔄 Clear upload ID ref on error
      uploadIdRef.current = '';
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      tags: [],
      category: '',
      visibility: 'public',
      contentType: form.contentType,
      commentsEnabled: true,
      allowLikes: true,
      allowDuet: true,
      isPublic: true,
      isSensitive: false,
      mentions: [],
      location: '',
    });
    
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview('');
    }
    setThumbnailPreview('');
    setUploadProgress(0);
    setProcessingProgress(0);
    setUploadSpeed('');
    setEstimatedTime('');
    setUploadedBytes(0);
    setIsProcessing(false);
    setProcessingStep('');
    setProcessingMessage('');
    // 🔄 Clear upload ID ref on reset
    uploadIdRef.current = '';
  };

  const getProcessingStepStatus = (step: string) => {
    const stepOrder = ['received', 'processing', 'thumbnail', 'saving', 'complete'];
    const currentIndex = stepOrder.indexOf(processingStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'current';
    } else {
      return 'pending';
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
      <div className="mb-8">
        <div className="flex items-center gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => handleContentTypeChange('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
              form.contentType === 'video'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            disabled={uploading}
          >
            <FiVideo className="w-4 h-4" />
            Long-form Video
          </button>
          <button
            type="button"
            onClick={() => handleContentTypeChange('short')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
              form.contentType === 'short'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            disabled={uploading}
          >
            <FiSmartphone className="w-4 h-4" />
            Short Video
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {form.contentType === 'short' 
            ? 'Short videos are vertical videos up to 60 seconds long, perfect for mobile viewing'
            : 'Long-form videos support all formats and can be any length'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Video Upload */}
          <div className="space-y-6">
            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                {form.contentType === 'short' ? 'Short Video File' : 'Video File'} *
              </label>
              
              {!videoPreview ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    id="video-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    {form.contentType === 'short' ? (
                      <FiSmartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    ) : (
                      <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    )}
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choose {form.contentType} file
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {form.contentType === 'short' 
                        ? 'MP4, MOV vertical video up to 100MB and 60 seconds'
                        : 'MP4, MOV, AVI up to 500MB'
                      }
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <video
                    src={videoPreview}
                    controls
                    className={`w-full object-cover rounded-lg bg-black ${
                      form.contentType === 'short' ? 'h-80' : 'h-64'
                    }`}
                  />
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(videoPreview);
                        setVideoPreview('');
                        setForm(prev => ({ ...prev, video: undefined }));
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail Upload (only for long-form videos) */}
            {form.contentType === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Thumbnail (Optional)
                </label>
                
                {!thumbnailPreview ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      id="thumbnail-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer">
                      <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Upload thumbnail
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPG, PNG up to 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailPreview('');
                          setForm(prev => ({ ...prev, thumbnail: undefined }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Content Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                placeholder={`Enter ${form.contentType} title`}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {form.title.length}/100 characters
              </p>
            </div>

            {/* Description/Caption */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {form.contentType === 'short' ? 'Caption' : 'Description'}
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder={`Tell viewers about your ${form.contentType}`}
                rows={form.contentType === 'short' ? 3 : 4}
                maxLength={form.contentType === 'short' ? 1000 : 5000}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {form.description.length}/{form.contentType === 'short' ? 1000 : 5000} characters
              </p>
            </div>

            {/* Short-specific fields */}
            {form.contentType === 'short' && (
              <>
                <div>
                  <label htmlFor="song" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Song/Music (Optional)
                  </label>
                  <input
                    type="text"
                    id="song"
                    name="song"
                    value={form.song || ''}
                    onChange={handleInputChange}
                    placeholder="Add music credit"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={uploading}
                  />
                </div>

                {/* Mentions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mentions
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.mentions.map(mention => (
                      <span
                        key={mention}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                      >
                        {mention}
                        {!uploading && (
                          <button
                            type="button"
                            onClick={() => removeMention(mention)}
                            className="hover:text-purple-600 dark:hover:text-purple-300"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentMention}
                      onChange={(e) => setCurrentMention(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'mention')}
                      placeholder="@username"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={uploading || form.mentions.length >= 5}
                    />
                    <button
                      type="button"
                      onClick={addMention}
                      disabled={!currentMention.trim() || form.mentions.length >= 5 || uploading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {form.mentions.length}/5 mentions
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={form.location || ''}
                    onChange={handleInputChange}
                    placeholder="Add location"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={uploading}
                  />
                </div>

                {/* Social Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Social Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="allowLikes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Allow Likes
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Let viewers like your short
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="allowLikes"
                      name="allowLikes"
                      checked={form.allowLikes}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      disabled={uploading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="allowDuet" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Allow Duets
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Let others create duets with your short
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="allowDuet"
                      name="allowDuet"
                      checked={form.allowDuet}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      disabled={uploading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="isSensitive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sensitive Content
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Mark if content may be sensitive
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="isSensitive"
                      name="isSensitive"
                      checked={form.isSensitive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                      disabled={uploading}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Long-form video specific fields */}
            {form.contentType === 'video' && (
              <>
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={uploading}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Visibility */}
                <div>
                  <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={form.visibility}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={uploading}
                  >
                    <option value="public">Public - Anyone can watch</option>
                    <option value="unlisted">Unlisted - Only people with the link</option>
                    <option value="private">Private - Only you can watch</option>
                  </select>
                </div>
              </>
            )}

            {/* Tags (for both video and shorts) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tag}
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-600 dark:hover:text-blue-300"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'tag')}
                  placeholder="Add a tag"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={uploading || form.tags.length >= 10}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!currentTag.trim() || form.tags.length >= 10 || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {form.tags.length}/10 tags
              </p>
            </div>

            {/* Comments Setting */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="commentsEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow Comments
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Viewers can comment on your {form.contentType}
                </p>
              </div>
              <input
                type="checkbox"
                id="commentsEnabled"
                name="commentsEnabled"
                checked={form.commentsEnabled}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                disabled={uploading}
              />
            </div>

            {/* Public Setting (for shorts) */}
            {form.contentType === 'short' && (
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Public Short
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Make your short visible to everyone
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={form.isPublic}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  disabled={uploading}
                />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Upload Progress with Real-time WebSocket Updates */}
        {uploading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FiLoader className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {isProcessing 
                    ? (processingMessage || `Processing ${form.contentType}...`)
                    : `Uploading ${form.contentType}...`
                  }
                </span>
              </div>
              {!isProcessing && (
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                >
                  Cancel
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 dark:text-blue-300">
                  {isProcessing 
                    ? `Processing... ${processingProgress}%` 
                    : `${uploadProgress}% complete`
                  }
                </span>
                {!isProcessing && (
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatBytes(uploadedBytes)} / {form.video ? formatBytes(form.video.size) : '0 B'}
                  </span>
                )}
              </div>
              
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 relative overflow-hidden ${
                    isProcessing 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600' 
                      : 'bg-blue-600'
                  }`}
                  style={{ 
                    width: isProcessing 
                      ? `${processingProgress}%` 
                      : `${uploadProgress}%` 
                  }}
                >
                  {/* Animated gradient for active progress */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  
                  {/* Processing animation */}
                  {isProcessing && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      style={{ 
                        animation: 'processing 2s ease-in-out infinite',
                        transform: 'translateX(-100%)'
                      }} 
                    />
                  )}
                </div>
              </div>
              
              {/* Upload/Processing Stats */}
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                {isProcessing ? (
                  <>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      We are actively processing your {form.contentType}
                    </span>
                    <span className="text-purple-600 dark:text-purple-400">
                      This may take a few minutes
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {uploadSpeed ? `Speed: ${uploadSpeed}/s` : 'Calculating speed...'}
                    </span>
                    <span>
                      {estimatedTime && uploadProgress < 100 ? `ETA: ${estimatedTime}` : ''}
                    </span>
                  </>
                )}
              </div>
              
              {/* Real-time Processing Steps */}
              {isProcessing && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300 mb-3">
                    <FiLoader className="w-3 h-3 animate-spin" />
                    <span>Processing steps:</span>
                  </div>
                  
                  <ul className="text-xs space-y-2">
                    <li className="flex items-center gap-2">
                      {getProcessingStepStatus('received') === 'completed' ? (
                        <FiCheck className="w-3 h-3 text-green-500" />
                      ) : getProcessingStepStatus('received') === 'current' ? (
                        <FiLoader className="w-3 h-3 animate-spin text-blue-500" />
                      ) : (
                        <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                      )}
                      <span className={
                        getProcessingStepStatus('received') === 'completed' 
                          ? 'text-green-600 dark:text-green-400'
                          : getProcessingStepStatus('received') === 'current'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400'
                      }>
                        Upload completed
                      </span>
                    </li>
                    
                    <li className="flex items-center gap-2">
                      {getProcessingStepStatus('processing') === 'completed' ? (
                        <FiCheck className="w-3 h-3 text-green-500" />
                      ) : getProcessingStepStatus('processing') === 'current' ? (
                        <FiLoader className="w-3 h-3 animate-spin text-blue-500" />
                      ) : (
                        <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                      )}
                      <span className={
                        getProcessingStepStatus('processing') === 'completed' 
                          ? 'text-green-600 dark:text-green-400'
                          : getProcessingStepStatus('processing') === 'current'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400'
                      }>
                        {form.contentType === 'video' ? 'Optimizing video quality' : 'Optimizing short video'}
                      </span>
                    </li>
                    
                    <li className="flex items-center gap-2">
                      {getProcessingStepStatus('thumbnail') === 'completed' ? (
                        <FiCheck className="w-3 h-3 text-green-500" />
                      ) : getProcessingStepStatus('thumbnail') === 'current' ? (
                        <FiLoader className="w-3 h-3 animate-spin text-blue-500" />
                      ) : (
                        <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                      )}
                      <span className={
                        getProcessingStepStatus('thumbnail') === 'completed' 
                          ? 'text-green-600 dark:text-green-400'
                          : getProcessingStepStatus('thumbnail') === 'current'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400'
                      }>
                        Creating thumbnail
                      </span>
                    </li>
                    
                    <li className="flex items-center gap-2">
                      {getProcessingStepStatus('saving') === 'completed' ? (
                        <FiCheck className="w-3 h-3 text-green-500" />
                      ) : getProcessingStepStatus('saving') === 'current' ? (
                        <FiLoader className="w-3 h-3 animate-spin text-blue-500" />
                      ) : (
                        <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                      )}
                      <span className={
                        getProcessingStepStatus('saving') === 'completed' 
                          ? 'text-green-600 dark:text-green-400'
                          : getProcessingStepStatus('saving') === 'current'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400'
                      }>
                        Finalizing upload
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => uploading ? cancelUpload() : window.history.back()}
            disabled={isProcessing}
            className={`flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (isProcessing ? 'Processing...' : 'Cancel Upload') : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={uploading || !form.video || !form.title.trim() || !uploadSocket}
            className={`flex-1 px-6 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2 ${
              uploading 
                ? (isProcessing 
                    ? 'bg-purple-500 text-white cursor-not-allowed' 
                    : 'bg-blue-500 text-white cursor-not-allowed')
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed'
            }`}
          >
            {uploading ? (
              isProcessing ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Processing... ({processingProgress}%)
                </>
              ) : (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Uploading... ({uploadProgress}%)
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
  );
};

export default ChannelUploadPage;