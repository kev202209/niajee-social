"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { JSX } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/home/Header';
import Sidebar from '@/components/home/Sidebar';
import BlogComments from '@/components/blog/BlogComments';
import RelatedBlogs from '@/components/blog/RelatedBlogs';
import BlogActions from '@/components/blog/BlogActions';
import { Blog, BlogComment } from '@/types';
import { FiClock, FiEye, FiCalendar, FiTag, FiArrowLeft, FiShare2, FiExternalLink, FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedImage from "@/components/Image";
import { getImageSrc } from '@/utils/imageUtils';

// Block content renderer component
interface BlockData {
  id?: string;
  type: string;
  data?: unknown;
}

// Added helper narrow types (no logic change)
interface ImageBlockFile { url?: string }
interface LinkToolMetaImage { url?: string }
interface LinkToolMeta { title?: string; description?: string; image?: LinkToolMetaImage }
interface TableBlockData { content?: unknown[] }
interface EditorJsLike { blocks?: BlockData[] }

// Block content renderer component
const BlockRenderer = ({ block }: { block: BlockData }) => {
  const { type, data } = block;
  const d = data as Record<string, unknown> | undefined;

  switch (type) {
    case 'paragraph':
      return (
        <p className="mb-4 text-gray-800 dark:text-gray-200 leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: String((d?.text as string) || '') }} />
        </p>
      );

    case 'header':
      {
        const level = typeof d?.level === 'number' ? d.level : 2;
        const headerClasses = {
          1: "text-4xl font-bold mb-6 mt-8 text-gray-900 dark:text-white",
          2: "text-3xl font-bold mb-5 mt-7 text-gray-900 dark:text-white",
          3: "text-2xl font-semibold mb-4 mt-6 text-gray-900 dark:text-white",
          4: "text-xl font-semibold mb-3 mt-5 text-gray-900 dark:text-white",
          5: "text-lg font-medium mb-3 mt-4 text-gray-900 dark:text-white",
          6: "text-base font-medium mb-2 mt-3 text-gray-900 dark:text-white"
        } as const;

        // Use React.createElement with intrinsic tag name to avoid JSX children typing issues
        const tagName = (`h${level}`) as keyof JSX.IntrinsicElements;
        return React.createElement(tagName, {
          className: headerClasses[level as keyof typeof headerClasses] || headerClasses[2],
          dangerouslySetInnerHTML: { __html: String((d?.text as string) || '') }
        });
      }

    case 'list':
      const style = d?.style === 'ordered' ? 'ordered' : 'unordered';
      const ListTag = style === 'ordered' ? 'ol' : 'ul';
      const listClasses = style === 'ordered' 
        ? "list-decimal list-inside mb-4 space-y-2 text-gray-800 dark:text-gray-200" 
        : "list-disc list-inside mb-4 space-y-2 text-gray-800 dark:text-gray-200";
      const items = Array.isArray(d?.items) ? (d?.items as unknown[]) : [];
       
      return (
        <ListTag className={listClasses}>
          {items.map((item, index) => {
            const it = item as Record<string, unknown>;
            const subItems = Array.isArray(it?.items) ? (it.items as unknown[]) : [];
            return (
             <li key={index} className="leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: String((it?.content as string) || item as string || '') }} />
              {subItems.length > 0 && (
                 <ListTag className={`${listClasses} mt-2 ml-4`}>
                  {subItems.map((subItem, subIndex) => {
                    const sit = subItem as Record<string, unknown>;
                    return (
                      <li key={subIndex} className="leading-relaxed">
                        <span dangerouslySetInnerHTML={{ __html: String((sit?.content as string) || subItem as string || '') }} />
                      </li>
                    );
                  })}
                 </ListTag>
               )}
             </li>
          );})}
        </ListTag>
      );

    case 'checklist':
      return (
        <div className="mb-4 space-y-2">
          {Array.isArray(d?.items) && (d?.items as unknown[]).map((item, index) => {
            const it = item as Record<string, unknown>;
            const checked = Boolean(it?.checked);
            return (
            <div key={index} className="flex items-start space-x-3">
               <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                checked 
                   ? 'bg-blue-500 border-blue-500 text-white' 
                   : 'border-gray-300 dark:border-gray-600'
               }`}>
                {checked && <FiCheck className="w-3 h-3" />}
               </div>
               <span 
                 className={`flex-1 leading-relaxed ${
                  checked 
                     ? 'text-gray-500 dark:text-gray-400 line-through' 
                     : 'text-gray-800 dark:text-gray-200'
                 }`}
                dangerouslySetInnerHTML={{ __html: String((it?.text as string) || '') }}
               />
             </div>
          );})}
         </div>
       );
 
    case 'code':
      return (
        <div className="mb-6">
          <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
             <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
              {String((d?.code as string) || '')}
             </code>
           </pre>
         </div>
       );
 
    case 'image':
      return (
        <div className="mb-6">
          <div className="relative rounded-lg overflow-hidden">
            <AuthenticatedImage
              mediaKey={String(((d?.file as ImageBlockFile | undefined)?.url) || d?.url || '')}
              alt={String((d?.caption as string) || 'Blog image')}
              width={800}
              height={600}
              className="w-full h-auto"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
              fallbackSrc="/placeholder.png"
            />
          </div>
          {typeof (d?.caption) === 'string' && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 italic">
              {String(d?.caption)}
            </p>
          )}
        </div>
      );
 
    case 'simpleImage':
      return (
        <div className="mb-6">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={String(d?.url || '')}
              alt={String((d?.caption as string) || 'Blog image')}
               width={800}
               height={600}
               className="w-full h-auto"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
               priority={false}
               onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 target.src = '/placeholder-image.png';
               }}
             />
           </div>
          {typeof d?.caption === 'string' && (
             <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 italic">
              {d?.caption as string}
             </p>
           )}
        </div>
      );
 
    case 'linkTool':
      return (
        <div className="mb-6">
          <a
            href={String(d?.link || '#')}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <div className="flex items-start space-x-4">
              {(d?.meta as LinkToolMeta | undefined)?.image?.url && (
                <div className="flex-shrink-0 relative">
                  <Image
                    src={String((d?.meta as LinkToolMeta | undefined)?.image?.url)}
                    alt=""
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover"
                    sizes="64px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-link.png';
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                  {String((d?.meta as LinkToolMeta | undefined)?.title || d?.link || '')}
                  <FiExternalLink className="w-4 h-4 ml-2 text-gray-400" />
                </h3>
                {(d?.meta as LinkToolMeta | undefined)?.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {String((d?.meta as LinkToolMeta | undefined)?.description)}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {(() => {
                    try {
                      return new URL(String(d?.link || '')).hostname;
                    } catch {
                      return '';
                    }
                  })()}
                </p>
              </div>
            </div>
          </a>
        </div>
      );
 
    case 'embed':
      return (
        <div className="mb-6">
           <div 
             className="embed-container"
            dangerouslySetInnerHTML={{ __html: String((d?.embed as string) || '') }}
           />
          {typeof (d?.caption) === 'string' && (
             <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 italic">
              {String(d?.caption)}
             </p>
           )}
         </div>
       );
 
    case 'table':
      return (
        <div className="mb-6 overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
            <tbody>
              {Array.isArray((d as TableBlockData | undefined)?.content) &&
                (((d as TableBlockData)?.content as unknown[]) || []).map((row, rowIndex) => (
                  Array.isArray(row) ? (
                    <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                      {(row as unknown[]).map((cell, cellIndex) => {
                        const CellTag = rowIndex === 0 ? 'th' : 'td';
                        return (
                          <CellTag
                            key={cellIndex}
                            className={`border border-gray-200 dark:border-gray-700 px-4 py-2 text-left ${
                              rowIndex === 0
                                ? 'font-semibold text-gray-900 dark:text-white'
                                : 'text-gray-800 dark:text-gray-200'
                            }`}
                            dangerouslySetInnerHTML={{ __html: String(cell || '') }}
                          />
                        );
                      })}
                    </tr>
                  ) : null
                ))}
            </tbody>
          </table>
        </div>
      );
 
    case 'delimiter':
      return (
        <div className="my-8 text-center">
          <div className="text-gray-400 dark:text-gray-500 text-2xl tracking-widest">
             ***
          </div>
        </div>
       );
 
    case 'raw':
      return (
        <div className="mb-6">
          <div dangerouslySetInnerHTML={{ __html: String((d?.html as string) || '') }} />
         </div>
       );
 
    default:
      // Fallback for unknown block types
      return (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Unknown block type: <code className="font-mono">{type}</code>
          </p>
          <pre className="mt-2 text-xs text-yellow-700 dark:text-yellow-300 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
};

// Content renderer component
const ContentRenderer = ({ content }: { content: unknown }) => {
  // Handle different content formats
  if (!content) {
    return <p className="text-gray-500 dark:text-gray-400">No content available.</p>;
  }

  // If content is a string, try to parse it as JSON
  let blocks: BlockData[] = [];
  
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      blocks = Array.isArray(parsed) ? parsed : [];
    } catch {
      // If parsing fails, treat as HTML
      return (
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
  } else if (Array.isArray(content)) {
    // Content is already an array of blocks
    blocks = content;
  } else if (
    typeof content === 'object' &&
    content !== null &&
    'blocks' in (content as EditorJsLike) &&
    Array.isArray((content as EditorJsLike).blocks)
  ) {
    // Content is Editor.js format with blocks property
    blocks = (content as EditorJsLike).blocks || [];
  } else {
    // Unknown format, try to display as JSON
    return (
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Raw content:</p>
        <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    );
  }

  // Render blocks
  return (
    <div className="space-y-0">
      {blocks.map((block, index) => (
        <BlockRenderer key={block.id || index} block={block} />
      ))}
    </div>
  );
};

export default function BlogDetailPage() {
   const params = useParams();
   const router = useRouter();
  //  const { user } = useAuth();
   useAuth();
   const slug = params.slug as string;
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);



  const normalizeBlog = (raw: unknown): Blog => {
    const b = (raw as Record<string, unknown>) || {};
    const rawCat = b.category;
    const rawTags = b.tags;
    const category = Array.isArray(rawCat)
      ? rawCat as string[]
      : typeof rawCat === 'string'
        ? rawCat.replace(/[{}"]/g, '').split(',').map(s => s.trim()).filter(Boolean)
        : [];
    const tags = Array.isArray(rawTags)
      ? rawTags as string[]
      : typeof rawTags === 'string'
        ? rawTags.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    // cast via unknown to satisfy TypeScript when converting a generic record to Blog
    return { ...(b as unknown as Blog), category, tags };
  };

  const fetchBlog = useCallback(async () => {
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
        setBlog(normalizeBlog(data.data));
        // Update page title
        document.title = `${data.data.title} | Niajee Social`;
      } else {
        throw new Error(data.message || 'Failed to fetch blog');
      }
    } catch (err: unknown) {
      console.error('Error fetching blog:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchComments = useCallback(async () => {
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
    } catch (err: unknown) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  }, [blog]);

  const fetchRelatedBlogs = useCallback(async () => {
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
    } catch (err: unknown) {
      console.error('Error fetching related blogs:', err);
    }
  }, [blog]);

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

    useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug, fetchBlog]);

  useEffect(() => {
    if (blog) {
      fetchComments();
      fetchRelatedBlogs();
    }
  }, [blog, fetchComments, fetchRelatedBlogs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
        
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
        <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
        
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
                  ? 'The blog you&apos;re looking for doesn&apos;t exist.' 
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
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      
      <div className="pt-16">
        {/* Updated container: Responsive padding */}
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 py-8">
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
            <div className="p-4 sm:p-6 pb-0">
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {blog.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {blog.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <AuthenticatedImage
                      mediaKey={getImageSrc(blog.author.profilePic, '480w') || ""}
                      alt={blog.author.displayName}
                      width={32}
                      height={32}
                      className="rounded-full object-cover w-8 h-8"
                      fallbackSrc="/placeholder.png"
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
                  <span>{blog.estimatedReadTime ?? 0} min read</span>
                </div>

                <div className="flex items-center space-x-1">
                  <FiEye className="w-4 h-4" />
                  <span>{blog.viewCount?.toLocaleString() ?? 0} {blog.viewCount === 1 ? 'view': 'views'}</span>
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
              <div className="px-4 sm:px-6 mb-6">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <AuthenticatedImage
                    mediaKey={getImageSrc(blog.featuredImage, '1080w')}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    fallbackSrc="/placeholder.png"
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="px-4 sm:px-6 pb-6">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ContentRenderer content={blog.content} />
              </div>
            </div>

            {/* Tags */}
            {(() => {
              // blog.tags can be string | string[] (per types). Normalize to string[] safely.
              const normalizedTags: string[] = Array.isArray(blog.tags)
                ? blog.tags
                : typeof blog.tags === 'string'
                ? blog.tags.split(',').map(s => s.trim()).filter(Boolean)
                : [];

              if (normalizedTags.length === 0) return null;

              return (
                <div className="px-4 sm:px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiTag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {normalizedTags.map(tag => (
                      <Link
                        key={tag}
                        href={`/blogs?tag=${encodeURIComponent(tag)}`}
                        className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Series Navigation */}
            {blog.series && (
              <div className="px-4 sm:px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
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