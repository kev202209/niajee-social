import type { OutputData } from "@editorjs/editorjs";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  job: string | null;
  website: string | null;
  profilePic: string | null;
  cover: string | null;
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
  thumbnail: string;
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
    avatar: string;
    verified: boolean;
  };
}

export interface Short {
  id: string;
  title: string;
  videoUrl: string; // Shorts might still use a single URL
  thumbnailUrl?: string;
  duration: number;
  views: number;
  likes: number;
  createdAt: string;
  channel: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
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
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  description?: string;
  subscriberCount?: number;
  videoCount?: number;
  createdAt?: string;
}
export interface Tweet {
  id: string;
  content: string;
  username: string;
  displayName: string;
  profilePic: string;
  createdAt?: string;
  likeCount: number;
  replyCount: number;
  repostCount: number;
  saveCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isReposted: boolean;
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
  thumbnailUrl: string;
  duration: number;
  fileSize: number;
  resolution: string;
  isLiked: boolean
  isBookmarked: boolean
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
    avatar: string;
    verified: boolean;
    monetized: boolean;
    followerCount: number;
    isFollowed: true,
  };
}

// Update SuggestedVideo to extend from mVideo
export interface SuggestedVideo extends Omit<mVideo, 'videoUrl'> {
  videoSrc: string;
  channelName: string;
  channelAvatar: string;
  likes: number;
  views: string;
  uploadDate: string;
  duration: number;
  thumbnailUrl: string;
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
    profilePic?: string;
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

export interface Post {
  id: string ;
  desc: string;
  img?: string;
  imgHeight?: number;
  video?: string;
  isSensitive?: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    img?: string;
  };
  _count?: {
    likes: number;
    rePosts: number;
    comments: number;
  };
  likes?: { id: number }[];
  rePosts?: { id: number }[];
  saves?: { id: number }[];
  rePost?: Post | null;
  rePostId?: string | null;
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

export interface Follow {
  id: number;
  createdAt: Date;
  followerId: string;
  followingId: string;
  follower: User;
  following: User;
}



export interface DetailedChannel {
  id: string;
  name: string;
  handle: string; // New field - @channelname
  description: string | null; // Can be null
  ownerId: string; // New field
  
  // Channel branding
  avatar: string | null; // Changed from logoUrl
  banner: string | null; // Changed from bannerUrl
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

// Update the Blog interface
export interface Blog {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  excerpt: string;
  content: any[]; // Editor.js blocks array or [] (as in your response)
  featuredImage?: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string | null;
  viewCount: number;
  uniqueViewCount?: number;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  bookmarkCount?: number;
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
    profilePic?: string | null;
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
    bookmarked: boolean;
  };
}

// Update CreateBlogDto to use ContentData instead of OutputData
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
    profilePic?: string | null;
    verified: boolean;
  };
  replies: BlogComment[];
}
