import { FC } from "react";

const SkeletonVideoCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded shadow relative animate-pulse">
    <div className="aspect-[3/2] bg-gray-300 rounded-t" />
    <div className="p-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-300" />
        <div className="h-3 w-2/3 bg-gray-300 rounded" />
        <div className="ml-auto w-4 h-4 bg-gray-300 rounded" />
      </div>
      <div className="h-2 w-1/3 bg-gray-300 rounded" />
      <div className="h-2 w-1/2 bg-gray-300 rounded" />
    </div>
  </div>
);

const SkeletonShortCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow w-40 flex-shrink-0 animate-pulse">
    <div className="aspect-[9/16] bg-gray-300 rounded-t" />
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-gray-300 rounded" />
        <div className="h-4 w-4 bg-gray-300 rounded" />
      </div>
      <div className="h-2 w-16 bg-gray-300 rounded self-end" />
    </div>
  </div>
);

const SkeletonShortsRow = () => (
  <div className="flex gap-2 overflow-x-auto py-2">
    {[...Array(6)].map((_, idx) => (
      <SkeletonShortCard key={idx} />
    ))}
  </div>
);

const MainContentSkeleton: FC = () => {
  return (
    <div className="pt-16 pb-8 px-4 flex flex-col gap-8">
      {[...Array(2)].map((_, index) => (
        <div key={index}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, idx) => (
              <SkeletonVideoCard key={idx} />
            ))}
          </div>
          <SkeletonShortsRow />
        </div>
      ))}
    </div>
  );
};

export default MainContentSkeleton;
