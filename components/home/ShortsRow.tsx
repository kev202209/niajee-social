import { FiFilm } from "react-icons/fi"; // add this import along with your others
import { Short } from "../../types";
import { FC, useRef } from "react";
import ShortCard from "./ShortCard";

const ShortsRow: FC<{ shorts: Short[] }> = ({ shorts }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSeeMore = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: containerRef.current.clientWidth, // scroll one container width
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="h-fit flex flex-col pt-3"> {/* Fixed overall height */}
      {/* Header with title and see more button */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <FiFilm className="text-xl text-gray-900 dark:text-gray-100" />
          <span className="font-bold text-gray-900 dark:text-gray-100">Shorts</span>
        </div>
        <button
          onClick={handleSeeMore}
          className="text-blue-500 font-semibold"
        >
          See more
        </button>
      </div>
      {/* Horizontally scrollable container for short cards */}
      <div ref={containerRef} className="overflow-x-auto mt-2 flex-grow">
        <div className="flex space-x-4">
          {shorts.map((short) => (
            <ShortCard key={short.id} short={short} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortsRow;