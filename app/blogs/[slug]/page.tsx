"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/watch/Header';
import Sidebar from '@/components/watch/Sidebar';
import BlogComments from '../components/BlogComments';
import RelatedBlogs from '../components/RelatedBlogs';
import BlogActions from '../components/BlogActions';
import BlogSkeleton from '../components/BlogSkeleton';
import { Blog, BlogComment } from '@/types';
import { FiClock, FiEye, FiCalendar, FiUser, FiTag, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  useEffect(() => {
    if (blog) {
      fetchComments();
      fetchRelatedBlogs();
    }
  }, [blog]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/slug/${slug}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Blog not found');
        } else {
          throw new Error('Failed to fetch blog');
        }
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setBlog(data.data);
        // Update page title
        document.title = `${data.data.title} | Mosaic Social`;
      } else {
        throw new Error(data.message || 'Failed to fetch blog');
      }
    } catch (err: any) {
      console.error('Error fetching blog:', err);
      setError(err.message || 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!blog) return;
    
    try {
      setCommentsLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blog.id}/comments?page=1&limit=50`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComments(data.data.comments || []);
        }
      }
    } catch (err: any) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchRelatedBlogs = async () => {
    if (!blog) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs?category=${blog.category}&limit=4`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter out current blog
          const filtered = data.data.blogs?.filter((b: Blog) => b.id !== blog.id) || [];
          setRelatedBlogs(filtered.slice(0, 3));
        }
      }
    } catch (err: any) {
      console.error('Error fetching related blogs:', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: blog?.title,
      text: blog?.excerpt,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast notification here
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <Sidebar isOpen={false} onClose={() => {}} />
        
        <div className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              {/* Back button skeleton */}
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
              
              {/* Title skeleton */}
              <div className="space-y-3 mb-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
              
              {/* Meta info skeleton */}
              <div className="flex space-x-6 mb-8">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
              
              {/* Image skeleton */}
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-8" />
              
              {/* Content skeleton */}
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <Sidebar isOpen={false} onClose={() => {}} />
        
        <div className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {error === 'Blog not found' ? 'Blog Not Found' : 'Something went wrong'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error === 'Blog not found' 
                  ? 'The blog you\'re looking for doesn\'t exist.' 
                  : 'We encountered an error while loading the blog.'}
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Go Back
                </button>
                <Link
                  href="/blogs"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Blogs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Sidebar isOpen={false} onClose={() => {}} />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-0">
              {/* Category Badge */}
              <div className="mb-4">
                <Link
                  href={`/blogs?category=${blog.category}`}
                  className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {blog.category}
                </Link>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {blog.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {blog.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Image
                      src={blog.author.profilePic || '/default-avatar.png'}
                      alt={blog.author.displayName}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    {blog.author.verified && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/profile/${blog.author.username}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {blog.author.displayName}
                  </Link>
                </div>

                <div className="flex items-center space-x-1">
                  <FiCalendar className="w-4 h-4" />
                  <span>{format(new Date(blog.publishedAt || blog.createdAt), 'MMM dd, yyyy')}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <FiClock className="w-4 h-4" />
                  <span>{blog.readTime} min read</span>
                </div>

                <div className="flex items-center space-x-1">
                  <FiEye className="w-4 h-4" />
                  <span>{blog.views.toLocaleString()} views</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <BlogActions blog={blog} />
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <FiShare2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {blog.featuredImage && !imageError && (
              <div className="px-6 mb-6">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={blog.featuredImage}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="px-6 pb-6">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <FiTag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blogs?tag=${tag}`}
                      className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Series Navigation */}
            {blog.series && (
              <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                    Part of the series: {blog.series.title}
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    This is part {blog.series.order} of the series.
                  </p>
                </div>
              </div>
            )}
          </article>

          {/* Comments Section */}
          <div className="mt-8">
            <BlogComments
              blogId={blog.id}
              comments={comments}
              loading={commentsLoading}
              onCommentAdded={fetchComments}
            />
          </div>

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <div className="mt-12">
              <RelatedBlogs blogs={relatedBlogs} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}