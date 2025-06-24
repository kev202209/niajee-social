import React from 'react';
import { FiUpload, FiSmartphone, FiX } from 'react-icons/fi';

interface VideoUploaderProps {
  videoPreview: string;
  handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  contentType: 'video' | 'short';
  uploading: boolean;
  clearVideo: () => void;
}

export default function VideoUploader({
  videoPreview,
  handleVideoChange,
  contentType,
  uploading,
  clearVideo
}: VideoUploaderProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        {contentType === 'short' ? 'Short Video File' : 'Video File'} *
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
            {contentType === 'short' ? (
              <FiSmartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            ) : (
              <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            )}
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose {contentType} file
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {contentType === 'short' 
                ? 'MP4, MOV vertical video up to 100MB and 60 seconds'
                : 'MP4, MOV, AVI up to 500MB'
              }
            </p>
          </label>
        </div>
      ) : (
        <div className="relative">
          <video
            src={videoPreview}
            controls
            className={`w-full object-cover rounded-lg bg-black ${
              contentType === 'short' ? 'h-80' : 'h-64'
            }`}
          />
          {!uploading && (
            <button
              type="button"
              onClick={clearVideo}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}