'use client';

import React, { useState, useEffect, FC } from 'react';
import { useParams } from 'next/navigation';
import { Channel } from '@/types';
import { FiUpload, FiPlay, FiX, FiLoader, FiCheck, FiImage } from 'react-icons/fi';

interface UploadForm {
  title: string;
  description: string;
  tags: string[];
  category: string;
  visibility: 'public' | 'unlisted' | 'private';
  thumbnail?: File;
  video?: File;
}

const ChannelUploadPage: FC = () => {
  const params = useParams();
  const channelId = params.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [form, setForm] = useState<UploadForm>({
    title: '',
    description: '',
    tags: [],
    category: '',
    visibility: 'public',
  });
  
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [currentTag, setCurrentTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Music', 'Sports', 
    'Technology', 'Comedy', 'News', 'Lifestyle', 'Travel', 'Other'
  ];

  useEffect(() => {
    fetchChannel();
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setChannel(data.channel || data);
      } else {
        setError('Failed to load channel data');
      }
    } catch (error) {
      console.error('Error fetching channel:', error);
      setError('Failed to load channel data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        setError('Video file size must be less than 500MB');
        return;
      }
      
      setForm(prev => ({ ...prev, video: file }));
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      
      // Auto-generate title from filename if empty
      if (!form.title) {
        const filename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setForm(prev => ({ ...prev, title: filename }));
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.video) {
      setError('Please select a video file');
      return;
    }
    
    if (!form.title.trim()) {
      setError('Please enter a video title');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', form.video);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('visibility', form.visibility);
      formData.append('tags', JSON.stringify(form.tags));
      formData.append('channelId', channelId);
      
      if (form.thumbnail) {
        formData.append('thumbnail', form.thumbnail);
      }

      // Simulate upload progress (replace with actual upload logic)
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setSuccess('Video uploaded successfully!');
          // Reset form
          setForm({
            title: '',
            description: '',
            tags: [],
            category: '',
            visibility: 'public',
          });
          setVideoPreview('');
          setThumbnailPreview('');
        } else {
          setError('Failed to upload video');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Upload failed. Please try again.');
        setUploading(false);
      });

      // Replace with your actual upload endpoint
      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload`);
      xhr.setRequestHeader('credentials', 'include');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      setError('Something went wrong. Please try again.');
      setUploading(false);
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
          Upload Video
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your content with the world
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Video Upload */}
          <div className="space-y-6">
            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Video File *
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
                    <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choose video file
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      MP4, MOV, AVI up to 500MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-64 object-cover rounded-lg bg-black"
                  />
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => {
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

            {/* Thumbnail Upload */}
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
          </div>

          {/* Right Column - Video Details */}
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
                placeholder="Enter video title"
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {form.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Tell viewers about your video"
                rows={4}
                maxLength={5000}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {form.description.length}/5000 characters
              </p>
            </div>

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

            {/* Tags */}
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
                  onKeyPress={handleKeyPress}
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
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Uploading video...
              </span>
              <span className="text-sm text-blue-600 dark:text-blue-300">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
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
            onClick={() => window.history.back()}
            disabled={uploading}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !form.video || !form.title.trim()}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FiUpload className="w-4 h-4" />
                Upload Video
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChannelUploadPage;