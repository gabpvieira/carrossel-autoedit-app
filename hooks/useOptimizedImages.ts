import { useState, useEffect, useCallback } from 'react';
import { ImageFile } from '../types';
import { processImagesOptimized, clearImageCache } from '../services/imageOptimizer';

interface UseOptimizedImagesOptions {
  maxCacheSize?: number;
  preloadNext?: boolean;
  compressionQuality?: number;
}

interface UseOptimizedImagesReturn {
  processFiles: (files: FileList) => Promise<ImageFile[]>;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  clearCache: () => void;
  cacheStats: { size: number; keys: string[] };
  preloadImages: (urls: string[]) => Promise<void>;
}

export const useOptimizedImages = (
  options: UseOptimizedImagesOptions = {}
): UseOptimizedImagesReturn => {
  const {
    maxCacheSize = 50,
    preloadNext = true,
    compressionQuality = 0.8
  } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState({ size: 0, keys: [] });

  // Atualiza estatísticas do cache
  const updateCacheStats = useCallback(() => {
    const stats = {
      size: 0,
      keys: [] as string[]
    };
    setCacheStats(stats);
  }, []);

  // Processa arquivos com otimização
  const processFiles = useCallback(async (files: FileList): Promise<ImageFile[]> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const optimizedImages = await processImagesOptimized(files, (progressValue) => {
        setProgress(progressValue);
      });

      updateCacheStats();
      return optimizedImages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao processar imagens: ${errorMessage}`);
      throw err;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [updateCacheStats]);

  // Pré-carrega imagens
  const preloadImages = useCallback(async (urls: string[]): Promise<void> => {
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
        img.src = url;
      });
    });

    try {
      await Promise.allSettled(promises);
    } catch (err) {
      console.warn('Alguns pré-carregamentos falharam:', err);
    }
  }, []);

  // Limpa cache
  const clearCache = useCallback(() => {
    clearImageCache();
    updateCacheStats();
  }, [updateCacheStats]);

  // Efeito para limpeza automática do cache
  useEffect(() => {
    const interval = setInterval(() => {
      updateCacheStats();
      
      // Limpa cache se exceder o tamanho máximo
      if (cacheStats.size > maxCacheSize) {
        console.log('Cache excedeu limite, limpando...');
        clearCache();
      }
    }, 30000); // Verifica a cada 30 segundos

    return () => clearInterval(interval);
  }, [cacheStats.size, maxCacheSize, clearCache, updateCacheStats]);

  // Inicializa estatísticas
  useEffect(() => {
    updateCacheStats();
  }, [updateCacheStats]);

  return {
    processFiles,
    isProcessing,
    progress,
    error,
    clearCache,
    cacheStats,
    preloadImages,
  };
};

// Hook para lazy loading de imagens individuais
export const useLazyImage = (src: string, options: { threshold?: number; rootMargin?: string } = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { threshold = 0.1, rootMargin = '50px' } = options;

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
      setError(null);
    };
    img.onerror = () => {
      setError('Erro ao carregar imagem');
    };
    img.src = src;
  }, [isInView, src]);

  return {
    ref,
    isLoaded,
    isInView,
    error,
    shouldLoad: isInView,
  };
};

// Hook para gerenciamento de performance de imagens
export const useImagePerformance = () => {
  const [metrics, setMetrics] = useState({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
  });

  const recordImageLoad = useCallback((loadTime: number, fromCache: boolean = false) => {
    setMetrics(prev => {
      const newTotal = prev.totalImages + 1;
      const newLoaded = prev.loadedImages + 1;
      const newAverageLoadTime = (prev.averageLoadTime * prev.loadedImages + loadTime) / newLoaded;
      const cacheHits = fromCache ? 1 : 0;
      const newCacheHitRate = ((prev.cacheHitRate * prev.totalImages) + cacheHits) / newTotal;

      return {
        ...prev,
        totalImages: newTotal,
        loadedImages: newLoaded,
        averageLoadTime: newAverageLoadTime,
        cacheHitRate: newCacheHitRate,
      };
    });
  }, []);

  const recordImageError = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      totalImages: prev.totalImages + 1,
      failedImages: prev.failedImages + 1,
    }));
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics({
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      averageLoadTime: 0,
      cacheHitRate: 0,
    });
  }, []);

  return {
    metrics,
    recordImageLoad,
    recordImageError,
    resetMetrics,
  };
};