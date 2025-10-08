'use client';

import React, { useState, useRef, useEffect, FC } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import Image from 'next/image';

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
  const [isHandleManuallyEdited, setIsHandleManuallyEdited] = useState(false);
  
  // Use ref to manage timeout for debouncing
  const handleCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Music', 'Sports', 
    'Technology', 'Comedy', 'News', 'Lifestyle', 'Travel', 'Other'
  ];

  // Generate handle from name
  const generateHandleFromName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '') // Remove spaces and special characters
      .substring(0, 20); // Limit to 20 characters
  };

  const checkHandleAvailability = async (handle: string) => {
    if (!handle || handle.length < 3) {
      setHandleAvailable(null);
      return;
    }

    setHandleChecking(true);
    try {
      const formattedHandle = handle.startsWith('@') ? handle : `@${handle}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/check-handle/${encodeURIComponent(formattedHandle)}`,
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

  // Debounced handle checking
  const debouncedCheckHandle = (handle: string) => {
    // Clear existing timeout
    if (handleCheckTimeoutRef.current) {
      clearTimeout(handleCheckTimeoutRef.current);
    }

    // Set new timeout
    handleCheckTimeoutRef.current = setTimeout(() => {
      checkHandleAvailability(handle);
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      if (name === 'name') {
        // Update the name
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Auto-generate handle from name only if handle hasn't been manually edited
        if (!isHandleManuallyEdited) {
          const generatedHandle = generateHandleFromName(value);
          setForm(prev => ({ ...prev, handle: generatedHandle }));
          
          // Check availability of generated handle if it's long enough
          if (generatedHandle.length >= 3) {
            debouncedCheckHandle(generatedHandle);
          } else {
            setHandleAvailable(null);
          }
        }
      } else if (name === 'handle') {
        // Mark handle as manually edited
        setIsHandleManuallyEdited(true);
        
        // Update handle
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Check availability when handle is manually changed
        if (value.length >= 3) {
          debouncedCheckHandle(value);
        } else {
          setHandleAvailable(null);
        }
      } else {
        // For other fields
        setForm(prev => ({ ...prev, [name]: value }));
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

  // Handle avatar upload using presigned URL
  const uploadAvatar = async (channelId: string, file: File): Promise<boolean> => {
    try {
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
      // 1. Create channel first (without avatar)
      const formattedHandle = form.handle.startsWith('@') ? form.handle : `@${form.handle}`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          handle: formattedHandle,
          description: form.description,
          category: form.category,
          isPublic: form.isPublic,
          allowComments: form.allowComments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create channel');
        return;
      }

      const data = await response.json();
      const channelId = data.id;

      // 2. Upload avatar if provided
      if (form.avatar) {
        try {
          await uploadAvatar(channelId, form.avatar);
        } catch (error) {
          console.error('Error uploading avatar:', error);
          // Don't fail the whole process if avatar upload fails
        }
      }

      // 3. Navigate to channel overview
      router.push(`/create/channels/${channelId}`);
    } catch (error) {
      console.error('Error creating channel:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (handleCheckTimeoutRef.current) {
        clearTimeout(handleCheckTimeoutRef.current);
      }
    };
  }, []);

  return (
    // Updated root container: Responsive padding
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Updated header: Responsive text */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Channel
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Set up your channel to start sharing content with the world
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Avatar Upload: Smaller on mobile */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Channel avatar"
                  fill
                  className="object-cover"
                  sizes="96px"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.png';
                  }}
                />
              ) : (
                <FiUpload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center px-4">
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
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your handle will be automatically generated from this name
          </p>
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
              className={`w-full pl-8 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors text-sm sm:text-base ${
                form.handle && handleAvailable === false 
                  ? 'border-red-500 dark:border-red-400' 
                  : form.handle && handleAvailable === true
                  ? 'border-green-500 dark:border-green-400'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
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
          
          {/* Handle feedback: Responsive text */}
          <div className="mt-2 space-y-1">
            {form.handle && handleChecking && (
              <div className="flex items-center space-x-2">
                <FiLoader className="w-3 h-3 text-blue-500 animate-spin" />
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Checking availability...
                </p>
              </div>
            )}
            
            {form.handle && !handleChecking && handleAvailable === false && (
              <div className="flex items-center space-x-2">
                <FiX className="w-3 h-3 text-red-500" />
                <p className="text-xs text-red-600 dark:text-red-400 line-clamp-2">
                  Handle &quot;@{form.handle}&quot; is not available. Try a different one.
                </p>
              </div>
            )}
            
            {form.handle && !handleChecking && handleAvailable === true && (
              <div className="flex items-center space-x-2">
                <FiCheck className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-600 dark:text-green-400">
                  Handle &quot;@{form.handle}&quot; is available!
                </p>
              </div>
            )}
            
            {form.handle && !handleChecking && handleAvailable === null && form.handle.length < 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Handle must be at least 3 characters long
              </p>
            )}
            
            {!form.handle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your unique channel handle (e.g., @amazingchannel)
              </p>
            )}
            
            {!isHandleManuallyEdited && form.handle && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 Auto-generated from your channel name. You can edit this handle to customize it.
              </p>
            )}
            
            {isHandleManuallyEdited && (
              <div className="flex items-center space-x-1">
                <span className="text-xs">✏️</span>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Great! You&apos;ve customized your handle.
                </p>
              </div>
            )}
          </div>
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
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
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
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Settings: Responsive padding */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Channel Settings</h3>
          
          <div className="flex items-center justify-between p-3 sm:p-0">
            <div className="flex-1">
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
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
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 ml-4 flex-shrink-0"
            />
          </div>

          <div className="flex items-center justify-between p-3 sm:p-0">
            <div className="flex-1">
              <label htmlFor="allowComments" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
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
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 ml-4 flex-shrink-0"
            />
          </div>
        </div>

        {/* Error Message: Responsive padding */}
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm line-clamp-2">{error}</p>
          </div>
        )}

        {/* Submit Button: Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:flex-1 px-4 py-3 sm:px-6 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || handleAvailable === false || !form.handle || form.handle.length < 3}
            className="w-full sm:flex-1 px-4 py-3 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
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