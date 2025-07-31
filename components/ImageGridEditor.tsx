import React, { useState } from 'react';
import { ImageFile, Resolution } from '../types';
import { ImageEditorCard } from './ImageEditorCard';
import { TimelineImageEditor } from './TimelineImageEditor';
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
  const [useTimelineView, setUseTimelineView] = useState(false);

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
      {/* View Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setUseTimelineView(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !useTimelineView
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grade
          </button>
          <button
            onClick={() => setUseTimelineView(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              useTimelineView
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {ptBR.timelineEditor}
          </button>
        </div>
      </div>

      {/* Content */}
      {useTimelineView ? (
        <TimelineImageEditor
          imageIds={imageIds}
          images={images}
          setImages={setImages}
          onRemoveImage={onRemoveImage}
          onSwapImage={onSwapImage}
          resolution={resolution}
        />
      ) : (
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
      )}
    </div>
  );
};