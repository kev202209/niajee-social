'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface AuthenticatedImageProps {
  mediaKey: string;
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
}

// Cache for storing fetched image URLs
const imageCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string>>();

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
}) => {
  const { user } = useAuth(); // Only need user state, not token
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  // const [hasError, setHasError] = useState(false);
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Check if user is authenticated and mediaKey exists
    if (!mediaKey || !user) {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    const cacheKey = `${user.id}-${mediaKey}`; // Use user.id instead of token

    // Check if image is already cached
    if (imageCache.has(cacheKey)) {
      setImageSrc(imageCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      pendingRequests.get(cacheKey)!.then((url) => {
        if (isMounted.current) {
          setImageSrc(url);
          setIsLoading(false);
        }
      }).catch(() => {
        if (isMounted.current) {
          // setHasError(true);
          setImageSrc(fallbackSrc);
          setIsLoading(false);
        }
      });
      return;
    }

    const fetchImage = async (): Promise<string> => {
      try {
        setIsLoading(true);
        // setHasError(false);

        // HTTP-only cookie sent automatically with credentials: 'include'
        const response = await fetch(`${api_url}/media/${mediaKey}`, {
          credentials: 'include', // This sends the HTTP-only cookie
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        // Cache the result
        imageCache.set(cacheKey, imageUrl);
        
        return imageUrl;
      } catch (error) {
        console.error('Error fetching authenticated image:', error);
        throw error;
      } finally {
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
      }
    };

    // Add to pending requests
    const promise = fetchImage();
    pendingRequests.set(cacheKey, promise);

    promise
      .then((url) => {
        if (isMounted.current) {
          setImageSrc(url);
        }
      })
      .catch(() => {
        if (isMounted.current) {
          // setHasError(true);
          setImageSrc(fallbackSrc);
          onError?.();
        }
      })
      .finally(() => {
        if (isMounted.current) {
          setIsLoading(false);
        }
      });

    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
        // Remove from cache if it matches
        if (imageCache.get(cacheKey) === imageSrc) {
          imageCache.delete(cacheKey);
        }
      }
    };
  }, [mediaKey, user, api_url, fallbackSrc, onError, imageSrc]); // Add imageSrc to dependencies

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
        // Remove from cache if it matches
        for (const [key, value] of imageCache.entries()) {
          if (value === imageSrc) {
            imageCache.delete(key);
          }
        }
      }
    };
  }, [imageSrc]);

  const handleImageLoad = () => {
        if (isMounted.current) {
          setIsLoading(false);
        }
    onLoad?.();
  };

  const handleImageError = () => {
    // setHasError(true);
    setImageSrc(fallbackSrc);
    onError?.();
  };

  // Show loading state
  if (isLoading && !imageSrc) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center ${className}`}
        style={fill ? {} : { width, height }}
      >
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
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