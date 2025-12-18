/**
 * Optimized Image Component
 * Provides lazy loading, WebP support, and responsive images
 */

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  quality = 75,
  sizes,
  objectFit = 'cover',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={
          width && height
            ? { width: `${width}px`, height: `${height}px` }
            : undefined
        }
      >
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={{ zIndex: 1 }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        priority={priority}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        style={fill ? { objectFit } : undefined}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}

/**
 * Avatar Image Component
 * Optimized for user avatars with fallback
 */
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: number;
  fallbackText?: string;
  className?: string;
}

export function AvatarImage({
  src,
  alt,
  size = 40,
  fallbackText,
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    const initials = fallbackText
      ? fallbackText
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : alt
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

    return (
      <div
        className={cn(
          'flex items-center justify-center bg-blue-500 text-white font-semibold rounded-full',
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
