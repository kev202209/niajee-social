import { Tweet } from "@/types";
import { FC, useEffect, useState } from "react";
import Image from "next/image";
import TweetFeedSkeleton from "./TweetFeedSkeleton";
import { FiMessageCircle, FiRepeat, FiHeart, FiBookmark, FiShare, FiRefreshCw } from "react-icons/fi";
import timeAgo from "@/app/utils/timeAgo";

const TweetFeed: FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api_link = process.env.NEXT_PUBLIC_API_URL;

  const fetchTweets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('-------Fetching tweets...');
      const response = await fetch(`${api_link}/posts/feed`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log('-------Fetched tweets:', data);
        
        // Handle the new API response structure
        const posts = data.posts || [];
        const transformedTweets: Tweet[] = posts.map((item: any) => ({
          id: item.id,
          content: item.content,
          username: item.user?.username || "Anonymous",
          displayName: item.user?.displayName || "@unknown", // Fixed property name
          profilePic: item.user?.profilePic ?? "/placeholder.png",
          createdAt: item.createdAt,
          likeCount: item.likeCount,
          replyCount: item.replyCount,
          repostCount: item.repostCount,
          saveCount: item.saveCount,
          // These properties are missing from API response, so default to false
          isLiked: false,
          isSaved: false,
          isReposted: false
        }));
        setTweets(transformedTweets);
      } else {
        setError("Failed to load community feed");
        console.error("Failed to fetch tweets");
      }
    } catch (error) {
      setError("Something went wrong while loading the feed");
      console.error("Error fetching tweets", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleRetry = () => {
    fetchTweets();
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
  if (tweets.length === 0) {
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
  
  // Success state with tweets
  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
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
            {tweets.map((tweet) => (
              <li key={tweet.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow">
                <div className="flex">
                  <Image
                    src={tweet.profilePic}
                    alt={tweet.username}
                    width={32}
                    height={32}
                    className="rounded-full h-8 w-8 flex-shrink-0"
                  />
                  <div className="ml-2 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 truncate text-xs">
                          {tweet.displayName}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 truncate flex-shrink-0 text-xs">
                          @{tweet.username}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {tweet.createdAt && timeAgo(tweet.createdAt)}
                      </span>
                    </div>
                    <a href={`${process.env.NEXT_PUBLIC_FRONTEND_B_URL}/${tweet.username}/status/${tweet.id}`}>
                    <p className="text-gray-900 dark:text-gray-100 text-xs mt-1 line-clamp-2">
                      {tweet.content}
                    </p>
                    </a>
                    <div className="flex items-center justify-between mt-2 gap-1">
                      <button 
                        className={`flex items-center gap-1 ${tweet.replyCount > 0 ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'}`} 
                        title="Comment"
                      >
                        <FiMessageCircle className="w-3 h-3" />
                        {tweet.replyCount > 0 && (
                          <span className="text-xs">{tweet.replyCount}</span>
                        )}
                      </button>
                      <button 
                        className={`flex items-center gap-1 ${tweet.isReposted ? 'text-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-green-500'}`} 
                        title="Retweet"
                      >
                        <FiRepeat className="w-3 h-3" />
                        {tweet.repostCount > 0 && (
                          <span className="text-xs">{tweet.repostCount}</span>
                        )}
                      </button>
                      <button 
                        className={`flex items-center gap-1 ${tweet.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`} 
                        title="Like"
                      >
                        <FiHeart className="w-3 h-3" />
                        {tweet.likeCount > 0 && (
                          <span className="text-xs">{tweet.likeCount}</span>
                        )}
                      </button>
                      <button 
                        className={`flex items-center gap-1 ${tweet.isSaved ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'}`}
                        title="Bookmark"
                      >
                        <FiBookmark className="w-3 h-3" />
                        {tweet.saveCount > 0 && (
                          <span className="text-xs">{tweet.saveCount}</span>
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