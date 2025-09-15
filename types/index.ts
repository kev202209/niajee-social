import { Post } from './post.types'

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  job: string | null;
  website: string | null;
  profilePic: ProcessedImage | null;
  bannerPic: ProcessedImage | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  posts: Post[];
  likes: Like[];
  saves: SavedPosts[];
  followers: Follow[];
  followings: Follow[];
}

export interface Video {
  id: string;
  videoId: string;
  videoUrl: {
    [quality: string]: string; // e.g., "360p", "720p", "1080p"
  };
  thumbnail: ProcessedImage;
  title: string;
  description: string;
  duration: number;
  views: number;
  likes: number;
  dislikes: number;
  createdAt: string;
  channel: {
    id: string;
    name: string;
    avatar: ProcessedImage;
    verified: boolean;
    handle: string;
  };
}

export interface Short {
  id: string;
  title: string;
  videoUrl: {
    [quality: string]: string; // e.g., "240p", "360p", "master"
  };
  thumbnailUrl?: ProcessedImage;
  duration?: number; // Made optional since it's missing from your data
  views: number;
  likes: number;
  createdAt: string;
  channel: {
    id?: string; // Made optional
    name: string;
    avatar: ProcessedImage | null;
    verified: boolean;
    monetized?: boolean; // Added for your data
    handle?: string; // Made optional since it's missing from your data
  };
  // Additional short-specific fields
  caption?: string;
  tags?: string[];
  mentions?: string[];
  location?: string;
  allowComments?: boolean;
  allowLikes?: boolean;
  allowDuet?: boolean;
  isPublic?: boolean;
  isSensitive?: boolean;
  age?: string; // Added for your data
}

export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar: ProcessedImage | string; // Allow both types for compatibility
  verified: boolean;
  description?: string;
  subscriberCount?: number;
  videoCount?: number;
  createdAt?: string;
  viewCount?: number;
}

// Add new interfaces that were inline
export interface ChannelStats {
  subscriberCount?: number;
  videoCount?: number;
  shortCount?: number;
  isSubscribed?: boolean;
}

export interface MediaItem {
  id: string;
  thumbnail: ProcessedImage | string; // Allow both types
  title: string;
  views?: number;
  publishedAt?: string;
  duration?: string; // videos only
}

export interface ChannelOverview {
  stats?: ChannelStats;
  videos?: MediaItem[];
  shorts?: MediaItem[];
}

export interface UploadItem {
  id: string;
  uploadId: string;
  title: string;
  description: string;
  contentType: 'video' | 'short';
  processingStatus: 'processing' | 'complete' | 'failed' | 'queued';
  processingProgress: number;
  thumbnail?: ProcessedImage | string; // Allow both types
  duration?: number;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  r2Key?: string;
  videoId?: string;
  shortId?: string;
  errorMessage?: string;
}

export interface AnalyticsData {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  averageViewDuration: number;
  topVideos: Array<{
    id: string;
    title: string;
    views: number;
    thumbnail: ProcessedImage | string; // Allow both types
  }>;
  recentActivity: Array<{
    date: string;
    views: number;
    subscribers: number;
  }>;
}

export interface RawAnalyticsResponse {
  success?: boolean;
  data?: {
    totalViews?: number;
    totalSubscribers?: number;
    totalVideos?: number;
    averageViewDuration?: number;
    topVideos?: Array<{
      id: string;
      title: string;
      views: number;
      thumbnail: string;
    }>;
    recentActivity?: Array<{
      date: string;
      views: number;
      subscribers: number;
    }>;
  };
  message?: string;
}

export interface mVideo {
  id: string;
  title: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  videoUrl: {
    '240p': string;
    '360p': string;
    '480p': string;
    '720p': string;
    '1080p': string;
    [key: string]: string;
  };
  videoSrc?: string; // For backward compatibility
  thumbnailUrl: ProcessedImage;
  duration: number;
  fileSize: number;
  resolution: string;
  isLiked: boolean
  isSaved: boolean
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  isPublic: boolean;
  allowComments: boolean;
  allowLikes: boolean;
  category: string;
  language: string;
  masterPlaylist?: string;
  monetization: {
    enabled: boolean;
    channelMonetized: boolean;
    contentMonetized: boolean;
  };
  createdAt: string;
  updatedAt: string;
  channel: {
    id: string;
    name: string;
    avatar: ProcessedImage;
    verified: boolean;
    monetized: boolean;
    followerCount: number;
    isFollowed: true,
    handle: string;
  };
}

// Update SuggestedVideo to extend from mVideo
export interface SuggestedVideo extends Omit<mVideo, 'videoUrl'> {
  videoSrc: string;
  channelName: string;
  channelAvatar: ProcessedImage;
  likes: number;
  views: string;
  uploadDate: string;
  duration: number;
  thumbnailUrl: ProcessedImage;
  age: string
}

export interface Comment {
  id: string;
  content: string;
  videoId: string;
  parentId?: string | null;
  user: {
    id: string;
    username: string;
    displayName?: string;
    profilePic?: ProcessedImage;
  };
  likeCount: number;
  dislikeCount: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  repliesCount?: number;
}

export interface CreateCommentDto {
  text: string;
  videoId: string;
  parentId?: string;
}

export interface Follow {
  id: number;
  createdAt: Date;
  followerId: string;
  followingId: string;
  follower: User;
  following: User;
}


export interface Like {
  id: number;
  createdAt: Date;
  userId: string;
  postId: number;
  user: User;
  post: Post;
}

export interface SavedPosts {
  id: number;
  createdAt: Date;
  userId: string;
  postId: number;
  user: User;
  post: Post;
}

export interface DetailedChannel {
  id: string;
  name: string;
  handle: string; // New field - @channelname
  description: string | null; // Can be null
  ownerId: string; // New field
  
  // Channel branding
  avatar: ProcessedImage | null; // Changed from logoUrl
  banner: ProcessedImage | null; // Changed from bannerUrl
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
  } | null;
  
  // Channel stats
  subscriberCount: number | null;
  videoCount: number | null;
  viewCount: number | null;
  
  // Channel settings
  isPublic: boolean | null;
  isVerified: boolean | null;
  isMonetized: boolean | null;
  allowComments: boolean | null;
  
  // Channel metadata
  category: string | null;
  country: string | null;
  language: string | null;
  
  // Social links
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    discord?: string;
  } | null;
  
  // Channel keywords/tags
  keywords?: string[] | null;
  
  // Moderation
  isActive: boolean | null;
  isSuspended: boolean | null;
  suspensionReason: string | null;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Optional fields for UI
  isSubscribed?: boolean;
  hasJoined?: boolean;
}

// Add this interface for the content structure
interface ContentData {
  time: number;
  blocks: BlockData[];
  version: string;
}

interface BlockData {
  id: string;
  type: 'paragraph' | 'header' | 'list' | 'code' | 'image';
  data: {
    text?: string;
    level?: number;
    style?: 'ordered' | 'unordered';
    items?: string[];
    code?: string;
    src?: string;
    alt?: string;
    alignment?: 'left' | 'center' | 'right';
  };
  tunes?: {
    alignment?: 'left' | 'center' | 'right';
  };
}

// New type for processed images
export interface ProcessedImage {
  width: number;
  height: number;
  format: string;
  variants: {
    '480w': string;
    '720w': string;
    '1080w': string;
  };
  originalKey: string;
  processedAt: string;
  thumbnailKey: string;
}

// Utility function to safely get image src
export const getImageSrcSafe = (
  image: ProcessedImage | string | null | undefined,
  variant: '480w' | '720w' | '1080w' = '480w'
): string => {
  if (!image) return '';
  
  if (typeof image === 'string') {
    return image;
  }
  
  if (typeof image === 'object' && image.variants) {
    return image.variants[variant] || image.originalKey || '';
  }
  
  return '';
};

export * from './blog.types';
export * from './post.types';
