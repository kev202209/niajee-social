import { useState } from 'react';
import { UploadForm } from '../../app/create/channels/[channelId]/upload/types';

interface UseFileHandlersProps {
  form: UploadForm;
  processVideoFile: (file: File) => void;
  setForm: React.Dispatch<React.SetStateAction<UploadForm>>;
  setThumbnailPreview: React.Dispatch<React.SetStateAction<string>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export function useFileHandlers({
  form,
  processVideoFile,
  setForm,
  setThumbnailPreview,
  setError
}: UseFileHandlersProps) {
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

  return {
    handleVideoChange,
    handleThumbnailChange
  };
}