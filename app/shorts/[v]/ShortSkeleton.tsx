import React from 'react';

const ShortsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-gray-200 dark:bg-gray-800 fixed top-0 left-0 right-0 z-50" />
      
      {/* Main Content */}
      <div className="pt-20 flex justify-center">
        <div className="w-full max-w-[500px] relative">
          {/* Video Container Skeleton */}
          <div className="aspect-[9/16] bg-gray-300 dark:bg-gray-700 rounded-lg" />
          
          {/* Actions Bar Skeleton */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full"
              />
            ))}
          </div>

          {/* Channel Info Skeleton */}
          <div className="absolute bottom-8 left-4 right-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortsSkeleton;