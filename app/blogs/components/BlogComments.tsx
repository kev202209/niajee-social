import { useState } from "react";
import { BlogComment } from "@/types";

interface BlogCommentsProps {
  blogId: string;
  comments: BlogComment[];
  loading?: boolean;
  onCommentAdded?: () => void;
}

export default function BlogComments({ blogId, comments, loading, onCommentAdded }: BlogCommentsProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    // TODO: Replace with your API call
    setTimeout(() => {
      setSubmitting(false);
      setComment("");
      onCommentAdded?.();
    }, 1000);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Comments</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Add a comment..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          disabled={submitting}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={submitting || !comment.trim()}
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </form>
      {loading ? (
        <div>Loading comments...</div>
      ) : (
        <ul className="space-y-4">
          {comments.length === 0 && <li className="text-gray-500">No comments yet.</li>}
          {comments.map((c) => (
            <li key={c.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="text-sm font-medium">{c.author?.displayName || "User"}</div>
              <div className="text-gray-700 dark:text-gray-300">{c.content}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}