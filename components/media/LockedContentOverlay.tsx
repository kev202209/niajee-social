'use client';

import React from 'react';
import { FiLock } from 'react-icons/fi';
import Link from 'next/link';

interface LockedContentOverlayProps {
  channelId: string;
  channelName: string;
  requiredTier?: string | null;
  tierName?: string;
  contentType?: 'video' | 'short';
  className?: string;
}

export default function LockedContentOverlay({
  channelId,
  channelName,
  requiredTier,
  tierName,
  contentType = 'video',
  className = '',
}: LockedContentOverlayProps) {
  return (
    <div
      className={`absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-10 ${className}`}
      onClick={(e) => e.preventDefault()}
    >
      {/* Lock Icon */}
      <div className="mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
          <FiLock className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white text-lg font-semibold mb-2 text-center px-4">
        Members Only
      </h3>

      {/* Description */}
      <p className="text-gray-300 text-sm text-center mb-1 px-4 max-w-xs">
        This {contentType} is exclusive to {channelName} members
      </p>

      {/* Tier requirement if specified */}
      {requiredTier && tierName && (
        <p className="text-blue-400 text-xs text-center mb-4 px-4">
          Requires: {tierName} tier
        </p>
      )}

      {/* CTA Button */}
      <Link
        href={`/channels/${channelId}?tab=membership`}
        onClick={(e) => e.stopPropagation()}
        className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        Join Membership
      </Link>

      {/* Additional Info */}
      <p className="text-gray-400 text-xs mt-3 text-center px-4">
        Get access to exclusive content and perks
      </p>
    </div>
  );
}
