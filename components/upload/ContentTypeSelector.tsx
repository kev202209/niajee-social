import React from 'react';
import { FiVideo, FiSmartphone } from 'react-icons/fi';

interface ContentTypeSelectorProps {
  contentType: 'video' | 'short';
  handleContentTypeChange: (contentType: 'video' | 'short') => void;
  uploading: boolean;
}

export default function ContentTypeSelector({ 
  contentType, 
  handleContentTypeChange, 
  uploading 
}: ContentTypeSelectorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => handleContentTypeChange('video')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
            contentType === 'video'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          disabled={uploading}
        >
          <FiVideo className="w-4 h-4" />
          Long-form Video
        </button>
        <button
          type="button"
          onClick={() => handleContentTypeChange('short')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
            contentType === 'short'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          disabled={uploading}
        >
          <FiSmartphone className="w-4 h-4" />
          Short Video
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {contentType === 'short' 
          ? 'Short videos are vertical videos up to 60 seconds long, perfect for mobile viewing'
          : 'Long-form videos support all formats and can be any length'
        }
      </p>
    </div>
  );
}