"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Blog } from '@/types';
import { FiHeart, FiMessageCircle, FiEye, FiClock, FiBookmark, FiShare2, FiStar } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface BlogCardProps {
  blog: Blog;
  featured?: boolean;
}

export default function BlogCard({ blog, featured = false }: BlogCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(blog.isLiked || false);
  const [isSaved, setIsSaved] = useState(blog.isSaved || false);
  const [likeCount, setLikeCount] = useState(blog.likes);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blog.id}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blog.id}/save`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error('Error saveing blog:', error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: `${window.location.origin}/blogs/${blog.slug}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/blogs/${blog.slug}`);
    }
  };

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <article className={`group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col ${
        featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
      }`}>
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <FiStar className="w-3 h-3 mr-1" />
            Featured
          </div>
        )}

        {/* Featured Image */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
          {blog.featuredImage && !imageError ? (
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 dark:text-gray-500">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
            {blog.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Author Info */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="relative">
              <Image
                src={blog.author.profilePic || '/default-avatar.png'}
                alt={blog.author.displayName}
                width={24}
                height={24}
                className="rounded-full"
              />
              {blog.author.verified && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {blog.author.displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(blog.publishedAt || blog.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3 flex-1">
            {blog.excerpt}
          </p>

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {blog.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
              {blog.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{blog.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            {/* Stats */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FiEye className="w-4 h-4" />
                <span>{blog.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiClock className="w-4 h-4" />
                <span>{blog.readTime} min</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 p-1 rounded transition-colors ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </button>
              
              <div className="flex items-center space-x-1 text-gray-400">
                <FiMessageCircle className="w-4 h-4" />
                <span>{blog.comments}</span>
              </div>
              
              <button
                onClick={handleSave}
                className={`p-1 rounded transition-colors ${
                  isSaved 
                    ? 'text-blue-500 hover:text-blue-600' 
                    : 'text-gray-400 hover:text-blue-500'
                }`}
              >
                <FiBookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FiShare2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}