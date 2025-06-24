import React from 'react';
import { FiLoader, FiCheck } from 'react-icons/fi';
import { formatBytes } from '../../app/create/channels/[channelId]/upload/utils';
import { getProcessingStepStatus } from '../../app/create/channels/[channelId]/upload/utils';

interface UploadProgressProps {
  uploading: boolean;
  isProcessing: boolean;
  uploadProgress: number;
  processingProgress: number;
  processingStep: string;
  processingMessage: string;
  uploadSpeed: string;
  estimatedTime: string;
  uploadedBytes: number;
  fileSize: number;
  contentType: 'video' | 'short';
  cancelUpload: () => void;
}

export default function UploadProgress({
  uploading,
  isProcessing,
  uploadProgress,
  processingProgress,
  processingStep,
  processingMessage,
  uploadSpeed,
  estimatedTime,
  uploadedBytes,
  fileSize,
  contentType,
  cancelUpload
}: UploadProgressProps) {
  if (!uploading) return null;
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FiLoader className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {isProcessing 
              ? (processingMessage || `Processing ${contentType}...`)
              : `Uploading ${contentType}...`
            }
          </span>
        </div>
        {!isProcessing && (
          <button
            type="button"
            onClick={cancelUpload}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
          >
            Cancel
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-600 dark:text-blue-300">
            {isProcessing 
              ? `Processing... ${processingProgress}%` 
              : `${uploadProgress}% complete`
            }
          </span>
          {!isProcessing && (
            <span className="text-gray-600 dark:text-gray-400">
              {formatBytes(uploadedBytes)} / {formatBytes(fileSize)}
            </span>
          )}
        </div>
        
        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 relative overflow-hidden ${
              isProcessing 
                ? 'bg-gradient-to-r from-purple-500 to-blue-600' 
                : 'bg-blue-600'
            }`}
            style={{ 
              width: isProcessing 
                ? `${processingProgress}%` 
                : `${uploadProgress}%` 
            }}
          >
            {/* Animated gradient for active progress */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            
            {/* Processing animation */}
            {isProcessing && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ 
                  animation: 'processing 2s ease-in-out infinite',
                  transform: 'translateX(-100%)'
                }} 
              />
            )}
          </div>
        </div>
        
        {/* Upload/Processing Stats */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          {isProcessing ? (
            <>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                We are actively processing your {contentType}
              </span>
              <span className="text-purple-600 dark:text-purple-400">
                This may take a few minutes
              </span>
            </>
          ) : (
            <>
              <span>
                {uploadSpeed ? `Speed: ${uploadSpeed}/s` : 'Calculating speed...'}
              </span>
              <span>
                {estimatedTime && uploadProgress < 100 ? `ETA: ${estimatedTime}` : ''}
              </span>
            </>
          )}
        </div>
        
        {/* Real-time Processing Steps */}
        {isProcessing && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300 mb-3">
              <FiLoader className="w-3 h-3 animate-spin" />
              <span>Processing steps:</span>
            </div>
            
            <ul className="text-xs space-y-2">
              <li className="flex items-center gap-2">
                {getProcessingStepStatus('received', processingStep) === 'completed' ? (
                  <FiCheck className="w-3 h-3 text-green-500" />
                ) : getProcessingStepStatus('received', processingStep) === 'current' ? (
                  <FiLoader className="w-3 h-3 animate-spin text-blue-500" />
                ) : (
                  <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                )}
                <span className={
                  getProcessingStepStatus('received', processingStep) === 'completed' 
                    ? 'text-green-600 dark:text-green-400'
                    : getProcessingStepStatus('received', processingStep) === 'current'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400'
                }>
                  Upload completed
                </span>
              </li>
              
              <li className="flex items-center gap-2">
                {getProcessingStepStatus('processing', processingStep) === 'completed' ? (
                  <FiCheck className="w-3 h-3 text-green-500" />
                ) : getProcessingStepStatus('processing', processingStep) === 'current' ? (
                  <FiLoader className="w-3 h-3 animate-spin text-blue-500" />
                ) : (
                  <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                )}
                <span className={
                  getProcessingStepStatus('processing', processingStep) === 'completed' 
                    ? 'text-green-600 dark:text-green-400'
                    : getProcessingStepStatus('processing', processingStep) === 'current'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400'
                }>
                  {contentType === 'video' ? 'Optimizing video quality' : 'Optimizing short video'}
                </span>
              </li>
              
              <li className="flex items-center gap-2">
                {getProcessingStepStatus('thumbnail', processingStep) === 'completed' ? (
                  <FiCheck className="w-3 h-3 text-green-500" />
                ) : getProcessingStepStatus('thumbnail', processingStep) === 'current' ? (
                  <FiLoader className="w-3 h-3 animate-spin text-blue-500" />
                ) : (
                  <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                )}
                <span className={
                  getProcessingStepStatus('thumbnail', processingStep) === 'completed' 
                    ? 'text-green-600 dark:text-green-400'
                    : getProcessingStepStatus('thumbnail', processingStep) === 'current'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400'
                }>
                  Creating thumbnail
                </span>
              </li>
              
              <li className="flex items-center gap-2">
                {getProcessingStepStatus('saving', processingStep) === 'completed' ? (
                  <FiCheck className="w-3 h-3 text-green-500" />
                ) : getProcessingStepStatus('saving', processingStep) === 'current' ? (
                  <FiLoader className="w-3 h-3 animate-spin text-blue-500" />
                ) : (
                  <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                )}
                <span className={
                  getProcessingStepStatus('saving', processingStep) === 'completed' 
                    ? 'text-green-600 dark:text-green-400'
                    : getProcessingStepStatus('saving', processingStep) === 'current'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400'
                }>
                  Finalizing upload
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}