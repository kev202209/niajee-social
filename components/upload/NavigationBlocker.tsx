'use client';

import { useEffect, useState } from 'react';

interface NavigationBlockerProps {
  when: boolean;
  message?: string;
  onBeforeUnload?: () => void;
  allowNavigation?: () => boolean;
}

export default function NavigationBlocker({ 
  when, 
  message = 'Your upload is in progress. Are you sure you want to leave? The upload will continue in the background.',
  onBeforeUnload,
  allowNavigation
}: NavigationBlockerProps) {
  const [showModal, setShowModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (when) {
        e.preventDefault();
        e.returnValue = message;
        onBeforeUnload?.();
        return message;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (when && !allowNavigation?.()) {
        e.preventDefault();
        setShowModal(true);
        setPendingNavigation(window.location.pathname);
      }
    };

    if (when) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [when, message, onBeforeUnload, allowNavigation]);

  const handleStayOnPage = () => {
    setShowModal(false);
    setPendingNavigation(null);
  };

  const handleLeavePage = () => {
    setShowModal(false);
    if (pendingNavigation) {
      window.history.pushState(null, '', pendingNavigation);
    }
    setPendingNavigation(null);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upload in Progress
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleStayOnPage}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Stay on Page
          </button>
          <button
            onClick={handleLeavePage}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Leave Page
          </button>
        </div>
      </div>
    </div>
  );
}