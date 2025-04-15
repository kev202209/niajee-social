import { FC } from "react";

const SkeletonTweet = () => (
  <li className="bg-white dark:bg-gray-800 rounded shadow p-2 max-h-[180px] animate-pulse">
    <div className="flex">
      <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-8 w-8 flex-shrink-0" />
      <div className="ml-2 flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <div className="bg-gray-300 dark:bg-gray-700 h-3 w-20 rounded" />
          <div className="bg-gray-300 dark:bg-gray-700 h-3 w-12 rounded" />
        </div>
        <div className="mt-2 space-y-1">
          <div className="bg-gray-300 dark:bg-gray-700 h-3 w-full rounded" />
          <div className="bg-gray-300 dark:bg-gray-700 h-3 w-3/4 rounded" />
        </div>
        <div className="flex items-center justify-between mt-2 gap-1">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="bg-gray-300 dark:bg-gray-700 h-3 w-3 rounded"
            />
          ))}
        </div>
      </div>
    </div>
  </li>
);

const TweetFeedSkeleton: FC = () => {
  return (
    <aside className="w-80 bg-gray-100 dark:bg-gray-900 h-screen pt-16 fixed right-0 top-0 p-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 truncate">
        Community Feed
      </h2>
      <ul className="space-y-3 h-[calc(100vh-8rem)] overflow-y-auto">
        {[...Array(6)].map((_, idx) => (
          <SkeletonTweet key={idx} />
        ))}
      </ul>
    </aside>
  );
};

export default TweetFeedSkeleton;
