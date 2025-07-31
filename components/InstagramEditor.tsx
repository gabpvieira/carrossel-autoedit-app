import React, { useState, useRef, useEffect } from 'react';
import { ptBR } from '../locales/pt-BR';
import { ImageFile, InstagramSlots, InstagramSlotKey, DEFAULT_INSTAGRAM_SLOTS } from '../types';
import { Button } from './Button';
import { IconPhoto, IconX } from './icons';
import { ImageSelectionModal } from './ImageSelectionModal';
import { CanvasEditor } from './CanvasEditor';

interface InstagramEditorProps {
  images: ImageFile[];
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  onRemoveImage: (id: string) => void;
  onSwapImage: (id: string) => void;
}

export const InstagramEditor: React.FC<InstagramEditorProps> = ({
  images,
  setImages,
  onRemoveImage,
  onSwapImage
}) => {
  const [instagramSlots, setInstagramSlots] = useState<InstagramSlots>(DEFAULT_INSTAGRAM_SLOTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<InstagramSlotKey | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSlotClick = (slot: InstagramSlotKey) => {
    setTargetSlot(slot);
    setIsModalOpen(true);
  };

  const handleImageSelect = (imageId: string) => {
    if (targetSlot) {
      setInstagramSlots(prev => ({
        ...prev,
        [targetSlot]: imageId
      }));
    }
    setIsModalOpen(false);
    setTargetSlot(null);
  };

  const handleClearSlot = (slot: InstagramSlotKey) => {
    setInstagramSlots(prev => ({
      ...prev,
      [slot]: null
    }));
  };

  const getImageById = (id: string | null) => {
    if (!id) return null;
    return images.find(img => img.id === id) || null;
  };

  const renderInstagramLayout = () => {
    const mainImage = getImageById(instagramSlots.main);
    const topRightImage = getImageById(instagramSlots.topRight);
    const bottomRightImage = getImageById(instagramSlots.bottomRight);

    return (
      <div className="relative w-full bg-gray-800 rounded-lg overflow-hidden" style={{ aspectRatio: '1350/1080' }}>
        {/* Main Image (Left side) */}
        <div className="absolute left-0 top-0 w-2/3 h-full border-2 border-gray-600">
          {mainImage ? (
            <div className="relative w-full h-full group">
              <img
                src={mainImage.previewUrl}
                alt="Main"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSlotClick('main')}
                    variant="secondary"
                    className="text-xs px-3 py-1"
                  >
                    Trocar
                  </Button>
                  <Button
                    onClick={() => handleClearSlot('main')}
                    variant="secondary"
                    className="text-xs px-3 py-1"
                  >
                    <IconX className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleSlotClick('main')}
              className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors border-2 border-dashed border-gray-600 hover:border-gray-500"
            >
              <IconPhoto className="w-12 h-12 mb-2" />
              <span className="text-sm font-medium">{ptBR.addMainImage}</span>
            </button>
          )}
        </div>

        {/* Top Right Image */}
        <div className="absolute right-0 top-0 w-1/3 h-1/2 border-2 border-gray-600">
          {topRightImage ? (
            <div className="relative w-full h-full group">
              <img
                src={topRightImage.previewUrl}
                alt="Top Right"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSlotClick('topRight')}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    Trocar
                  </Button>
                  <Button
                    onClick={() => handleClearSlot('topRight')}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    <IconX className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleSlotClick('topRight')}
              className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors border-2 border-dashed border-gray-600 hover:border-gray-500"
            >
              <IconPhoto className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium text-center px-1">{ptBR.addTopRightImage}</span>
            </button>
          )}
        </div>

        {/* Bottom Right Image */}
        <div className="absolute right-0 bottom-0 w-1/3 h-1/2 border-2 border-gray-600">
          {bottomRightImage ? (
            <div className="relative w-full h-full group">
              <img
                src={bottomRightImage.previewUrl}
                alt="Bottom Right"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSlotClick('bottomRight')}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    Trocar
                  </Button>
                  <Button
                    onClick={() => handleClearSlot('bottomRight')}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    <IconX className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleSlotClick('bottomRight')}
              className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors border-2 border-dashed border-gray-600 hover:border-gray-500"
            >
              <IconPhoto className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium text-center px-1">{ptBR.addBottomRightImage}</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderImageEditor = () => {
    const selectedSlots = Object.values(instagramSlots).filter(Boolean);
    if (selectedSlots.length === 0) return null;

    return (
      <div className="space-y-6">
        {Object.entries(instagramSlots).map(([slot, imageId]) => {
          if (!imageId) return null;
          const image = getImageById(imageId);
          if (!image) return null;

          const slotNames = {
            main: ptBR.mainSection,
            topRight: ptBR.topRightSection,
            bottomRight: ptBR.bottomRightSection
          };

          return (
            <div key={slot} className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {slotNames[slot as InstagramSlotKey]}
              </h3>
              <CanvasEditor
                image={image}
                onImageChange={(updatedImage) => {
                  setImages(prev => prev.map(img => 
                    img.id === updatedImage.id ? updatedImage : img
                  ));
                }}
                onRemoveImage={onRemoveImage}
                onSwapImage={onSwapImage}
                resolution="standard"
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">{ptBR.instagramEditorTitle}</h2>
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{ptBR.instagramFinalPreviewTitle}</h3>
          {renderInstagramLayout()}
        </div>
      </div>

      {renderImageEditor()}

      <ImageSelectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTargetSlot(null);
        }}
        images={images}
        onSelectImage={handleImageSelect}
        usedImageIds={Object.values(instagramSlots).filter(Boolean) as string[]}
      />
    </div>
  );
};