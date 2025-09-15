import { ProcessedImage } from './index';
import type { OutputData } from '@editorjs/editorjs';

// Update the Blog interface
export interface Blog {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  excerpt: string;
  content: any[]; // Editor.js blocks array
  featuredImage?: ProcessedImage | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string | null;
  viewCount: number;
  uniqueViewCount?: number;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  saveCount?: number;
  estimatedReadTime?: number;
  averageReadTime?: number;
  allowComments?: boolean;
  allowHighlighting?: boolean;
  allowResponses?: boolean;
  isMonetized?: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  category: string | string[]; // Can be a stringified array or array
  tags: string | string[];     // Can be a string or array
  topics?: string[];           // Array of topics
  seoMetadata?: Record<string, any> | null;
  customCSS?: string | null;
  isSensitive?: boolean;
  contentWarning?: string | null;
  analytics?: any;
  version?: number;
  lastEditedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    profilePic?: ProcessedImage | null;
    verified: boolean;
    bio?: string | null;
  };
  series?: {
    id: string;
    title: string;
    order: number;
  };
  channel?: any | null;
  userInteraction?: {
    liked: boolean;
    saved: boolean;
  };
}

export interface RawBlog {
  id: string;
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: ProcessedImage | null;
  authorId?: string;
  authorUsername?: string;
  authorAvatar?: string | null;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  tags?: string[];
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
  readTime?: number;
  status?: string;
  isFeatured?: boolean;
  isSensitive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface RawReport {
  id: string;
  blogId?: string;
  blogTitle?: string;
  blogAuthorName?: string;
  blogAuthorUsername?: string;
  reporterUsername?: string;
  reason?: string;
  description?: string;
  status?: 'pending' | 'reviewed' | 'resolved';
  reviewNotes?: string;
  createdAt?: string;
  reviewedAt?: string;
}

export interface BlogReport {
  id: string;
  blog: Blog;
  reporter: {
    id: string;
    name: string;
    username: string;
  };
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface BlogsManagementProps {
  userRole: string;
}

// Create/Update DTOs
export interface CreateBlogDto {
  title: string;
  subtitle?: string;
  slug?: string;
  excerpt?: string;
  content: OutputData;
  featuredImage?: File | string;
  channelId?: string;
  status?: 'draft' | 'published';
  allowComments?: boolean;
  allowHighlighting?: boolean;
  allowResponses?: boolean;
  isMonetized?: boolean;
  isPremium?: boolean;
  category?: string;
  tags?: string[];
  topics?: string[];
  seoMetadata?: Record<string, any> | null;
  customCSS?: string | null;
  isSensitive?: boolean;
  contentWarning?: string | null;
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {}

export interface CreateBlogCommentDto {
  content: string;
  parentId?: string;
}

export interface BlogFilterDto {
  category?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'latest' | 'popular' | 'trending';
  page?: number;
  limit?: number;
}

export interface BlogComment {
  id: string;
  content: string;
  highlightedText: string | null;
  highlightStartIndex: number | null;
  highlightEndIndex: number | null;
  likeCount: number;
  parentId: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    profilePic?: ProcessedImage | null;
    verified: boolean;
  };
  replies: BlogComment[];
}

export interface BlogSeriesDto {
  title: string;
  description?: string;
  slug?: string;
}

// Additional utility types for better type safety
export interface BlogListResponse {
  blogs: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogAnalytics {
  views: number;
  uniqueViews: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  averageReadTime: number;
  bounceRate: number;
  topReferrers: Array<{
    source: string;
    visits: number;
  }>;
  dailyViews: Array<{
    date: string;
    views: number;
  }>;
}

// Type guards for runtime type checking
export function isBlogArray(value: any): value is Blog[] {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && 
    typeof item.id === 'string' && 
    typeof item.title === 'string'
  );
}

export function isValidBlogStatus(status: string): status is Blog['status'] {
  return ['draft', 'published', 'archived'].includes(status);
}

// Utility types for parsing
export interface ParsedBlog extends Omit<Blog, 'content' | 'category' | 'tags'> {
  content: any[]; // Already parsed blocks
  category: string[];
  tags: string[];
}

export function parseBlogData(rawBlog: any): ParsedBlog {
  return {
    ...rawBlog,
    content: typeof rawBlog.content === 'string' ? JSON.parse(rawBlog.content) : rawBlog.content || [],
    category: typeof rawBlog.category === 'string' ? [rawBlog.category] : rawBlog.category || [],
    tags: typeof rawBlog.tags === 'string' ? rawBlog.tags.split(',') : rawBlog.tags || [],
  };
}



