// Update useUploadSocket.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { UploadProgressData, UploadErrorData } from './types';
import { useRouter } from 'next/navigation';

export function useUploadSocket(
  setProcessingStep: (step: string) => void,
  setProcessingMessage: (message: string) => void,
  setProcessingProgress: (progress: number) => void,
  setUploading: (uploading: boolean) => void,
  setIsProcessing: (isProcessing: boolean) => void,
  setSuccess: (success: string) => void,
  setError: (error: string) => void,
  contentType: 'video' | 'short'
) {
  const [uploadSocket, setUploadSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const uploadIdRef = useRef<string>('');
  const router = useRouter();

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // ✅ Connect to the upload namespace with both transports
    const socket = io(`${API_URL}/upload`, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // ✅ Allow fallback to polling
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Upload socket connected:', socket.id);
      setUploadSocket(socket);
      setIsConnected(true);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Upload socket connection error:', error);
      setIsConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ Upload socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Upload socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      
      // ✅ Rejoin upload room if we have an active upload
      if (uploadIdRef.current) {
        socket.emit('join-upload-room', {
          uploadId: uploadIdRef.current,
          userId: 'current-user-id' // Replace with actual user ID
        });
      }
    });

    // ✅ Listen for upload progress updates
    socket.on('upload-progress', (data: UploadProgressData & { uploadId: string }) => {
      console.log('📊 Upload progress received:', data);
      
      if (data.uploadId === uploadIdRef.current) {
        setProcessingStep(data.step);
        setProcessingMessage(data.message);
        setProcessingProgress(data.progress);
        
        if (data.step === 'complete') {
          setSuccess(`${contentType === 'short' ? 'Short' : 'Video'} uploaded successfully!`);
          setUploading(false);
          setIsProcessing(false);
          
          // Clear upload ID
          uploadIdRef.current = '';
          
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

    // ✅ Listen for upload errors
    socket.on('upload-error', (data: UploadErrorData & { uploadId: string }) => {
      console.error('❌ Upload error received:', data);
      
      if (data.uploadId === uploadIdRef.current) {
        setError(data.message);
        setUploading(false);
        setIsProcessing(false);
        uploadIdRef.current = '';
      }
    });

    // ✅ Listen for session registration confirmation
    socket.on('upload-session-registered', (data) => {
      console.log('📝 Upload session registered:', data);
    });

    // ✅ Listen for reconnection to existing uploads
    socket.on('upload-reconnected', (data) => {
      console.log('🔄 Upload reconnected:', data);
      if (data.uploadId === uploadIdRef.current) {
        setProcessingProgress(data.progress);
        setProcessingStep(data.status);
        
        if (data.status === 'complete') {
          setSuccess('Upload completed while you were away!');
          setUploading(false);
          setIsProcessing(false);
        } else if (data.status === 'error') {
          setError(data.error || 'Upload failed');
          setUploading(false);
          setIsProcessing(false);
        } else {
          setUploading(true);
          setIsProcessing(true);
        }
      }
    });

    return () => {
      socket.disconnect();
      setUploadSocket(null);
      setIsConnected(false);
    };
  }, []);

  // ✅ Function to start upload tracking
  const startUploadTracking = (uploadId: string, userId?: string) => {
    if (!uploadSocket || !isConnected) {
      console.warn('Socket not connected, cannot start upload tracking');
      return false;
    }

    uploadIdRef.current = uploadId;
    
    // ✅ Join upload room for real-time updates
    uploadSocket.emit('join-upload-room', {
      uploadId,
      userId: userId || 'anonymous'
    });

    console.log(`🎯 Started tracking upload: ${uploadId}`);
    return true;
  };

  // ✅ Function to stop upload tracking
  const stopUploadTracking = () => {
    if (uploadIdRef.current && uploadSocket) {
      uploadSocket.emit('leave-upload-room', {
        uploadId: uploadIdRef.current
      });
      uploadIdRef.current = '';
    }
  };

  return { 
    uploadSocket, 
    uploadIdRef, 
    isConnected,
    startUploadTracking,
    stopUploadTracking
  };
}