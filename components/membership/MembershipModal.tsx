'use client';

import React from 'react';
import { FiX, FiLock } from 'react-icons/fi';
import Link from 'next/link';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  channelName: string;
  requiredTier?: string | null;
  tierName?: string;
  contentType?: 'video' | 'short';
}

export default function MembershipModal({
  isOpen,
  onClose,
  channelId,
  channelName,
  requiredTier,
  tierName,
  contentType = 'video',
}: MembershipModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiLock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Membership Required
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
            This {contentType} is exclusive to <span className="font-semibold">{channelName}</span> members.
          </p>

          {/* Tier requirement */}
          {requiredTier && tierName && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                <span className="font-semibold">Required Tier:</span> {tierName}
              </p>
            </div>
          )}

          {/* Benefits preview */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Membership Benefits:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Access to exclusive content
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Support your favorite creator
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Special member perks and badges
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2">
            <Link
              href={`/channels/${channelId}?tab=membership`}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
              onClick={onClose}
            >
              View Membership Options
            </Link>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
