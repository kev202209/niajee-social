'use client';

import { useState} from 'react';
import { FiX, FiCheck, FiLoader } from 'react-icons/fi';

interface UploadNotificationProps {
  isVisible: boolean;
  uploadProgress: number;
  processingProgress: number;
  isProcessing: boolean;
  processingStep: string;
  contentType: 'video' | 'short';
  onClose: () => void;
  onViewProgress: () => void;
}

export default function UploadNotification({
  isVisible,
  uploadProgress,
  processingProgress,
  isProcessing,
  processingStep,
  contentType,
  onClose,
  onViewProgress
}: UploadNotificationProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible) return null;

  const progress = isProcessing ? processingProgress : uploadProgress;
  const isComplete = processingStep === 'complete';

  return (
    <div className={`fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-40 transition-all duration-300 ${
      isMinimized ? 'w-64' : 'w-80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <FiCheck className="w-4 h-4 text-green-500" />
          ) : (
            <FiLoader className="w-4 h-4 animate-spin text-blue-500" />
          )}
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {isComplete 
              ? `${contentType === 'short' ? 'Short' : 'Video'} uploaded!`
              : `Uploading ${contentType}...`
            }
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <span className="text-xs">−</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-3">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>
                {isProcessing ? 'Processing' : 'Uploading'}: {progress}%
              </span>
              {isProcessing && (
                <span className="text-purple-600 dark:text-purple-400">
                  Step: {processingStep}
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isProcessing 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600' 
                    : 'bg-blue-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onViewProgress}
              className="flex-1 px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
            >
              View Details
            </button>
            {isComplete && (
              <button
                onClick={onClose}
                className="flex-1 px-3 py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}