import React, { useEffect, useState } from 'react';
import { ImageFile, EditParams, Resolution } from '../types';
import { CanvasEditor } from './CanvasEditor';
import { Button } from './Button';
import { IconDownload, IconReset, IconTrash, IconSwitchHorizontal, IconLoader, IconChevronLeft, IconChevronRight } from './icons';
import { exportStandardImage } from '../services/imageProcessor';
import { ptBR } from '../locales/pt-BR';
import OptimizedImage from './OptimizedImage';

interface TimelineImageEditorProps {
  imageIds: string[];
  images: Record<string, ImageFile>;
  setImages: React.Dispatch<React.SetStateAction<Record<string, ImageFile>>>;
  onRemoveImage: (id: string) => void;
  onSwapImage: (id: string) => void;
  resolution: Resolution;
  isLastImage: boolean;
}

export const TimelineImageEditor: React.FC<TimelineImageEditorProps> = ({ 
  imageIds, 
  images, 
  setImages, 
  onRemoveImage, 
  onSwapImage, 
  resolution, 
  isLastImage 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const currentImageId = imageIds[currentIndex];
  const currentImage = currentImageId ? images[currentImageId] : null;

  useEffect(() => {
    if (!currentImage) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImage.previewUrl;
    img.onload = () => setImgElement(img);
    return () => {
      setImgElement(null);
    };
  }, [currentImage?.previewUrl]);

  useEffect(() => {
    // Reset to first image if current index is out of bounds
    if (currentIndex >= imageIds.length && imageIds.length > 0) {
      setCurrentIndex(0);
    }
  }, [imageIds.length, currentIndex]);

  if (imageIds.length === 0 || !currentImage) {
    return (
      <div className="text-center py-16 px-6 glassmorphism rounded-xl">
        <div className="w-20 h-20 mx-auto text-purple-300 mb-4">
          📷
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">{ptBR.noStandardImagesTitle}</h3>
        <p className="mt-2 text-gray-300">{ptBR.noStandardImagesSubtitle}</p>
      </div>
    );
  }

  const editParams = currentImage.editParams;

  const setEditParams = (newParams: Partial<EditParams>) => {
    setImages(prev => ({
      ...prev,
      [currentImageId]: {
        ...prev[currentImageId],
        editParams: { ...prev[currentImageId].editParams, ...newParams }
      }
    }));
  };

  const handleDownload = async () => {
    if (!imgElement) return;
    setIsDownloading(true);
    try {
      await exportStandardImage(imgElement, editParams, currentImage.file.name, resolution);
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

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : imageIds.length - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev < imageIds.length - 1 ? prev + 1 : 0);
  };

  if (!imgElement) {
    return (
      <div className="glassmorphism p-8 rounded-xl flex flex-col gap-4 items-center justify-center min-h-[600px]">
        <IconLoader className="w-8 h-8 animate-spin text-purple-300" />
        <span className="text-gray-300">{ptBR.loading}</span>
      </div>
    );
  }

  return (
    <div className="glassmorphism p-6 rounded-xl space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-white">{ptBR.timelineEditor}</h3>
          <span className="text-gray-300">
            {ptBR.imageCounter(currentIndex + 1, imageIds.length)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={goToPrevious}
            variant="secondary"
            className="p-2"
            disabled={imageIds.length <= 1}
          >
            <IconChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={goToNext}
            variant="secondary"
            className="p-2"
            disabled={imageIds.length <= 1}
          >
            <IconChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Canvas Editor */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">{ptBR.imagePreview}</h4>
          <div className="relative">
            <button 
              onClick={() => onRemoveImage(currentImageId)} 
              disabled={isLastImage}
              title={isLastImage ? ptBR.errorLastImage : ptBR.removeImageTooltip} 
              className="absolute top-2 right-2 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-red-500/80 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-black/60 transition-colors"
            >
              <IconTrash className="w-5 h-5"/>
            </button>
            
            <CanvasEditor
              image={imgElement}
              editParams={editParams}
              setEditParams={setEditParams}
              aspectRatio={1}
            />
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-white">{ptBR.editControls}</h4>
          
          {/* Position Controls */}
          <div className="space-y-4">
            <h5 className="text-md font-medium text-purple-300">{ptBR.positionControls}</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {ptBR.positionX}
                </label>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="1"
                  value={editParams.x}
                  onChange={(e) => setEditParams({ x: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-400 mt-1 text-center">{Math.round(editParams.x)}px</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {ptBR.positionY}
                </label>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="1"
                  value={editParams.y}
                  onChange={(e) => setEditParams({ y: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-400 mt-1 text-center">{Math.round(editParams.y)}px</div>
              </div>
            </div>
          </div>

          {/* Zoom Control */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {ptBR.zoom}
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.01"
              value={editParams.zoom}
              onChange={(e) => setEditParams({ zoom: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-gray-400 mt-1 text-center">{Math.round(editParams.zoom * 100)}%</div>
          </div>

          {/* Color Adjustments */}
          <div className="space-y-4">
            <h5 className="text-md font-medium text-purple-300">{ptBR.colorAdjustments}</h5>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {ptBR.brightness}
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={editParams.brightness}
                onChange={(e) => setEditParams({ brightness: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1 text-center">{editParams.brightness > 0 ? '+' : ''}{editParams.brightness}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {ptBR.contrast}
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={editParams.contrast}
                onChange={(e) => setEditParams({ contrast: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1 text-center">{editParams.contrast > 0 ? '+' : ''}{editParams.contrast}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {ptBR.saturation}
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={editParams.saturation}
                onChange={(e) => setEditParams({ saturation: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1 text-center">{editParams.saturation > 0 ? '+' : ''}{editParams.saturation}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {ptBR.highlights}
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={editParams.highlights}
                onChange={(e) => setEditParams({ highlights: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1 text-center">{editParams.highlights > 0 ? '+' : ''}{editParams.highlights}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {ptBR.sharpness}
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={editParams.sharpness}
                onChange={(e) => setEditParams({ sharpness: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1 text-center">{editParams.sharpness > 0 ? '+' : ''}{editParams.sharpness}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => onSwapImage(currentImageId)}
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <IconSwitchHorizontal className="w-4 h-4" />
              {ptBR.swapImage}
            </Button>
            
            <Button
              onClick={handleReset}
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <IconReset className="w-4 h-4" />
              {ptBR.resetPosition}
            </Button>
          </div>

          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            variant="primary"
            className="w-full flex justify-center items-center gap-2"
          >
            <IconDownload className="w-4 h-4" />
            {isDownloading 
              ? (resolution === 'high' ? ptBR.processingHighRes : ptBR.downloading) 
              : ptBR.downloadThisImage
            }
          </Button>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="border-t border-gray-700 pt-6">
        <h5 className="text-sm font-medium text-gray-300 mb-3">{ptBR.imageNavigation}</h5>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {imageIds.map((id, index) => (
            <button
              key={id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-purple-400 ring-2 ring-purple-400/50' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <OptimizedImage
                src={images[id].previewUrl}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};