import { Tweet } from "@/types";
import { FC, useEffect, useState } from "react";
import Image from "next/image";
import TweetFeedSkeleton from "./TweetFeedSkeleton";
import { FiMessageCircle, FiRepeat, FiHeart, FiEye, FiBookmark, FiShare } from "react-icons/fi";

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
            content: item.desc,
            username: item.user?.firstName + ' ' + item.user?.lastName || "Anonymous",
            handle: item.user?.username || "@unknown",
            profilePic: item.user?.profilePic ?? "/placeholder.png"
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
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 truncate text-xs">
                      {tweet.username}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 truncate flex-shrink-0 text-xs">
                      @{tweet.handle}
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 text-xs mt-1 line-clamp-2">
                    {tweet.content}
                  </p>
                  <div className="flex items-center justify-between mt-2 gap-1">
                    <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500" title="Comment">
                      <FiMessageCircle className="w-3 h-3" />
                    </button>
                    <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-green-500" title="Retweet">
                      <FiRepeat className="w-3 h-3" />
                    </button>
                    <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500" title="Like">
                      <FiHeart className="w-3 h-3" />
                    </button>
                    <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-purple-500" title="Views">
                      <FiEye className="w-3 h-3" />
                    </button>
                    <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-yellow-500" title="Bookmark">
                      <FiBookmark className="w-3 h-3" />
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