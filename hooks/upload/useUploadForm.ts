import { useState } from 'react';
import { UploadForm } from '../../app/create/channels/[channelId]/upload/types';

export function useUploadForm() {
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
    isMemberOnly: false,
    requiredTierId: null,
  });

  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'requiredTierId') {
      // Handle requiredTierId specially - convert empty string to null
      setForm(prev => ({ ...prev, requiredTierId: value || null }));
    } else {
      setForm(prev => ({ ...prev, [name]: value || '' }));
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

  const clearVideo = () => {
    URL.revokeObjectURL(videoPreview);
    setVideoPreview('');
    setForm(prev => ({ ...prev, video: undefined }));
  };

  const clearThumbnail = () => {
    setThumbnailPreview('');
    setForm(prev => ({ ...prev, thumbnail: undefined }));
  };

  const addTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addMention = (mention: string) => {
    setForm(prev => ({ ...prev, mentions: [...prev.mentions, mention] }));
  };

  const removeMention = (mentionToRemove: string) => {
    setForm(prev => ({ ...prev, mentions: prev.mentions.filter(mention => mention !== mentionToRemove) }));
  };

  return {
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
  };
}