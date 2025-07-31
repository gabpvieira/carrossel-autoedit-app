import { ImageFile } from '../types';

// Configurações de otimização
const OPTIMIZATION_CONFIG = {
  // Tamanho máximo para preview (em pixels)
  maxPreviewSize: 800,
  // Qualidade de compressão para preview
  previewQuality: 0.8,
  // Tamanho máximo do arquivo em bytes (2MB)
  maxFileSize: 2 * 1024 * 1024,
  // Qualidade de compressão para arquivos grandes
  compressionQuality: 0.85,
  // Formato de saída preferido
  outputFormat: 'image/jpeg' as const,
};

// Cache de imagens otimizadas
const imageCache = new Map<string, string>();

/**
 * Redimensiona uma imagem mantendo a proporção
 */
const resizeImage = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  maxSize: number
): void => {
  const { width, height } = img;
  let newWidth = width;
  let newHeight = height;

  // Calcula as novas dimensões mantendo a proporção
  if (width > height) {
    if (width > maxSize) {
      newWidth = maxSize;
      newHeight = (height * maxSize) / width;
    }
  } else {
    if (height > maxSize) {
      newHeight = maxSize;
      newWidth = (width * maxSize) / height;
    }
  }

  canvas.width = newWidth;
  canvas.height = newHeight;

  // Configurações para melhor qualidade
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Desenha a imagem redimensionada
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
};

/**
 * Comprime uma imagem se ela for muito grande
 */
const compressImage = async (
  file: File,
  quality: number = OPTIMIZATION_CONFIG.compressionQuality
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Redimensiona se necessário
      resizeImage(canvas, ctx, img, OPTIMIZATION_CONFIG.maxPreviewSize);

      // Converte para blob com compressão
      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        OPTIMIZATION_CONFIG.outputFormat,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Cria uma versão otimizada da imagem para preview
 */
const createOptimizedPreview = async (file: File): Promise<string> => {
  // Verifica se já está no cache
  const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    // Comprime a imagem se for muito grande
    let optimizedBlob: Blob = file;
    
    if (file.size > OPTIMIZATION_CONFIG.maxFileSize) {
      optimizedBlob = await compressImage(file);
    }

    // Cria URL do preview otimizado
    const previewUrl = URL.createObjectURL(optimizedBlob);
    
    // Armazena no cache
    imageCache.set(cacheKey, previewUrl);
    
    return previewUrl;
  } catch (error) {
    console.warn('Erro ao otimizar imagem, usando original:', error);
    return URL.createObjectURL(file);
  }
};

/**
 * Pré-carrega uma imagem de forma assíncrona
 */
const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Processa múltiplas imagens de forma otimizada
 */
export const processImagesOptimized = async (
  files: FileList,
  onProgress?: (progress: number) => void
): Promise<ImageFile[]> => {
  const imageFiles: ImageFile[] = [];
  const totalFiles = files.length;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    const id = `${file.name}-${Date.now()}-${i}`;

    try {
      // Cria preview otimizado
      const previewUrl = await createOptimizedPreview(file);
      
      // Pré-carrega a imagem para garantir que está pronta
      await preloadImage(previewUrl);

      imageFiles.push({
        id,
        file,
        previewUrl,
        editParams: {
          zoom: 1,
          x: 0,
          y: 0,
          brightness: 0,
          contrast: 0,
          saturation: 0,
          shadows: 0,
          sharpness: 0,
        },
      });

      // Atualiza progresso
      if (onProgress) {
        onProgress(((i + 1) / totalFiles) * 100);
      }
    } catch (error) {
      console.error(`Erro ao processar imagem ${file.name}:`, error);
    }
  }

  return imageFiles;
};

/**
 * Limpa o cache de imagens
 */
export const clearImageCache = (): void => {
  imageCache.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  imageCache.clear();
};

/**
 * Obtém estatísticas do cache
 */
export const getCacheStats = () => {
  return {
    size: imageCache.size,
    keys: Array.from(imageCache.keys()),
  };
};

/**
 * Lazy loading para imagens
 */
export class LazyImageLoader {
  private observer: IntersectionObserver;
  private loadedImages = new Set<string>();

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src && !this.loadedImages.has(src)) {
              img.src = src;
              this.loadedImages.add(src);
              this.observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );
  }

  observe(img: HTMLImageElement): void {
    this.observer.observe(img);
  }

  disconnect(): void {
    this.observer.disconnect();
    this.loadedImages.clear();
  }
}

// Instância global do lazy loader
export const lazyLoader = new LazyImageLoader();

/**
 * Hook para otimização de performance
 */
export const useImageOptimization = () => {
  const processFiles = async (
    files: FileList,
    onProgress?: (progress: number) => void
  ) => {
    return processImagesOptimized(files, onProgress);
  };

  const clearCache = () => {
    clearImageCache();
  };

  const getStats = () => {
    return getCacheStats();
  };

  return {
    processFiles,
    clearCache,
    getStats,
  };
};