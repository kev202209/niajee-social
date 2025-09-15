import { ProcessedImage } from '@/types';

/**
 * Helper function to get image URL from ProcessedImage
 * @param image - The ProcessedImage object or null/undefined
 * @param preferredSize - The preferred image variant size
 * @returns The image URL string or undefined if no image
 */
export const getImageSrc = (
  image: ProcessedImage | null | undefined, 
  preferredSize: '480w' | '720w' | '1080w' = '720w'
): string | undefined => {
  if (!image) return undefined;
  
  
  // New format - return the preferred variant or fall back to originalKey
  return image.variants?.[preferredSize] || image.originalKey;
};

/**
 * Helper function to get image URL from ProcessedImage (without legacy string support)
 * Use this when you're sure the backend only returns ProcessedImage format
 * @param image - The ProcessedImage object or null/undefined
 * @param preferredSize - The preferred image variant size
 * @returns The image URL string or undefined if no image
 */
export const getProcessedImageSrc = (
  image: ProcessedImage | null | undefined, 
  preferredSize: '480w' | '720w' | '1080w' = '720w'
): string | undefined => {
  if (!image) return undefined;
  
  // Return the preferred variant or fall back to originalKey
  return image.variants?.[preferredSize] || image.originalKey;
};