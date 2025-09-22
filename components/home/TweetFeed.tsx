import { Post} from "@/types/post.types";
import { FC, useEffect, useState, useCallback } from "react";
import AuthenticatedImage from "@/components/Image";
import TweetFeedSkeleton from "./TweetFeedSkeleton";
import { FiMessageCircle, FiRepeat, FiHeart, FiBookmark, FiShare, FiRefreshCw, FiImage, FiPlay, FiBarChart } from "react-icons/fi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import timeAgo from "@/utils/timeAgo";
import { getImageSrc } from '@/utils/imageUtils';

const TweetFeed: FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api_link = process.env.NEXT_PUBLIC_API_URL;

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${api_link}/posts/feed`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        setError("Failed to load community feed");
        return;
      }

      const data = await response.json();
      const posts = Array.isArray(data.posts) ? data.posts as Post[] : [];

      setPosts(posts);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error fetching posts", message);
      setError("Something went wrong while loading the feed");
    } finally {
      setIsLoading(false);
    }
  }, [api_link]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const handleRetry = () => {
    fetchPosts();
  };

  // Helper function to get media icon
  const getMediaIcon = (post: Post) => {
    if (!post.media || post.media.length === 0) return null;
    
    const firstMedia = post.media[0];
    switch (firstMedia.type) {
      case 'video':
        return <FiPlay className="w-3 h-3" />;
      case 'image':
        return <FiImage className="w-3 h-3" />;
      default:
        return <FiImage className="w-3 h-3" />;
    }
  };

  // Loading state
  if (isLoading) {
    return <TweetFeedSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <aside className="w-80 bg-gray-100 dark:bg-gray-900 h-screen pt-16 fixed right-0 top-0 p-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 truncate">
          Community Feed
        </h2>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] space-y-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm"
            >
              <FiRefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <aside className="w-80 bg-gray-100 dark:bg-gray-900 h-screen pt-16 fixed right-0 top-0 p-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 truncate">
          Community Feed
        </h2>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] space-y-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              No posts to show right now
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh Feed
            </button>
          </div>
        </div>
      </aside>
    );
  }
  
  // Success state with posts
  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 ">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Community Feed
          </h2>
          <button
            onClick={handleRetry}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
            title="Refresh feed"
          >
            <FiRefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow">
                <div className="flex">
                  <AuthenticatedImage
                    mediaKey={post.user.profilePic ? getImageSrc(post.user.profilePic, '480w') : ""}
                    alt={post.user.username}
                    width={32}
                    height={32}
                    className="rounded-full h-8 w-8 flex-shrink-0"
                    fallbackSrc="/placeholder.png"
                  />
                  <div className="ml-2 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 min-w-0">
                        <span
                          className="font-semibold text-gray-900 dark:text-gray-100 truncate text-xs"
                          title={post.user.displayName}
                          aria-label={post.user.displayName}
                        >
                          {post.user.displayName}
                        </span>
                        {post.user.verified && (
                          <RiVerifiedBadgeFill
                            className="w-3.5 h-3.5 text-blue-500 ml-1 flex-shrink-0"
                            title="Verified account"
                          />
                        )}
                        <span
                          className="text-gray-600 dark:text-gray-400 truncate text-xs"
                          title={`@${post.user.username}`}
                          aria-label={`@${post.user.username}`}
                        >
                          @{post.user.username}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2 whitespace-nowrap">
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    
                    <a
                      href={`${process.env.NEXT_PUBLIC_FRONTEND_B_URL}/${post.user.username}/status/${post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p className="text-gray-900 dark:text-gray-100 text-xs mt-1 line-clamp-2">
                        {post.content}
                      </p>
                    </a>

                    {/* Media indicator - just show icon and count */}
                    {post.media && post.media.length > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1">
                          {getMediaIcon(post)}
                          {post.media.length > 1 ? `${post.media.length} items` : '1 item'}
                        </span>
                      </div>
                    )}

                    {/* Poll indicator */}
                    {post.poll && (
                      <div className="mt-1">
                        <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <FiBarChart className="w-3 h-3" />
                          Poll • {post.poll.totalVotes} votes
                        </span>
                      </div>
                    )}

                    {/* Community badge */}
                    {post.community && (
                      <div className="mt-1 inline-block">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                          {post.community.name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 gap-1">
                      <button 
                        className={`flex items-center gap-1 ${post.replyCount > 0 ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'}`} 
                        title="Comment"
                      >
                        <FiMessageCircle className="w-3 h-3" />
                        {post.replyCount > 0 && (
                          <span className="text-xs">{post.replyCount}</span>
                        )}
                      </button>
                      <button 
                        className={`flex items-center gap-1 ${post.isReposted ? 'text-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-green-500'}`} 
                        title="Repost"
                      >
                        <FiRepeat className="w-3 h-3" />
                        {post.repostCount > 0 && (
                          <span className="text-xs">{post.repostCount}</span>
                        )}
                      </button>
                      <button 
                        className={`flex items-center gap-1 ${post.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`} 
                        title="Like"
                      >
                        <FiHeart className="w-3 h-3" />
                        {post.likeCount > 0 && (
                          <span className="text-xs">{post.likeCount}</span>
                        )}
                      </button>
                      <button 
                        className={`flex items-center gap-1 ${post.isSaved ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'}`}
                        title="Save"
                      >
                        <FiBookmark className="w-3 h-3" />
                        {post.saveCount > 0 && (
                          <span className="text-xs">{post.saveCount}</span>
                        )}
                      </button>
                      <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500" title="Share">
                        <FiShare className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TweetFeed;