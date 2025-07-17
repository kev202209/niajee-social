import React from 'react';
import { FiImage, FiX } from 'react-icons/fi';
import Image from 'next/image';

interface ThumbnailUploaderProps {
  thumbnailPreview: string;
  handleThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  clearThumbnail: () => void;
}

export default function ThumbnailUploader({
  thumbnailPreview,
  handleThumbnailChange,
  uploading,
  clearThumbnail
}: ThumbnailUploaderProps) {
  return (
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
          <Image
            src={thumbnailPreview}
            alt="Thumbnail preview"
            width={400}
            height={128}
            className="w-full h-32 object-cover rounded-lg"
          />
          {!uploading && (
            <button
              type="button"
              onClick={clearThumbnail}
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