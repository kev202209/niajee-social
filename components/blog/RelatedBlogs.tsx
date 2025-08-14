import Link from "next/link";
import { Blog } from "@/types";

interface RelatedBlogsProps {
  blogs: Blog[];
}

export default function RelatedBlogs({ blogs }: RelatedBlogsProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Related Blogs</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blogs/${blog.slug}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition"
          >
            <div className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{blog.title}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">{blog.excerpt}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{blog.category}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}