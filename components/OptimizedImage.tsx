import React, { useEffect, useRef, useState } from 'react';
import { IconLoader } from './icons';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: React.ReactNode;
  lazy?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  placeholder,
  lazy = true,
  quality = 'medium'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Configurações de qualidade
  const qualitySettings = {
    low: { blur: 'blur(2px)', opacity: 0.8 },
    medium: { blur: 'blur(1px)', opacity: 0.9 },
    high: { blur: 'none', opacity: 1 }
  };

  useEffect(() => {
    if (!lazy) {
      setCurrentSrc(src);
      return;
    }

    // Configurar Intersection Observer para lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !currentSrc) {
            setCurrentSrc(src);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, lazy, currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const handleImageLoad = () => {
    // Pequeno delay para transição suave
    setTimeout(() => {
      handleLoad();
    }, 100);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder enquanto carrega */}
      {(isLoading || !currentSrc) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm">
          {placeholder || (
            <div className="flex flex-col items-center space-y-2">
              <IconLoader className="w-6 h-6 text-purple-400 animate-spin" />
              <span className="text-xs text-gray-400">Carregando...</span>
            </div>
          )}
        </div>
      )}

      {/* Imagem principal */}
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover transition-all duration-500 ease-out
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${isLoaded ? qualitySettings[quality].blur : 'blur(4px)'}
          `}
          style={{
            filter: isLoaded ? qualitySettings[quality].blur : 'blur(4px)',
            opacity: isLoaded ? qualitySettings[quality].opacity : 0,
          }}
        />
      )}

      {/* Estado de erro */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-2 text-red-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs">Erro ao carregar</span>
          </div>
        </div>
      )}

      {/* Indicador de carregamento progressivo */}
      {isLoading && currentSrc && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

// Hook para pré-carregamento de imagens
export const useImagePreloader = () => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.has(src)) {
        resolve();
        return;
      }

      if (loadingImages.has(src)) {
        // Aguarda o carregamento em andamento
        const checkLoaded = () => {
          if (loadedImages.has(src)) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      setLoadingImages(prev => new Set(prev).add(src));

      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src));
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        resolve();
      };
      img.onerror = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  };

  const preloadImages = async (sources: string[]): Promise<void> => {
    const promises = sources.map(src => preloadImage(src));
    await Promise.allSettled(promises);
  };

  const isImageLoaded = (src: string): boolean => {
    return loadedImages.has(src);
  };

  const isImageLoading = (src: string): boolean => {
    return loadingImages.has(src);
  };

  const clearCache = (): void => {
    setLoadedImages(new Set());
    setLoadingImages(new Set());
  };

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    isImageLoading,
    clearCache,
    stats: {
      loaded: loadedImages.size,
      loading: loadingImages.size,
    },
  };
};