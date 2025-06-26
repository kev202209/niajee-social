export default function BlogSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
      
      {/* Content skeleton */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Author info skeleton */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
        </div>
        
        {/* Title skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-2 mb-3 flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex space-x-2 mb-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-14" />
        </div>
        
        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
          </div>
          <div className="flex space-x-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}