'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { ProcessedImage } from '@/types';
import { buildInitials, colorFromSeed, avatarSvg } from '@/utils/avatar-generator';

interface AuthenticatedImageProps {
  mediaKey: ProcessedImage | string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  isProfilePic?: boolean;
}

// Cache for storing fetched image URLs
const imageCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string>>();

const isAbsoluteUrl = (value: unknown): value is string =>
  typeof value === 'string' && /^(https?:)\/\//i.test(value);

const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  mediaKey,
  alt,
  width,
  height,
  fill = false,
  className = '',
  sizes,
  priority = false,
  placeholder = 'empty',
  fallbackSrc = '/placeholder.png',
  onError,
  onLoad,
  isProfilePic = false,
}) => {
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user || null;
  } catch {
    // AuthContext not available or user not authenticated
    user = null;
  }

  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const isMounted = useRef(true);
  const createdObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Clean previously created object URL when mediaKey changes
    if (createdObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(createdObjectUrlRef.current);
      } catch {
        // ignore
      }
      createdObjectUrlRef.current = null;
    }

    // If mediaKey is an absolute URL, use it directly (no auth fetch)
    if (isAbsoluteUrl(mediaKey)) {
      setImageSrc(mediaKey);
      setIsLoading(false);
      return;
    }

    // If mediaKey is null, user is authenticated, and it's a profile pic, generate avatar SVG
    if (!mediaKey && user && isProfilePic) {
      try {
        const initials = buildInitials(user.firstName, user.lastName, user.email);
        const bgColor = colorFromSeed(user.email || `${user.firstName}${user.lastName}`);
        const svg = avatarSvg(initials, bgColor, 400);
        const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
        setImageSrc(dataUrl);
        setIsLoading(false);
        return;
      } catch (err) {
        console.error('Error generating avatar:', err);
        setImageSrc(fallbackSrc);
        setIsLoading(false);
        return;
      }
    }

    // If no media key, show fallback
    if (!mediaKey) {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    const rawKey = typeof mediaKey === 'string' ? mediaKey : JSON.stringify(mediaKey);
    // Use mediaKey alone for cache key (not tied to user)
    const cacheKey = rawKey;

    if (imageCache.has(cacheKey)) {
      setImageSrc(imageCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    if (pendingRequests.has(cacheKey)) {
      pendingRequests
        .get(cacheKey)!
        .then((url) => {
          if (isMounted.current) setImageSrc(url);
        })
        .catch(() => {
          if (isMounted.current) {
            setImageSrc(fallbackSrc);
            onError?.();
          }
        })
        .finally(() => {
          if (isMounted.current) setIsLoading(false);
        });
      return;
    }

    const fetchImage = async (): Promise<string> => {
      try {
        if (!api_url) throw new Error('API URL not configured');

        setIsLoading(true);
        const encodedKey = encodeURIComponent(String(mediaKey));
        const res = await fetch(`${api_url}/media/raw/${encodedKey}`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);

        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        createdObjectUrlRef.current = objectUrl;
        imageCache.set(cacheKey, objectUrl);
        return objectUrl;
      } finally {
        pendingRequests.delete(cacheKey);
      }
    };

    const promise = fetchImage();
    pendingRequests.set(cacheKey, promise);

    promise
      .then((url) => {
        if (isMounted.current) setImageSrc(url);
      })
      .catch((err) => {
        console.error('Error fetching image:', err);
        if (isMounted.current) {
          setImageSrc(fallbackSrc);
          onError?.();
        }
      })
      .finally(() => {
        if (isMounted.current) setIsLoading(false);
      });

    // cleanup for this effect will revoke object URL if we created one earlier (handled above)
    return () => {
      // no-op here because we revoke at mediaKey change and unmount below
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaKey, user, api_url, fallbackSrc, onError, isProfilePic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (createdObjectUrlRef.current && createdObjectUrlRef.current.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(createdObjectUrlRef.current);
        } catch {
          // ignore
        }
        for (const [key, value] of imageCache.entries()) {
          if (value === createdObjectUrlRef.current) {
            imageCache.delete(key);
          }
        }
      }
    };
  }, []);

  const handleImageLoad = () => {
    if (isMounted.current) setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageSrc(fallbackSrc);
    onError?.();
  };

  if (isLoading && !imageSrc) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc || fallbackSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      placeholder={placeholder}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
};

export default AuthenticatedImage;