import { ProcessedImage } from './index'

export interface FullShortData {
  id: string;
  title: string;
  description?: string;
  videoUrl: {
    [quality: string]: string;
  } | string; // Handle both formats
  videoSrc?: string; // Direct video source URL
  masterPlaylist?: string;
  qualities?: string[];
  thumbnail: string | null;
  duration: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  isPublic: boolean;
  isLiked: boolean;
  isSaved: boolean;
  allowComments: boolean;
  allowDuet: boolean;
  monetization: {
    enabled: boolean;
    reason: string | null;
  };
  tags: string[];
  mentions: string[];
  location: string | null;
  createdAt: string;
  channel: {
    id: string;
    name: string;
    handle: string;
    avatar: ProcessedImage | null; // UPDATED: matches API ProcessedImage
    verified: boolean;
    isFollowed: boolean;
  };
  user?: {
    id: string;
    username: string;
    displayName: string;
    profilePic: string;
    verified: boolean;
  };
  soundId?: string | null;
  // Membership access fields
  isMemberOnly?: boolean;
  requiredTierId?: string | null;
  canAccess?: boolean;
  membershipBadge?: string;
  needsMembership?: boolean;
}

export interface ShortData {
  id: string;
  title: string;
  description?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  isLiked: boolean;
  isSaved: boolean;
  allowComments: boolean;
  soundId?: string | null;
  channel: {
    id: string;
    name: string;
    handle: string;
    avatar: ProcessedImage | null; // UPDATED: matches API ProcessedImage
    verified: boolean;
    isFollowed: boolean;
  };
}

// Lightweight sound meta (matches raw API shape, no normalization)
export interface SoundMeta {
  id: string;
  title: string;
  cover?: ProcessedImage;
  audio?: {
    variants: { mp3: string };
    originalKey: string;
  };
  durationSec?: number;
  usageCount?: number;
}

export interface SoundShortItem {
  id: string;
  title?: string;
  // match the actual API shape (ProcessedImage container)
  thumbnail?: {
    data: ProcessedImage;
    type: 'auto-generated' | 'user-uploaded';
    status: 'queued' | 'processing' | 'complete' | 'failed';
  } | null;
  // include videoUrl so ShortCard can preview on hover
  videoUrl?: {
    [quality: string]: string;
  };
  createdAt?: string;
  channel?: { name?: string; handle?: string };
}