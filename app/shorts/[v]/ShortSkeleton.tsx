import React from 'react';

const ShortsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="hidden md:block fixed top-0 left-0 h-full w-16 bg-gray-200 dark:bg-gray-800" />

      {/* Header Skeleton */}
      <div className="h-16 bg-gray-200 dark:bg-gray-800 fixed top-0 left-0 right-0 z-50" />

      {/* Main Content */}
      <div className="pt-16 flex justify-center">
        <div className="w-full max-w-[500px] relative">
          {/* Video Area */}
          <div className="h-[200vh] w-full relative">
            {/* Current Video Skeleton */}
            <div className="relative h-screen flex items-center justify-center">
              <div className="aspect-[9/16] w-full max-w-[calc(85vh*9/16)] h-[85vh] bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto" />
              {/* Actions Bar Skeleton */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full"
                  />
                ))}
              </div>
              {/* Channel & Caption Skeleton */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-transparent pointer-events-none">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="ml-2 h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="ml-4 h-6 w-16 bg-red-300 dark:bg-red-700 rounded" />
                </div>
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
            {/* Next Video Preview Skeleton */}
            <div className="h-screen flex items-center justify-center">
              <div className="aspect-[9/16] w-full max-w-[calc(85vh*9/16)] h-[85vh] bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto" />
            </div>
          </div>
        </div>
      </div>
      {/* Navigation arrows skeleton (optional, for large screens) */}
      <div className="hidden lg:flex absolute left-4 top-1/2 transform -translate-y-1/2 flex-col items-center space-y-4 z-10">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
      </div>
    </div>
  );
};

export default ShortsSkeleton;