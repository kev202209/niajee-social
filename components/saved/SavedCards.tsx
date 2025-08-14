//// filepath: e:\projects\full projects\mosaic-social\components\saves\SaveUnifiedCards.tsx
'use client';
import { FiX } from 'react-icons/fi';
import VideoCard from '@/components/home/VideoCard';
import ShortCard from '@/components/home/ShortCard';
import BlogCard from '@/components/blog/BlogCard';
import type { Video, Short, Blog } from '@/types';
import React from 'react';

/*
  Generic wrappers that re-use existing cards (VideoCard / ShortCard / BlogCard)
  Adds a small remove (unsave) button – avoids duplicate markup.
*/

interface Base {
  id: string;
  type: 'video' | 'short' | 'blog';
  data: any;
  onRemove: () => void;
}

export function SaveVideo({ data, onRemove }: { data: any; onRemove: () => void }) {
  // Adapt save video shape to VideoCard expected shape (VideoCard uses video.videoId)
  const adapted: Video = {
    ...(data as any),
    videoId: data.id || data.videoId,
  };
  return (
    <div className="relative group">
      <VideoCard video={adapted} />
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 bg-red-600/90 hover:bg-red-600 text-white rounded-full p-1 transition"
        aria-label="Remove save"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
}

export function SaveShort({ data, onRemove }: { data: any; onRemove: () => void }) {
  const adapted: Short = {
    ...(data as any),
    id: data.id,
  };
  return (
    <div className="relative group">
      <ShortCard short={adapted} />
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 bg-red-600/90 hover:bg-red-600 text-white rounded-full p-1 transition"
        aria-label="Remove save"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
}

export function SaveBlog({ data, onRemove }: { data: any; onRemove: () => void }) {
  const adapted: Blog = {
    ...(data as any),
  };
  return (
    <div className="relative group">
      <BlogCard blog={adapted} />
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 bg-red-600/90 hover:bg-red-600 text-white rounded-full p-1 transition"
        aria-label="Remove save"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
}