import { Blog } from "@/types";
import { useState } from "react";
import { FiHeart, FiBookmark, FiFlag } from "react-icons/fi";

interface BlogActionsProps {
  blog: Blog;
}

export default function BlogActions({ blog }: BlogActionsProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <button
        className={`flex items-center gap-1 ${liked ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        onClick={() => setLiked((v) => !v)}
        aria-label="Like"
      >
        <FiHeart className="w-5 h-5" />
        <span>{liked ? "Liked" : "Like"}</span>
      </button>
      <button
        className={`flex items-center gap-1 ${bookmarked ? "text-yellow-500" : "text-gray-500 dark:text-gray-400"}`}
        onClick={() => setBookmarked((v) => !v)}
        aria-label="Bookmark"
      >
        <FiBookmark className="w-5 h-5" />
        <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
      </button>
      <button
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400"
        aria-label="Report"
        onClick={() => alert("Report functionality not implemented")}
      >
        <FiFlag className="w-5 h-5" />
        <span>Report</span>
      </button>
    </div>
  );
}