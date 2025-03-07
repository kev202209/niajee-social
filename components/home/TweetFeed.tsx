import { Tweet } from "@/types";
import { FC } from "react";
import Image from "next/image";
import { FiMessageCircle, FiRepeat, FiHeart, FiEye, FiBookmark, FiShare } from "react-icons/fi";



const TweetFeed: FC = () => {
    const tweets: Tweet[] = [
      {
        id: 1,
        profilePic: "/placeholder.png",
        username: "Mosaic",
        handle: "@mosaic",
        content: "Excited about the new Mosaic update!",
      },
      {
        id: 2,
        profilePic: "/placeholder.png",
        username: "Mosaic",
        handle: "@mosaic",
        content: "Loving the seamless integration of long videos and shorts.",
      },
      {
        id: 3,
        profilePic: "/placeholder.png",
        username: "Mosaic",
        handle: "@mosaic",
        content: "The best super app experience ever!",
      },
    ];
  
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
                      {/* <span className="text-xs">Reply</span> */}
                    </button>
                    <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-green-500">
                      <FiRepeat className="mr-1" />
                      {/* <span className="text-xs">Retweet</span> */}
                    </button>
                    <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500">
                      <FiHeart className="mr-1" />
                      {/* <span className="text-xs">Like</span> */}
                    </button>
                    <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-purple-500">
                      <FiEye className="mr-1" />
                      {/* <span className="text-xs">Views</span> */}
                    </button>
                    <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-yellow-500">
                      <FiBookmark className="mr-1" />
                      {/* <span className="text-xs">Bookmark</span> */}
                    </button>
                    <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500">
                      <FiShare className="mr-1" />
                      {/* <span className="text-xs">Share</span> */}
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