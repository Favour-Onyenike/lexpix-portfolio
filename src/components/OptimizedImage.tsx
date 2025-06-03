
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  aspectRatio = '4/3',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const maxRetries = 2;
  const loadTimeout = 15000; // 15 seconds timeout

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoaded(true);
    setHasError(false);
    console.log('Image loaded successfully:', src);
    onLoad?.();
  };

  const handleError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    console.error('Image failed to load:', src, 'Retry count:', retryCount);
    
    if (retryCount < maxRetries) {
      console.log('Retrying image load:', src);
      setRetryCount(prev => prev + 1);
      // Force a retry by updating the src with a cache buster
      if (imgRef.current) {
        const separator = src.includes('?') ? '&' : '?';
        imgRef.current.src = `${src}${separator}_retry=${Date.now()}`;
      }
    } else {
      setHasError(true);
      onError?.();
    }
  };

  // Set up timeout for image loading
  useEffect(() => {
    if (isInView && !isLoaded && !hasError) {
      timeoutRef.current = setTimeout(() => {
        console.error('Image load timeout:', src);
        handleError();
      }, loadTimeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isInView, isLoaded, hasError, src]);

  // Generate srcset more safely
  const generateSrcSet = (originalSrc: string) => {
    try {
      // For Unsplash images, we can add size parameters more safely
      if (originalSrc.includes('unsplash.com')) {
        const url = new URL(originalSrc);
        const baseUrl = `${url.origin}${url.pathname}`;
        const existingParams = url.search;
        
        return [
          `${baseUrl}?w=400${existingParams ? '&' + existingParams.substring(1) : ''} 400w`,
          `${baseUrl}?w=800${existingParams ? '&' + existingParams.substring(1) : ''} 800w`,
          `${baseUrl}?w=1200${existingParams ? '&' + existingParams.substring(1) : ''} 1200w`
        ].join(', ');
      }
      return originalSrc;
    } catch (error) {
      console.error('Error generating srcSet for:', originalSrc, error);
      return originalSrc;
    }
  };

  // Validate URL before loading
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const shouldLoadImage = isInView && !hasError && isValidUrl(src);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ aspectRatio }}
    >
      {/* Placeholder/skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/80 animate-pulse" />
      )}

      {/* Blur placeholder if provided */}
      {placeholder && !isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {shouldLoadImage && (
        <img
          ref={imgRef}
          src={src}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground p-4">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">📷</div>
            <p className="text-xs mb-2">Failed to load image</p>
            {retryCount > 0 && (
              <p className="text-xs opacity-75">Tried {retryCount + 1} times</p>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {shouldLoadImage && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Invalid URL error */}
      {!isValidUrl(src) && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">⚠️</div>
            <p className="text-xs">Invalid image URL</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
