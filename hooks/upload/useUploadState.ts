import { useState, useEffect } from 'react';
import { UploadState } from '../../app/create/channels/[channelId]/upload/types';

export function useUploadState() {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploadProgress: 0,
    uploadSpeed: '',
    estimatedTime: '',
    isProcessing: false,
    processingStep: '',
    processingMessage: '',
    processingProgress: 0,
    error: '',
    success: '',
    uploading: false,
  });

  const [uploadStartTime, setUploadStartTime] = useState<number>(0);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);
  const [cancelTokenSource, setCancelTokenSource] = useState<any>(null);

  // Individual setters for easier use
  const setUploading = (uploading: boolean) => 
    setUploadState(prev => ({ ...prev, uploading }));
  
  const setUploadProgress = (uploadProgress: number) => 
    setUploadState(prev => ({ ...prev, uploadProgress }));
  
  const setUploadSpeed = (uploadSpeed: string) => 
    setUploadState(prev => ({ ...prev, uploadSpeed }));
  
  const setEstimatedTime = (estimatedTime: string) => 
    setUploadState(prev => ({ ...prev, estimatedTime }));
  
  const setIsProcessing = (isProcessing: boolean) => 
    setUploadState(prev => ({ ...prev, isProcessing }));
  
  const setProcessingStep = (processingStep: string) => 
    setUploadState(prev => ({ ...prev, processingStep }));
  
  const setProcessingMessage = (processingMessage: string) => 
    setUploadState(prev => ({ ...prev, processingMessage }));
  
  const setProcessingProgress = (processingProgress: number) => 
    setUploadState(prev => ({ ...prev, processingProgress }));
  
  const setError = (error: string) => 
    setUploadState(prev => ({ ...prev, error }));
  
  const setSuccess = (success: string) => 
    setUploadState(prev => ({ ...prev, success }));

  const resetUploadState = () => {
    setUploadState({
      uploadProgress: 0,
      uploadSpeed: '',
      estimatedTime: '',
      isProcessing: false,
      processingStep: '',
      processingMessage: '',
      processingProgress: 0,
      error: '',
      success: '',
      uploading: false,
    });
    setUploadStartTime(0);
    setUploadedBytes(0);
  };

  return {
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
  };
}