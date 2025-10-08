import Link from "next/link";
import { Blog } from "@/types";

interface RelatedBlogsProps {
  blogs: Blog[];
}

export default function RelatedBlogs({ blogs }: RelatedBlogsProps) {
  return (
    <div className="w-full">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Related Blogs
      </h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blogs/${blog.slug}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition min-w-0"
          >
            <div className="font-bold text-base sm:text-lg mb-1 text-gray-900 dark:text-white line-clamp-2 break-words">
              {blog.title}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2 break-words">
              {blog.excerpt}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {Array.isArray(blog.category) ? blog.category[0] : blog.category}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}