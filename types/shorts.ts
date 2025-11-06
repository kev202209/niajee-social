import { ProcessedImage } from './index'

export interface FullShortData {
  id: string;
  title: string;
  description?: string;
  videoUrl: {
    [quality: string]: string;
  } | string;
  videoSrc?: string;
  masterPlaylist?: string;
  qualities?: string[];
  thumbnail: {
    data?: {
      width: number;
      format: string;
      height: number;
      variants: {
        '480w': string;
        '720w': string;
        '1080w': string;
      };
      originalKey: string;
      processedAt: string;
      thumbnailKey: string;
    };
    type?: 'auto-generated' | 'user-uploaded';
    status?: 'queued' | 'processing' | 'complete' | 'failed';
  } | null;
  duration: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  isPublic: boolean;
  allowComments: boolean;
  allowLikes: boolean;
  allowDuet: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isMemberOnly?: boolean;
  requiredTierId?: string | null;
  monetization?: {
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
    avatar: string | null;
    verified: boolean;
    isFollowed: boolean;
  };
  canAccess?: boolean;
  needsMembership?: boolean;
}

export interface ShortData {
  id: string;
  title: string;
  description?: string;
  videoUrl: {
    [quality: string]: string;
  } | string;
  videoSrc?: string;
  masterPlaylist?: string;
  qualities?: string[];
  thumbnail: {
    data?: {
      width: number;
      format: string;
      height: number;
      variants: {
        '480w': string;
        '720w': string;
        '1080w': string;
      };
      originalKey: string;
      processedAt: string;
      thumbnailKey: string;
    };
    type?: 'auto-generated' | 'user-uploaded';
    status?: 'queued' | 'processing' | 'complete' | 'failed';
  } | null;
  duration: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  isPublic: boolean;
  allowComments: boolean;
  allowLikes: boolean;
  allowDuet: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isMemberOnly?: boolean;
  requiredTierId?: string | null;
  monetization?: {
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
    avatar: string | null;
    verified: boolean;
    isFollowed: boolean;
  };
  canAccess?: boolean;
  needsMembership?: boolean;
}

// Lightweight sound meta (matches raw API shape, no normalization)
export interface SoundMeta {
  id: string;
  title: string;
  artist?: string;
  duration: number;
  waveform?: number[];
}

export interface SoundShortItem {
  id: string;
  title: string;
  thumbnail: {
    data?: {
      width: number;
      format: string;
      height: number;
      variants: {
        '480w': string;
        '720w': string;
        '1080w': string;
      };
      originalKey: string;
      processedAt: string;
      thumbnailKey: string;
    };
    type?: 'auto-generated' | 'user-uploaded';
    status?: 'queued' | 'processing' | 'complete' | 'failed';
  } | null;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  channel: {
    name: string;
    handle: string;
    avatar: string | null;
    verified: boolean;
  };
}