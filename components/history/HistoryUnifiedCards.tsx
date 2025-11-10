'use client';
import React from 'react';
import VideoCard from '@/components/home/VideoCard';
import ShortCard from '@/components/home/ShortCard';
import { Video, Short, ProcessedImage } from '@/types';

interface RawHistoryChannel {
  id?: string;
  name?: string;
  handle?: string;
  avatar?: string | null;
}

interface RawHistoryBase {
  id: string;
  title?: string;
  thumbnail?: {
    data: ProcessedImage;
    type: 'auto-generated' | 'user-uploaded';
    status: 'queued' | 'processing' | 'complete' | 'failed';
  } | null;
  duration?: number | null;
  channel?: RawHistoryChannel;
  videoUrl?: Record<string, string>;
  views?: number;
  viewCount?: number;
  likes?: number;
  likeCount?: number;
  createdAt?: string;
  videoId?: string;
  description?: string;
  dislikes?: number;
  history?: {
    lastWatchedAt: string;
    positionSec?: number;
    durationSec?: number | null;
    completed?: boolean;
    timesWatched?: number;
  };
}

interface HistoryVideoProps {
  data: RawHistoryBase;
}
interface HistoryShortProps {
  data: RawHistoryBase;
}

function createMockProcessedImage(avatarUrl: string | null): ProcessedImage {
  const url = avatarUrl || '';
  return {
    width: 720,
    height: 1280,
    format: 'webp',
    variants: {
      '480w': url,
      '720w': url,
      '1080w': url
    },
    originalKey: url,
    processedAt: new Date().toISOString(),
    thumbnailKey: url
  };
}

export const HistoryVideoCard: React.FC<HistoryVideoProps> = ({ data }) => {
  const adapted: Video = {
    id: data.id,
    videoId: data.videoId ?? data.id,
    videoUrl: data.videoUrl ?? {},
    description: data.description ?? '',
    title: data.title ?? '',
    thumbnail: data.thumbnail ?? {
      data: createMockProcessedImage(null),
      type: 'auto-generated',
      status: 'complete'
    },
    duration: data.duration ?? 0,
    views: data.views ?? data.viewCount ?? 0,
    likes: data.likes ?? data.likeCount ?? 0,
    dislikes: data.dislikes ?? 0,
    createdAt: data.createdAt ?? new Date().toISOString(),
    channel: {
      id: data.channel?.id ?? '',
      name: data.channel?.name ?? '',
      avatar: createMockProcessedImage(data.channel?.avatar ?? null),
      handle: data.channel?.handle ?? '',
      verified: false,
    },
  };

  return <VideoCard video={adapted} />;
};

export const HistoryShortCard: React.FC<HistoryShortProps> = ({ data }) => {
  const adaptedShort: Short = {
    id: data.id,
    videoUrl: data.videoUrl ?? {},
    title: data.title ?? '',
    thumbnail: data.thumbnail ?? {
      data: createMockProcessedImage(null),
      type: 'auto-generated',
      status: 'complete'
    },
    duration: data.duration ?? 0,
    views: data.views ?? data.viewCount ?? 0,
    likes: data.likes ?? data.likeCount ?? 0,
    createdAt: data.createdAt ?? new Date().toISOString(),
    channel: {
      id: data.channel?.id ?? '',
      name: data.channel?.name ?? '',
      handle: data.channel?.handle ?? '',
      avatar: createMockProcessedImage(data.channel?.avatar ?? null),
      verified: false,
    }
  };

  return <ShortCard short={adaptedShort} />;
};