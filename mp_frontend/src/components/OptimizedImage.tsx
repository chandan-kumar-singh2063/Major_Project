import { useState, useEffect, useRef, memo } from 'react';

import { imageCache } from '../utils/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Max width to resize the image to (default: 600) */
  maxWidth?: number;
  /** Max height to resize the image to (default: 600) */
  maxHeight?: number;
  /** JPEG quality 0-1 (default: 0.7) */
  quality?: number;
  /** Whether to show loading placeholder (default: true) */
  showPlaceholder?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * OptimizedImage component that compresses and resizes images on the client side.
 * Uses canvas to resize large images, caches results in memory.
 * Falls back to original image if optimization fails.
 */
const OptimizedImage = memo(({
  src,
  alt,
  className = '',
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.7,
  showPlaceholder = true,
  style,
  onClick,
}: OptimizedImageProps) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Generate a unique cache key based on src + dimensions + quality
    const cacheKey = `${src}_${maxWidth}_${maxHeight}_${quality}`;

    // Check if already cached
    if (imageCache.has(cacheKey)) {
      setOptimizedSrc(imageCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    // Skip optimization for SVGs, tiny images, or non-local images
    const isLocalAsset = src.startsWith('/') || src.startsWith('./');
    const isSvg = src.toLowerCase().endsWith('.svg');
    const isAvif = src.toLowerCase().endsWith('.avif');
    const isWebp = src.toLowerCase().endsWith('.webp');

    if (isSvg || isAvif) {
      setOptimizedSrc(src);
      setIsLoading(false);
      return;
    }

    // For non-local images, just load directly but still allow the loading state to animate
    if (!isLocalAsset) {
      setOptimizedSrc(src);
      setIsLoading(false);
      return;
    }

    // Ensure spaces and special characters in local filenames are handled
    const encodedSrc = src.split('/').map(segment => encodeURIComponent(segment)).join('/').replace(/%2F/g, '/');
    const finalSrc = encodedSrc.startsWith('%2F') ? encodedSrc.replace('%2F', '/') : encodedSrc;

    // Optimize the image using canvas
    const img = new Image();
    
    // Only use anonymous CORS for external images to avoid issues with some local setups
    if (!isLocalAsset) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setOptimizedSrc(src);
          setIsLoading(false);
          return;
        }

        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const outputFormat = isWebp ? 'image/webp' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputFormat, quality);

        imageCache.set(cacheKey, dataUrl);
        setOptimizedSrc(dataUrl);
      } catch (err) {
        console.warn('Image optimization failed for:', src, err);
        setOptimizedSrc(src);
      } finally {
        setIsLoading(false);
      }
    };

    img.onerror = () => {
      console.warn('Failed to load image for optimization:', src);
      setOptimizedSrc(src);
      setHasError(true);
      setIsLoading(false);
    };

    img.src = finalSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, maxWidth, maxHeight, quality]);

  if (hasError && !optimizedSrc) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={style}
      >
        <span className="text-gray-400 text-xs text-center px-4">Image not available</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${className} ${onClick ? 'cursor-pointer' : ''}`} 
      style={style}
      onClick={onClick}
    >
      {/* Loading placeholder */}
      {isLoading && showPlaceholder && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
        />
      )}

      {/* Optimized image */}
      {optimizedSrc && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full ${className.split(' ').filter(c => c.startsWith('object-')).join(' ') || 'object-cover'} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={{ 
            display: 'block',
            ...(className.includes('absolute') ? { position: 'absolute', top: 0, left: 0 } : {})
          }}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            // If optimized version fails, fall back to original
            if (optimizedSrc !== src) {
              setOptimizedSrc(src);
            } else {
              setHasError(true);
              setIsLoading(false);
            }
          }}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
