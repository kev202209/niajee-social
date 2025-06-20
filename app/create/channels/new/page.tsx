'use client';

import React, { useState, FC } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiCheck, FiX, FiLoader } from 'react-icons/fi';

interface CreateChannelForm {
  name: string;
  handle: string;
  description: string;
  category: string;
  isPublic: boolean;
  allowComments: boolean;
  avatar?: File;
}

const CreateChannelPage: FC = () => {
  const router = useRouter();
  const [form, setForm] = useState<CreateChannelForm>({
    name: '',
    handle: '',
    description: '',
    category: '',
    isPublic: true,
    allowComments: true,
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Music', 'Sports', 
    'Technology', 'Comedy', 'News', 'Lifestyle', 'Travel', 'Other'
  ];

  const checkHandleAvailability = async (handle: string) => {
    if (!handle || handle.length < 3) {
      setHandleAvailable(null);
      return;
    }

    setHandleChecking(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/check-handle/${handle}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setHandleAvailable(data.available);
    } catch (error) {
      console.error('Error checking handle:', error);
      setHandleAvailable(null);
    } finally {
      setHandleChecking(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate handle from name if handle is empty
      if (name === 'name' && !form.handle) {
        const generatedHandle = value.toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 20);
        setForm(prev => ({ ...prev, handle: generatedHandle }));
      }
      
      // Check handle availability
      if (name === 'handle') {
        const timeoutId = setTimeout(() => checkHandleAvailability(value), 500);
        return () => clearTimeout(timeoutId);
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.handle) {
      setError('Channel name and handle are required');
      return;
    }

    if (handleAvailable === false) {
      setError('Handle is not available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('handle', form.handle);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('isPublic', form.isPublic.toString());
      formData.append('allowComments', form.allowComments.toString());
      
      if (form.avatar) {
        formData.append('avatar', form.avatar);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/create/channels/${data.channel.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create channel');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Channel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set up your channel to start sharing content with the world
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Channel avatar" className="w-full h-full object-cover" />
              ) : (
                <FiUpload className="w-8 h-8 text-white" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click to upload channel avatar (optional)
          </p>
        </div>

        {/* Channel Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Channel Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Enter your channel name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Channel Handle */}
        <div>
          <label htmlFor="handle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Channel Handle *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">@</span>
            </div>
            <input
              type="text"
              id="handle"
              name="handle"
              value={form.handle}
              onChange={handleInputChange}
              placeholder="channelhandle"
              className="w-full pl-8 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
            {form.handle && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {handleChecking ? (
                  <FiLoader className="w-4 h-4 text-gray-400 animate-spin" />
                ) : handleAvailable === true ? (
                  <FiCheck className="w-4 h-4 text-green-500" />
                ) : handleAvailable === false ? (
                  <FiX className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
            )}
          </div>
          {form.handle && handleAvailable === false && (
            <p className="text-sm text-red-600 mt-1">This handle is not available</p>
          )}
          {form.handle && handleAvailable === true && (
            <p className="text-sm text-green-600 mt-1">Handle is available!</p>
          )}
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
            placeholder="Tell people what your channel is about"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Channel Settings</h3>
          
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

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || handleAvailable === false}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Channel'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateChannelPage;