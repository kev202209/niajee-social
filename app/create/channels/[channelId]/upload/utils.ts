import { AxiosProgressEvent } from 'axios';

export const formatBytes = (bytes: number): string => {
  if (!bytes || isNaN(bytes) || bytes < 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const sizeIndex = Math.min(i, sizes.length - 1);
  const size = parseFloat((bytes / Math.pow(k, sizeIndex)).toFixed(2));
  
  return `${size} ${sizes[sizeIndex]}`;
};

export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

export const calculateUploadMetrics = (
  progressEvent: AxiosProgressEvent,
  uploadStartTime: number,
  setUploadSpeed: (speed: string) => void,
  setEstimatedTime: (time: string) => void,
  setUploadedBytes: (bytes: number) => void
) => {
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

export const generateUploadId = (): string => {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getProcessingStepStatus = (step: string, processingStep: string) => {
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

export const getVideoMetadata = (file: File): Promise<{ duration: number; resolution: string }> => {
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