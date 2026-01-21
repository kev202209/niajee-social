'use client';

import React from 'react';
import Link from 'next/link';
import { FiX, FiHeart, FiMessageCircle, FiBookmark, FiShare2 } from 'react-icons/fi';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'like' | 'comment' | 'save' | 'share';
}

const getActionContent = (actionType: string) => {
  const contentMap: Record<string, { title: string; message: string; icon: React.ReactNode }> = {
    like: {
      title: 'Like this video?',
      message: 'Sign in to like videos and show creators what you love.',
      icon: <FiHeart className="w-8 h-8" />,
    },
    comment: {
      title: 'Join the conversation',
      message: 'Sign in to leave comments and engage with the community.',
      icon: <FiMessageCircle className="w-8 h-8" />,
    },
    save: {
      title: 'Save for later',
      message: 'Sign in to save your favorite videos and build your collection.',
      icon: <FiBookmark className="w-8 h-8" />,
    },
    share: {
      title: 'Share with others',
      message: 'Sign in to share videos and build your audience.',
      icon: <FiShare2 className="w-8 h-8" />,
    },
  };

  return contentMap[actionType] || contentMap.like;
};

const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  actionType,
}) => {
  if (!isOpen) return null;

  const { title, message, icon } = getActionContent(actionType);

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-blue-600 dark:text-blue-400">
              {icon}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              onClick={onClose}
              className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              onClick={onClose}
              className="block w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors text-center"
            >
              Create Account
            </Link>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                or
              </span>
            </div>
          </div>

          {/* Continue Browsing */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={onClose}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Continue browsing
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default AuthRequiredModal;
