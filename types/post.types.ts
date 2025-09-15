export interface ProcessedMedia {
  key: string;
  type: 'image' | 'video' | 'gif';
  width: number;
  height: number;
  format: string;
  uploadId: string;
  variants: {
    '480w': string;
    '720w': string;
    '1080w': string;
  };
  thumbnailKey: string;
  processingStatus: 'pending' | 'processing' | 'complete' | 'failed';
  duration?: number; // For videos
  size?: number; // File size in bytes
}

export interface PostUser {
  id: string;
  username: string;
  displayName: string;
  profilePic: ProcessedImage | null;
  verified: boolean;
  bio?: string | null;
  followerCount?: number;
  isFollowed?: boolean;
}

export interface PostCommunity {
  id: string;
  name: string;
  slug: string;
  avatar?: ProcessedImage | null;
  verified?: boolean;
  memberCount?: number;
  isJoined?: boolean;
}

export interface PostPoll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    voteCount: number;
    percentage: number;
  }>;
  totalVotes: number;
  expiresAt: string | null;
  hasVoted: boolean;
  selectedOptionId?: string;
  allowMultiple: boolean;
}

export interface PostLocation {
  id: string;
  name: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  city?: string;
  country?: string;
}

export interface Post {
  id: string;
  content: string;
  media: ProcessedMedia[];
  isSensitive: boolean;
  
  // Engagement metrics
  likeCount: number;
  replyCount: number;
  repostCount: number;
  saveCount: number;
  viewCount: number;
  quoteCount: number;
  
  // User interactions
  isLiked?: boolean;
  isSaved?: boolean;
  isReposted?: boolean;
  isViewed?: boolean;
  
  // Post settings
  audience: 'everyone' | 'followers' | 'community' | 'custom';
  replyPermission: 'everyone' | 'followers' | 'mentioned' | 'none';
  
  // Optional features
  poll: PostPoll | null;
  location: PostLocation | null;
  
  // Timestamps
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  
  // Relationships
  userId: string;
  user: PostUser;
  communityId: string | null;
  community: PostCommunity | null;
  
  // Quote/Reply relationships
  quotedPostId: string | null;
  quotedPost: Post | null;
  quotedReplyId: string | null;
  quotedReply: Post | null;
  
  // Thread information
  threadId?: string;
  parentId?: string;
  isThreadRoot?: boolean;
  
  // Moderation
  isHidden?: boolean;
  isReported?: boolean;
  moderationStatus?: 'approved' | 'pending' | 'flagged' | 'removed';
  
  // Analytics (for post authors)
  analytics?: {
    impressions: number;
    engagementRate: number;
    clickThroughRate: number;
    demographics?: {
      ageGroups: Record<string, number>;
      locations: Record<string, number>;
    };
  };
}

// Legacy Post interface for backward compatibility
export interface LegacyPost {
  id: string;
  desc: string;
  img?: string;
  imgHeight?: number;
  video?: string;
  isSensitive?: boolean;
  createdAt: string;
  verified: boolean;
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
  rePost?: LegacyPost | null;
  rePostId?: string | null;
}

// DTOs for creating/updating posts
export interface CreatePostDto {
  content: string;
  media?: File[];
  isSensitive?: boolean;
  audience?: Post['audience'];
  replyPermission?: Post['replyPermission'];
  communityId?: string;
  locationId?: string;
  poll?: {
    question: string;
    options: string[];
    expiresAt?: string;
    allowMultiple?: boolean;
  };
  quotedPostId?: string;
  parentId?: string; // For replies
}

export interface UpdatePostDto {
  content?: string;
  isSensitive?: boolean;
  audience?: Post['audience'];
  replyPermission?: Post['replyPermission'];
}

// Response interfaces
export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface PostEngagementResponse {
  liked: boolean;
  saved: boolean;
  reposted: boolean;
  likeCount: number;
  saveCount: number;
  repostCount: number;
}

// Filter interfaces
export interface PostFilters {
  userId?: string;
  communityId?: string;
  mediaType?: 'image' | 'video' | 'gif' | 'poll';
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy?: 'latest' | 'popular' | 'trending' | 'oldest';
  includeReplies?: boolean;
  includeSensitive?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
}

// Utility types
export type PostType = 'text' | 'image' | 'video' | 'poll' | 'quote' | 'reply';

export interface PostStats {
  totalPosts: number;
  totalLikes: number;
  totalReposts: number;
  totalViews: number;
  engagementRate: number;
  averageLikesPerPost: number;
  averageRepliesPerPost: number;
  topPerformingPost?: Post;
}

// Import ProcessedImage from main types
import { ProcessedImage } from './index';