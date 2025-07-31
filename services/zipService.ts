import { CoverSlots, ImageFile, Resolution } from '../types';
import { generateStandardImageBlob, generateCoverImageBlob } from './imageProcessor';

declare global {
  interface Window {
    JSZip: any;
  }
}

type ImageAndParams = {
    img: HTMLImageElement;
    params: import('../types').EditParams;
} | null;

const getFilename = (originalName: string, resolution: Resolution, prefix: string = 'facebook') => {
  const name = originalName.split('.').slice(0, -1).join('.') || 'image';
  const resLabel = resolution === 'high' ? '3000x3000' : '1080x1080';
  return `${prefix}_${name}_${resLabel}.jpg`;
}

const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = url;
    });
};

export const processAndZipImages = async (
    coverSlots: CoverSlots,
    standardImageIds: string[],
    allImages: Record<string, ImageFile>,
    resolution: Resolution
): Promise<void> => {
  const JSZip = window.JSZip;
  if (!JSZip) {
    throw new Error('JSZip library is not loaded!');
  }
  const zip = new JSZip();

  // 1. Process cover image
  const hasCoverImage = Object.values(coverSlots).some(id => id !== null);
  if (hasCoverImage) {
      try {
        const topPromise = coverSlots.top ? loadImage(allImages[coverSlots.top].previewUrl) : Promise.resolve(null);
        const blPromise = coverSlots.bottomLeft ? loadImage(allImages[coverSlots.bottomLeft].previewUrl) : Promise.resolve(null);
        const brPromise = coverSlots.bottomRight ? loadImage(allImages[coverSlots.bottomRight].previewUrl) : Promise.resolve(null);

        const [topImg, blImg, brImg] = await Promise.all([topPromise, blPromise, brPromise]);
        
        const topData: ImageAndParams = coverSlots.top && topImg ? { img: topImg, params: allImages[coverSlots.top].editParams } : null;
        const blData: ImageAndParams = coverSlots.bottomLeft && blImg ? { img: blImg, params: allImages[coverSlots.bottomLeft].editParams } : null;
        const brData: ImageAndParams = coverSlots.bottomRight && brImg ? { img: brImg, params: allImages[coverSlots.bottomRight].editParams } : null;

        const coverBlob = await generateCoverImageBlob(topData, blData, brData, resolution);
        if (coverBlob) {
            zip.file(getFilename('cover.png', resolution, 'capa'), coverBlob);
        }
      } catch (error) {
          console.error(`Failed to process cover image:`, error);
      }
  }

  // 2. Process standard images
  for (const id of standardImageIds) {
    const imageFile = allImages[id];
    if (!imageFile) continue;
    try {
      const imgElement = await loadImage(imageFile.previewUrl);
      const blob = await generateStandardImageBlob(imgElement, imageFile.editParams, resolution);
      if (blob) {
        zip.file(getFilename(imageFile.file.name, resolution), blob);
      }
    } catch (error) {
      console.error(`Failed to process image ${imageFile.file.name}:`, error);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'carrossel-autoedit-images.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};