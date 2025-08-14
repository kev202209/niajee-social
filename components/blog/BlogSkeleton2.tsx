export default function BlogSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="space-y-3 mb-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
      <div className="flex space-x-6 mb-8">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-8" />
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        ))}
      </div>
    </div>
  );
}