import React from 'react';
import { ImageFile, Resolution } from '../types';
import { ImageEditorCard } from './ImageEditorCard';
import { ptBR } from '../locales/pt-BR';
import { IconPhotoOff } from './icons';

interface ImageGridEditorProps {
  imageIds: string[];
  images: Record<string, ImageFile>;
  setImages: React.Dispatch<React.SetStateAction<Record<string, ImageFile>>>;
  onRemoveImage: (id: string) => void;
  onSwapImage: (id: string) => void;
  resolution: Resolution;
  isLastImage: boolean;
}

export const ImageGridEditor: React.FC<ImageGridEditorProps> = ({ imageIds, images, setImages, onRemoveImage, onSwapImage, resolution, isLastImage }) => {
  if (imageIds.length === 0) {
    return (
        <div className="text-center py-16 px-6 glassmorphism rounded-xl">
            <IconPhotoOff className="w-20 h-20 mx-auto text-purple-300" />
            <h3 className="mt-4 text-xl font-bold text-white">{ptBR.noStandardImagesTitle}</h3>
            <p className="mt-2 text-gray-300">{ptBR.noStandardImagesSubtitle}</p>
        </div>
    )
  }
  
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {imageIds.map(id => (
            <ImageEditorCard 
                key={id} 
                imageFile={images[id]} 
                setImages={setImages}
                onRemove={onRemoveImage}
                onSwap={onSwapImage}
                resolution={resolution}
                isLastImage={isLastImage}
            />
        ))}
        </div>
    </div>
  );
};