// components/VideoMeta.tsx
'use client';
import React, { useState } from 'react';
import { FiThumbsUp, FiThumbsDown, FiShare, FiDownload, FiSave, FiMoreVertical } from 'react-icons/fi';
import { mVideo as Video } from '../../types';

export default function VideoMeta({ video }: { video: Video }) {
  const [descExpanded, setDescExpanded] = useState(false);
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold line-clamp-2">{video.title}</h1>
      <div className="flex items-center gap-2">
        <img src={video.channelAvatar} alt="Channel" className="w-10 h-10 rounded-full" />
        <p className="font-semibold">{video.channelName}</p>
        <div className="ml-auto flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded">Join</button>
          <button className="px-3 py-1 bg-red-600 text-white rounded">Subscribe</button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-1"><FiThumbsUp /><span>{video.likes}</span></button>
        <button className="flex items-center space-x-1"><FiThumbsDown /></button>
        <button className="flex items-center space-x-1"><FiShare /><span>Share</span></button>
        <button className="flex items-center space-x-1"><FiDownload /><span>Download</span></button>
        <button className="flex items-center space-x-1"><FiSave /><span>Save</span></button>
        <button className="flex items-center space-x-1"><FiMoreVertical /></button>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{video.views} views · {video.uploadDate}</div>
      <div>
        <p className={`text-sm ${!descExpanded? 'line-clamp-3':''}`}>{video.description}</p>
        <button onClick={() => setDescExpanded(prev => !prev)} className="text-blue-500 text-sm">{descExpanded?'Show less':'Show more'}</button>
      </div>
    </div>
  );
}