import React, { useEffect, useRef, useState } from 'react';
import { ImageFile, EditParams, CoverSlots, CoverSlotKey, Resolution } from '../types';
import { CanvasEditor } from './CanvasEditor';
import { Button } from './Button';
import { IconDownload, IconPlus, IconX, IconSwitchHorizontal, IconLoader, IconReset } from './icons';
import { exportCoverImage } from '../services/imageProcessor';
import { ptBR } from '../locales/pt-BR';

interface CoverEditorProps {
  coverSlots: CoverSlots;
  images: Record<string, ImageFile>;
  setImages: React.Dispatch<React.SetStateAction<Record<string, ImageFile>>>;
  onSelectImage: (target: { slot: CoverSlotKey }) => void;
  onClearSlot: (slot: CoverSlotKey) => void;
  resolution: Resolution;
  isLastImage: boolean;
}

const AddImageSlot: React.FC<{text: string, onClick: () => void}> = ({ text, onClick }) => (
    <button onClick={onClick} className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-white/5 hover:border-purple-400 transition-all min-h-[150px]">
        <IconPlus className="w-8 h-8 mb-2"/>
        <span className="text-sm font-semibold text-center px-2">{text}</span>
    </button>
);

const SlotEditor: React.FC<{
    imageFile: ImageFile,
    aspectRatio: number,
    setImages: CoverEditorProps['setImages'],
    onSwap: () => void,
    onRemove: () => void;
    isLastImage: boolean;
}> = ({ imageFile, aspectRatio, setImages, onSwap, onRemove, isLastImage }) => {
    const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageFile.previewUrl;
        img.onload = () => setImgElement(img);
        return () => setImgElement(null);
    }, [imageFile.previewUrl]);

    const setEditParams = (newParams: Partial<EditParams>) => {
        setImages(prev => ({
            ...prev,
            [imageFile.id]: {
                ...prev[imageFile.id],
                editParams: { ...prev[imageFile.id].editParams, ...newParams }
            }
        }));
    };
    
    const handleReset = () => {
        setEditParams({ x: 0, y: 0, zoom: 1 });
    };

    if (!imgElement) return <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center"><IconLoader className="w-8 h-8 animate-spin text-purple-400" /></div>

    return (
        <div className="space-y-3 relative group">
             <button 
                onClick={onRemove} 
                disabled={isLastImage}
                title={isLastImage ? ptBR.errorLastImage : ptBR.clearSlot} 
                className="absolute top-0 right-0 z-10 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-black/40"
              >
                <IconX className="w-4 h-4"/>
              </button>
            <CanvasEditor
                image={imgElement}
                editParams={imageFile.editParams}
                setEditParams={setEditParams}
                aspectRatio={aspectRatio}
            />
            <div className="flex justify-center items-center gap-3">
                 <button onClick={() => onSwap()} title={ptBR.swapImage} className="p-2 text-gray-300 hover:text-purple-300 hover:bg-white/10 rounded-full transition-colors"><IconSwitchHorizontal className="w-5 h-5"/></button>
                 <button onClick={handleReset} title={ptBR.resetPosition} className="p-2 text-gray-300 hover:text-purple-300 hover:bg-white/10 rounded-full transition-colors"><IconReset className="w-5 h-5"/></button>
            </div>
        </div>
    );
};


export const CoverEditor: React.FC<CoverEditorProps> = ({ coverSlots, images, setImages, onSelectImage, onClearSlot, resolution, isLastImage }) => {
  const finalPreviewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadedImageElements, setLoadedImageElements] = useState<Partial<Record<CoverSlotKey, HTMLImageElement>>>({});
  
  useEffect(() => {
    const elements: Partial<Record<CoverSlotKey, HTMLImageElement>> = {};
    const promises = (Object.keys(coverSlots) as CoverSlotKey[]).map(key => {
        const imageId = coverSlots[key];
        if (imageId && images[imageId]) {
            return new Promise<void>(resolve => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = images[imageId].previewUrl;
                img.onload = () => {
                    elements[key] = img;
                    resolve();
                };
                img.onerror = () => resolve();
            });
        }
        return Promise.resolve();
    });
    
    Promise.all(promises).then(() => setLoadedImageElements(elements));
  }, [coverSlots, images]);

  useEffect(() => {
    const canvas = finalPreviewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 1080;
    canvas.height = 1080;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const drawSection = (img: HTMLImageElement, params: EditParams, dx: number, dy: number, dWidth: number, dHeight: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(dx, dy, dWidth, dHeight);
        ctx.clip();
        
        ctx.fillStyle = 'white';
        ctx.fillRect(dx, dy, dWidth, dHeight);

        const { zoom, x, y } = params;
        
        const hRatio = dWidth / img.width;
        const vRatio = dHeight / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const finalZoom = zoom * ratio;
        
        const editorApproximateWidth = 300; 
        const scaleFactor = dWidth / editorApproximateWidth;

        const centerX = dx + dWidth / 2;
        const centerY = dy + dHeight / 2;
        
        ctx.translate(centerX + (x * scaleFactor), centerY + (y * scaleFactor));
        ctx.scale(finalZoom, finalZoom);
        ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
        
        ctx.restore();
    };
    
    const TOP_HEIGHT = 696;
    const BOTTOM_HEIGHT = 384;
    const TOTAL_WIDTH = 1080;
    const HALF_WIDTH = 540;

    const topId = coverSlots.top;
    if (topId && images[topId] && loadedImageElements.top) {
        drawSection(loadedImageElements.top, images[topId].editParams, 0, 0, TOTAL_WIDTH, TOP_HEIGHT);
    }

    const blId = coverSlots.bottomLeft;
    if (blId && images[blId] && loadedImageElements.bottomLeft) {
        drawSection(loadedImageElements.bottomLeft, images[blId].editParams, 0, TOP_HEIGHT, HALF_WIDTH, BOTTOM_HEIGHT);
    }

    const brId = coverSlots.bottomRight;
    if (brId && images[brId] && loadedImageElements.bottomRight) {
        drawSection(loadedImageElements.bottomRight, images[brId].editParams, HALF_WIDTH, TOP_HEIGHT, TOTAL_WIDTH-HALF_WIDTH, BOTTOM_HEIGHT);
    }
  }, [coverSlots, images, loadedImageElements]);
  
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        const getImageData = (slot: CoverSlotKey) => {
            const id = coverSlots[slot];
            const img = loadedImageElements[slot];
            if (id && images[id] && img) {
                return { img, params: images[id].editParams };
            }
            return null;
        }
        await exportCoverImage(getImageData('top'), getImageData('bottomLeft'), getImageData('bottomRight'), 'cover.png', resolution);
    } catch(error) {
        console.error("Failed to download cover image:", error);
        alert("Ocorreu um erro ao baixar a imagem de capa.");
    } finally {
        setIsDownloading(false);
    }
  };
  
  const slotData = [
    { key: 'top', title: ptBR.topSection, addText: ptBR.addTopImage, aspectRatio: 1080 / 696, className: "md:col-span-2" },
    { key: 'bottomLeft', title: ptBR.bottomLeftSection, addText: ptBR.addBottomLeftImage, aspectRatio: 540 / 384, className: "" },
    { key: 'bottomRight', title: ptBR.bottomRightSection, addText: ptBR.addBottomRightImage, aspectRatio: 540 / 384, className: "" },
  ] as const;

  const hasCoverImages = Object.values(coverSlots).some(id => id !== null);

  return (
    <div className="glassmorphism p-4 sm:p-6 rounded-2xl">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
            <h3 className="text-xl font-bold text-white">{ptBR.coverEditorTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {slotData.map(({ key, title, addText, aspectRatio, className }) => (
                <div key={key} className={`glassmorphism p-4 rounded-xl shadow-inner ${className}`}>
                  <h4 className="font-semibold text-base mb-3 text-gray-300">{title}</h4>
                  {coverSlots[key] && images[coverSlots[key] as string] ? (
                    <SlotEditor
                        imageFile={images[coverSlots[key] as string]}
                        aspectRatio={aspectRatio}
                        setImages={setImages}
                        onSwap={() => onSelectImage({ slot: key })}
                        onRemove={() => onClearSlot(key)}
                        isLastImage={isLastImage}
                    />
                  ) : (
                    <AddImageSlot text={addText} onClick={() => onSelectImage({ slot: key })}/>
                  )}
                </div>
              ))}
            </div>
        </div>
        <div className="lg:w-1/3">
            <h3 className="text-xl font-bold text-white mb-4">{ptBR.finalPreviewTitle}</h3>
            <div className="aspect-square bg-gray-900/50 rounded-lg overflow-hidden shadow-inner border border-gray-700">
                <canvas ref={finalPreviewCanvasRef} className="w-full h-full" />
            </div>
            <Button onClick={handleDownload} disabled={isDownloading || !hasCoverImages} variant="secondary" size="lg" className="w-full mt-6 flex justify-center items-center gap-2">
              <IconDownload className="w-5 h-5"/>
              {isDownloading 
                ? (resolution === 'high' ? ptBR.processingHighRes : ptBR.downloading) 
                : ptBR.downloadThisImage
              }
            </Button>
        </div>
      </div>
    </div>
  );
};