import React, { useEffect, useState } from 'react';
import { ImageFile, EditParams, Resolution } from '../types';
import { CanvasEditor } from './CanvasEditor';
import { Button } from './Button';
import { IconDownload, IconReset, IconTrash, IconSwitchHorizontal, IconLoader } from './icons';
import { exportStandardImage } from '../services/imageProcessor';
import { ptBR } from '../locales/pt-BR';
import OptimizedImage from './OptimizedImage';

interface ImageEditorCardProps {
  imageFile: ImageFile;
  setImages: React.Dispatch<React.SetStateAction<Record<string, ImageFile>>>;
  onRemove: (id: string) => void;
  onSwap: (id: string) => void;
  resolution: Resolution;
  isLastImage: boolean;
}

export const ImageEditorCard: React.FC<ImageEditorCardProps> = ({ imageFile, setImages, onRemove, onSwap, resolution, isLastImage }) => {
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageFile.previewUrl;
    img.onload = () => setImgElement(img);
    return () => {
        setImgElement(null);
    }
  }, [imageFile.previewUrl]);

  const editParams = imageFile.editParams;

  const setEditParams = (newParams: Partial<EditParams>) => {
    setImages(prev => ({
        ...prev,
        [imageFile.id]: {
            ...prev[imageFile.id],
            editParams: { ...prev[imageFile.id].editParams, ...newParams }
        }
    }));
  };

  const handleDownload = async () => {
    if (!imgElement) return;
    setIsDownloading(true);
    try {
      await exportStandardImage(imgElement, editParams, imageFile.file.name, resolution);
    } catch (error) {
      console.error("Failed to download image:", error);
      alert("Ocorreu um erro ao baixar a imagem.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setEditParams({ x: 0, y: 0, zoom: 1 });
  };

  if (!imgElement || !imageFile) {
    return (
        <div className="glassmorphism p-4 rounded-xl flex flex-col gap-4 aspect-[4/5] items-center justify-center">
            <IconLoader className="w-8 h-8 animate-spin text-purple-300" />
            <span className="text-gray-300">{ptBR.loading}</span>
        </div>
    );
  }

  return (
    <div className="glassmorphism p-4 rounded-xl flex flex-col gap-4 group relative transition-all duration-300 hover:shadow-purple-500/20">
      <button 
        onClick={() => onRemove(imageFile.id)} 
        disabled={isLastImage}
        title={isLastImage ? ptBR.errorLastImage : ptBR.removeImageTooltip} 
        className="absolute top-2 right-2 z-10 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-black/40"
      >
        <IconTrash className="w-5 h-5"/>
      </button>

      <div className="flex-grow">
        <CanvasEditor
            image={imgElement}
            editParams={editParams}
            setEditParams={setEditParams}
            aspectRatio={1}
        />
      </div>
      
      <div className="flex items-center justify-center gap-2">
         <button onClick={() => onSwap(imageFile.id)} title={ptBR.swapImage} className="p-2 text-gray-300 hover:text-purple-300 hover:bg-white/10 rounded-full transition-colors"><IconSwitchHorizontal className="w-5 h-5"/></button>
         <button onClick={handleReset} title={ptBR.resetPosition} className="p-2 text-gray-300 hover:text-purple-300 hover:bg-white/10 rounded-full transition-colors"><IconReset className="w-5 h-5"/></button>
      </div>

      <Button onClick={handleDownload} disabled={isDownloading} variant="secondary" className="w-full flex justify-center items-center gap-2">
          <IconDownload className="w-4 h-4"/> 
          {isDownloading 
            ? (resolution === 'high' ? ptBR.processingHighRes : ptBR.downloading) 
            : ptBR.downloadThisImage
          }
      </Button>
    </div>
  );
};