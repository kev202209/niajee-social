"use client"; // Client Component for interactivity

import { useState } from "react";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiShare,
  FiDownload,
  FiSave,
  FiMoreVertical,
} from "react-icons/fi";
import { mVideo as Video } from "../../../types";

export default function VideoPlayer({ video }: { video: Video }) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  return (
    <>
      <div className="bg-black aspect-video rounded overflow-hidden">
        <video src={video.videoSrc} controls className="w-full h-full" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-bold line-clamp-2">{video.title}</h1>
        <div className="flex items-center gap-2">
          <img
            src={video.channelAvatar}
            alt="Channel"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{video.channelName}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded">Join</button>
            <button className="px-3 py-1 bg-red-600 text-white rounded">Subscribe</button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1">
            <FiThumbsUp className="w-5 h-5" />
            <span>{video.likes}</span>
          </button>
          <button className="flex items-center space-x-1">
            <FiThumbsDown className="w-5 h-5" />
          </button>
          <button className="flex items-center space-x-1">
            <FiShare className="w-5 h-5" />
            <span>Share</span>
          </button>
          <button className="flex items-center space-x-1">
            <FiDownload className="w-5 h-5" />
            <span>Download</span>
          </button>
          <button className="flex items-center space-x-1">
            <FiSave className="w-5 h-5" />
            <span>Save</span>
          </button>
          <button className="flex items-center space-x-1">
            <FiMoreVertical className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {video.views} views · {video.uploadDate}
        </div>
        <div>
          <p className={`text-sm ${!descriptionExpanded ? "line-clamp-3" : ""}`}>
            {video.description}
          </p>
          <button
            onClick={() => setDescriptionExpanded((prev) => !prev)}
            className="text-blue-500 text-sm"
          >
            {descriptionExpanded ? "Show less" : "Show more"}
          </button>
        </div>
      </div>
    </>
  );
}