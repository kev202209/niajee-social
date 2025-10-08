'use client';

import React, { useState, useEffect, FC, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Channel } from '@/types';
import { FiBookmark, FiTrash2, FiUpload, FiLoader } from 'react-icons/fi';
import Image from 'next/image';
import AuthenticatedImage from "@/components/Image";
import { getImageSrc } from '@/utils/imageUtils';

const ChannelSettingsPage: FC = () => {
  const params = useParams();
  const channelId = params.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    isPublic: true,
    allowComments: true,
  });

  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Music', 'Sports', 
    'Technology', 'Comedy', 'News', 'Lifestyle', 'Travel', 'Other'
  ];

  const fetchChannel = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const channelData = data.channel || data;
        setChannel(channelData);
        setForm({
          name: channelData.name || '',
          description: channelData.description || '',
          category: channelData.category || '',
          isPublic: channelData.isPublic ?? true,
          allowComments: channelData.allowComments ?? true,
        });
        if (channelData.avatar) {
          setAvatarPreview(`${process.env.NEXT_PUBLIC_API_URL}/uploads/channels/${channelData.avatar}`);
        }
      } else {
        setError('Failed to load channel data');
      }
    } catch (error) {
      console.error('Error fetching channel:', error);
      setError('Failed to load channel data');
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // NEW: Handle avatar upload using presigned URL
  const uploadAvatar = async (file: File): Promise<boolean> => {
    try {
      setUploadingAvatar(true);
      
      // 1. Get presigned URL
      const presignedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/presigned-upload`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'avatar',
          fileName: file.name,
          channelId: channelId
        })
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get presigned URL');
      }

      const { s3Key, presignedUrl } = await presignedResponse.json();

      // 2. Upload to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      // 3. Start processing
      const processResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/start-image-processing`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: channelId,
          type: 'avatar',
          s3Key: s3Key
        })
      });

      if (!processResponse.ok) {
        throw new Error('Failed to start image processing');
      }

      return true;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Upload avatar first if there's a new one
      if (newAvatar) {
        await uploadAvatar(newAvatar);
      }

      // Update channel data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          isPublic: form.isPublic,
          allowComments: form.allowComments,
        }),
      });

      if (response.ok) {
        setSuccess('Channel updated successfully!');
        setNewAvatar(null);
        fetchChannel(); // Refresh channel data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update channel');
      }
    } catch (error) {
      console.error('Error updating channel:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!confirm('Are you sure you want to delete this channel? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = '/create/channels';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete channel');
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
      setError('Failed to delete channel');
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
    // Updated root container: Responsive padding
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Updated header: Responsive text */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Channel Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Manage your channel information and preferences
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Avatar: Smaller on mobile */}
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
              {uploadingAvatar ? (
                <FiLoader className="w-8 h-8 text-white animate-spin" />
              ) : avatarPreview ? (
                avatarPreview.startsWith("data:") ? (
                  // Local preview for newly selected file
                  <Image
                    src={avatarPreview}
                    alt="Channel avatar"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  // Existing avatar from backend
                  <AuthenticatedImage
                    mediaKey={channel?.avatar ? getImageSrc(channel.avatar, '480w'): undefined}
                    alt="Channel avatar"
                    fill
                    className="object-cover"
                    sizes="96px"
                    fallbackSrc="/placeholder.png"
                  />
                )
              ) : (
                <FiUpload className="w-8 h-8 text-white" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={uploadingAvatar}
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {uploadingAvatar ? 'Uploading avatar...' : 'Click to change channel avatar'}
          </p>
        </div>

        {/* Channel Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Channel Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Channel Handle (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Channel Handle
          </label>
          <input
            type="text"
            value={channel.handle}
            readOnly
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Channel handle cannot be changed
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
            rows={3}
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
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
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Settings */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Privacy & Comments</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Public Channel
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Anyone can find and view your channel
              </p>
            </div>
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={form.isPublic}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="allowComments" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Allow Comments
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Viewers can comment on your videos
              </p>
            </div>
            <input
              type="checkbox"
              id="allowComments"
              name="allowComments"
              checked={form.allowComments}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {error && (
          <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving || uploadingAvatar}
          className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {saving ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiBookmark className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400 mb-3 sm:mb-4">Danger Zone</h3>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Delete Channel</h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Once you delete your channel, there is no going back. This will permanently delete your channel and all associated content.
          </p>
          <button
            onClick={handleDeleteChannel}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete Channel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelSettingsPage;