import { Tweet } from "@/types";
import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { FiMessageCircle, FiRepeat, FiHeart, FiEye, FiBookmark, FiShare } from "react-icons/fi";

const TweetFeed: FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tweets");
        if (response.ok) {
          const data = await response.json();
          setTweets(data.tweets);
        } else {
          console.error("Failed to fetch tweets");
        }
      } catch (error) {
        console.error("Error fetching tweets", error);
      }
    };

    fetchTweets();
  }, []);

  return (
    <aside className="w-80 bg-gray-100 dark:bg-gray-900 h-screen pt-16 fixed right-0 top-0 overflow-y-auto p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Tweets
      </h2>
      <ul className="space-y-4">
        {tweets.map((tweet) => (
          <li key={tweet.id} className="bg-white dark:bg-gray-800 rounded shadow p-3">
            <div className="flex">
              <Image
                src={tweet.profilePic}
                alt={tweet.username}
                width={40}
                height={20}
                className="rounded-full h-10"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {tweet.username}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {tweet.handle}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 text-sm mt-1">
                  {tweet.content}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500">
                    <FiMessageCircle className="mr-1" />
                  </button>
                  <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-green-500">
                    <FiRepeat className="mr-1" />
                  </button>
                  <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500">
                    <FiHeart className="mr-1" />
                  </button>
                  <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-purple-500">
                    <FiEye className="mr-1" />
                  </button>
                  <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-yellow-500">
                    <FiBookmark className="mr-1" />
                  </button>
                  <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500">
                    <FiShare className="mr-1" />
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
