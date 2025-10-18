import React from 'react';

const ShortsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="hidden md:block fixed top-0 left-0 h-full w-16 bg-gray-200 dark:bg-gray-800" />

      {/* Header Skeleton */}
      <div className="h-16 bg-gray-200 dark:bg-gray-800 fixed top-0 left-0 right-0 z-50" />

      {/* Main Content */}
      <div className="pt-10 flex justify-center">
        <div className="h-screen overflow-hidden flex justify-center">
          <div className="h-[200vh] w-full max-w-[500px] md:max-w-[760px] relative">
            {/* Current Video */}
            <div className="relative h-screen">
              <div className="flex items-center justify-center h-full">
                {/* Video wrapper (align overlays to video bounds) */}
                <div className="relative inline-block">
                  {/* Video box */}
                  <div className="aspect-[9/16] w-full max-w-[calc(85vh*9/16)] h-[85vh] bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto" />

                  {/* Mobile: More button inside video (top-right) */}
                  <div className="absolute top-4 right-4 z-[80] md:hidden">
                    <div className="w-8 h-8 rounded-full bg-black/40" />
                  </div>

                  {/* Mobile: actions overlay on the video (right-center) */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 md:hidden flex flex-col items-center space-y-4">
                    {/* Channel Avatar */}
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    {/* Like */}
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    {/* Comment */}
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    {/* Save */}
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    {/* Share */}
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    {/* Sound disc */}
                    <div className="w-9 h-9 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  </div>
                </div>

                {/* Desktop/tablet: side column next to the video */}
                <div className="hidden md:flex flex-col h-[85vh] ml-4">
                  {/* Desktop More button above actions */}
                  <div className="self-end mb-3">
                    <div className="w-10 h-10 rounded-full bg-black/40" />
                  </div>
                  <div className="flex-1 flex items-center justify-end">
                    <div className="flex flex-col items-center space-y-4">
                      {/* Channel Avatar */}
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                      {/* Like */}
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                      {/* Comment */}
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                      {/* Save */}
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                      {/* Share */}
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                      {/* Sound disc */}
                      <div className="w-9 h-9 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation arrows (md+) */}
              <div className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 flex-col items-center space-y-4 z-30">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
              </div>

              {/* Channel & Caption Skeleton */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-transparent pointer-events-none">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="ml-2 h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>

            {/* Next Video Preview */}
            <div className="h-screen flex items-center justify-center">
              <div className="aspect-[9/16] w-full max-w-[calc(85vh*9/16)] h-[85vh] bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortsSkeleton;