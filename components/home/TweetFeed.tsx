import { Tweet } from "@/types";
import { FC, useEffect, useState } from "react";
import Image from "next/image";
import TweetFeedSkeleton from "./TweetFeedSkeleton";
import { FiMessageCircle, FiRepeat, FiHeart, FiBookmark, FiShare } from "react-icons/fi";
import timeAgo from "@/app/utils/timeAgo";

const TweetFeed: FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const api_link = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        console.log('-------Fetching tweets...');
        const response = await fetch(`${api_link}/posts/feed`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          console.log('-------Fetched tweets:', data);
          const transformedTweets: Tweet[] = data.map((item: any) => ({
            id: item._id,
            content: item.content,
            username: item.user?.username || "Anonymous",
            displayname: item.user?.displayName || "@unknown",
            profilePic: item.user?.profilePic ?? "/placeholder.png",
            createdAt: item.createdAt,
            likeCount: item.likeCount,
            replyCount: item.replyCount,
            repostCount: item.repostCount,
            saveCount: item.saveCount,
            isLiked: item.isLiked,
            isSaved: item.isSaved,
            isReposted: item.isReposted
          }));
          setTweets(transformedTweets);
        } else {
          console.error("Failed to fetch tweets");
        }
      } catch (error) {
        console.error("Error fetching tweets", error);
      }
    };
  
    fetchTweets();
  }, []);
  
  return tweets.length === 0 ? (
    <TweetFeedSkeleton />
  ) : (
      <aside className="w-80 bg-gray-100 dark:bg-gray-900 h-screen pt-16 fixed right-0 top-0 p-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 truncate">
          Community Feed
        </h2>
        <ul className="space-y-3 h-[calc(100vh-8rem)] overflow-y-auto">
          {tweets.map((tweet) => (
            <li key={tweet.id} className="bg-white dark:bg-gray-800 rounded shadow p-2 max-h-[180px]">
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
                  <p className="text-gray-900 dark:text-gray-100 text-xs mt-1 line-clamp-2">
                    {tweet.content}
                  </p>
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
      </aside>
    );
};

export default TweetFeed;