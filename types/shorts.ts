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
  thumbnailUrl: string | null;
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

// Lightweight sound meta (no any)
export interface SoundMeta {
  id: string;
  title: string;
  coverArt?: string;
  audioUrl?: string;
  durationSec?: number;
}

export interface SoundShortItem {
  id: string;
  title?: string;
  // match the actual API shape (ProcessedImage container)
  thumbnailUrl?: {
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