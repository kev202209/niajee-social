export interface UploadForm {
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

export interface UploadProgressData {
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

export interface UploadErrorData {
  step: string;
  message: string;
  error?: unknown; // replaced any with unknown; narrow where you use it
  timestamp?: string;
}

export interface UploadState {
  uploadProgress: number;
  uploadSpeed: string;
  estimatedTime: string;
  isProcessing: boolean;
  processingStep: string;
  processingMessage: string;
  processingProgress: number;
  error: string;
  success: string;
  uploading: boolean;
}