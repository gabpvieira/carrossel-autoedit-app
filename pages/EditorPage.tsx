import React, { useState, useEffect } from 'react';
import { UploadArea } from '../components/UploadArea';
import { 
    ImageFile, 
    CoverSlots, 
    DEFAULT_COVER_SLOTS, 
    CoverSlotKey, 
    ImageSelectionModalState, 
    Resolution, 
    DEFAULT_EDIT_PARAMS,
    ConfirmationModalState,
    DEFAULT_CONFIRMATION_MODAL_STATE,
    MAX_FILES 
} from '../types';
import { IconPhoto, IconLayoutGrid, IconLayoutColumns, IconDownload, IconLoader } from '../components/icons';
import { CoverEditor } from '../components/CoverEditor';
import { ImageGridEditor } from '../components/ImageGridEditor';
import { ImageSelectionModal } from '../components/ImageSelectionModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { ptBR } from '../locales/pt-BR';
import { ResolutionSelector } from '../components/ResolutionSelector';
import { Button } from '../components/Button';
import { processAndZipImages } from '../services/zipService';
import { useImageOptimization, clearImageCache } from '../services/imageOptimizer';
import { useOptimizedImages } from '../hooks/useOptimizedImages';
import PerformanceIndicator, { usePerformanceIndicator } from '../components/PerformanceIndicator';

type ActiveTab = 'cover' | 'standard';

const EditorPage: React.FC = () => {
  const [images, setImages] = useState<Record<string, ImageFile>>({});
  const [standardImageIds, setStandardImageIds] = useState<string[]>([]);
  const [coverSlots, setCoverSlots] = useState<CoverSlots>(DEFAULT_COVER_SLOTS);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('cover');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState(false);

  const [imageSelectionModal, setImageSelectionModal] = useState<ImageSelectionModalState>({ isOpen: false, targetSlot: null, targetImageId: null });
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>(DEFAULT_CONFIRMATION_MODAL_STATE);
  
  const [resolution, setResolution] = useState<Resolution>('high');

  useEffect(() => {
    const savedRes = localStorage.getItem('carrossel-autoedit-resolution') as Resolution;
    if (savedRes && (savedRes === 'standard' || savedRes === 'high')) {
        setResolution(savedRes);
    }
  }, []);

  const handleSetResolution = (res: Resolution) => {
    setResolution(res);
    localStorage.setItem('carrossel-autoedit-resolution', res);
  };

  const { processFiles: processOptimized, isProcessing: isOptimizing, progress: optimizationProgress, error: optimizationError } = useOptimizedImages({
    maxCacheSize: 100,
    preloadNext: true,
    compressionQuality: 0.85
  });
  const { isVisible: showPerformance, toggle: togglePerformance } = usePerformanceIndicator();

  const handleFiles = (files: FileList) => {
    if (Object.keys(images).length + files.length > MAX_FILES) {
        alert(ptBR.errorMaxFiles(MAX_FILES));
        return;
    }

    setIsProcessing(true);
    const newImages: Record<string, ImageFile> = {};
    const newImageIds: string[] = [];

    Array.from(files).forEach(file => {
      const id = `${file.name}-${Date.now()}`;
      newImages[id] = {
        id,
        file,
        previewUrl: URL.createObjectURL(file),
        editParams: { ...DEFAULT_EDIT_PARAMS },
      };
      newImageIds.push(id);
    });

    setImages(prev => ({ ...prev, ...newImages }));
    setStandardImageIds(prev => [...prev, ...newImageIds]);
    setIsProcessing(false);
  };

  const handleOptimizedImages = async (files: FileList) => {
    try {
      setIsProcessing(true);
      const optimizedImages = await processOptimized(files);
      
      const newImages: Record<string, ImageFile> = {};
      const newImageIds: string[] = [];

      optimizedImages.forEach(imageFile => {
        newImages[imageFile.id] = imageFile;
        newImageIds.push(imageFile.id);
      });

      setImages(prev => ({ ...prev, ...newImages }));
      setStandardImageIds(prev => [...prev, ...newImageIds]);
    } catch (error) {
      console.error('Erro ao processar imagens otimizadas:', error);
      // Fallback para o método original
      handleFiles(files);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setConfirmationModal({
        isOpen: true,
        title: ptBR.resetAll,
        message: ptBR.confirmResetApp,
        onConfirm: () => {
            Object.values(images).forEach(img => URL.revokeObjectURL(img.previewUrl));
            clearImageCache(); // Limpa o cache de otimização
            setImages({});
            setStandardImageIds([]);
            setCoverSlots(DEFAULT_COVER_SLOTS);
            setActiveTab('cover');
        }
    });
  };

  const requestRemoveImage = (idToRemove: string) => {
      const totalImages = Object.keys(images).length;
      if (totalImages <= 1) {
          alert(ptBR.errorLastImage);
          return;
      }

      setConfirmationModal({
          isOpen: true,
          title: ptBR.confirmDeleteTitle,
          message: ptBR.confirmDeleteMessage,
          itemName: images[idToRemove]?.file.name,
          onConfirm: () => executeRemoveImage(idToRemove),
      });
  };

  const executeRemoveImage = (idToRemove: string) => {
    setImages(prev => {
        const newState = { ...prev };
        const imageToRemove = newState[idToRemove];
        if (imageToRemove) {
          URL.revokeObjectURL(imageToRemove.previewUrl);
          delete newState[idToRemove];
        }
        return newState;
    });
    setStandardImageIds(prev => prev.filter(id => id !== idToRemove));
    setCoverSlots(prev => {
        const newSlots = { ...prev };
        (Object.keys(newSlots) as CoverSlotKey[]).forEach(key => {
            if (newSlots[key] === idToRemove) {
                newSlots[key] = null;
            }
        });
        return newSlots;
    });
  }
  
  const openImageSelector = (target: { slot: CoverSlotKey } | { imageId: string }) => {
      if ('slot' in target) {
          setImageSelectionModal({ isOpen: true, targetSlot: target.slot, targetImageId: null });
      } else {
          setImageSelectionModal({ isOpen: true, targetSlot: null, targetImageId: target.imageId });
      }
  };
  
  const handleSelectImageForSlot = (selectedImageId: string) => {
      const { targetSlot, targetImageId } = imageSelectionModal;

      if (targetSlot) { // Assigning to a cover slot
          const previousImageIdInSlot = coverSlots[targetSlot];
          
          setCoverSlots(prev => ({...prev, [targetSlot]: selectedImageId }));
          setStandardImageIds(prev => {
              let newStandard = prev.filter(id => id !== selectedImageId);
              if (previousImageIdInSlot && previousImageIdInSlot !== selectedImageId) {
                if (!newStandard.includes(previousImageIdInSlot)) {
                  newStandard.push(previousImageIdInSlot);
                }
              }
              return newStandard;
          });
      } else if (targetImageId) { // Swapping a standard image
          const coverSlotKey = (Object.keys(coverSlots) as CoverSlotKey[]).find(key => coverSlots[key] === targetImageId);

          if(coverSlotKey) { // Swapping an image that is in a cover slot
             setCoverSlots(prev => ({...prev, [coverSlotKey]: selectedImageId }));
             setStandardImageIds(prev => {
                 const newStandard = prev.filter(id => id !== selectedImageId);
                 if (!newStandard.includes(targetImageId)) {
                     newStandard.push(targetImageId);
                 }
                 return newStandard;
             });
          } else { // Swapping an image that is in the standard grid
            const swapIndex = standardImageIds.indexOf(targetImageId);
            if (swapIndex !== -1) {
                setStandardImageIds(prev => {
                    const newStandard = [...prev];
                    newStandard[swapIndex] = selectedImageId;
                    return newStandard.filter((id, i) => i === swapIndex ? true : id !== selectedImageId);
                });
            }
          }
      }

      setImageSelectionModal({ isOpen: false, targetSlot: null, targetImageId: null });
  };
  
  const requestClearSlot = (slot: CoverSlotKey) => {
    const totalImages = Object.keys(images).length;
    const imageIdInSlot = coverSlots[slot];
    
    if (!imageIdInSlot) return;

    if (totalImages <= 1) {
        alert(ptBR.errorLastImage);
        return;
    }

    setConfirmationModal({
        isOpen: true,
        title: ptBR.confirmDeleteTitle,
        message: ptBR.confirmDeleteMessage,
        itemName: images[imageIdInSlot]?.file.name,
        onConfirm: () => executeClearSlot(slot),
    });
  };

  const executeClearSlot = (slot: CoverSlotKey) => {
      const imageIdToMove = coverSlots[slot];
      if (!imageIdToMove) return;

      setCoverSlots(prev => ({...prev, [slot]: null}));
      if (!standardImageIds.includes(imageIdToMove)) {
        setStandardImageIds(prev => [...prev, imageIdToMove]);
      }
  };

  const handleDownloadAll = async () => {
    setIsZipping(true);
    try {
      await processAndZipImages(coverSlots, standardImageIds, images, resolution);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      alert("Ocorreu um erro ao gerar o arquivo ZIP.");
    } finally {
      setIsZipping(false);
    }
  };

  const hasImages = Object.keys(images).length > 0;
  const imageCount = Object.keys(images).length;
  const availableImagesForModal = standardImageIds.map(id => images[id]).filter(Boolean);

  return (
    <div className="p-4 sm:p-6 md:p-8 text-white">
      {!hasImages ? (
          <div>
            <UploadArea 
              onFilesSelected={handleOptimizedImages} 
              isProcessing={isProcessing || isOptimizing}
            />
            <div className="text-center mt-12 text-gray-300">
                <IconPhoto className="w-24 h-24 mx-auto mb-4 text-gray-500" />
                <h2 className="text-2xl font-bold text-white">{ptBR.startTitle}</h2>
                <p className="mt-2 max-w-2xl mx-auto">{ptBR.startSubtitle(MAX_FILES)}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <header className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">{ptBR.editorTitle}</h1>
                    <p className="text-gray-400 mt-1">{ptBR.editorSubtitle}</p>
                </div>
                <div className="flex items-center p-1 glassmorphism rounded-lg">
                    <button onClick={() => setActiveTab('cover')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'cover' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10'}`}>
                        <IconLayoutColumns className="w-5 h-5" /> {ptBR.coverTab}
                    </button>
                    <button onClick={() => setActiveTab('standard')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'standard' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10'}`}>
                       <IconLayoutGrid className="w-5 h-5" /> {ptBR.standardImagesTab}
                    </button>
                </div>
            </header>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 glassmorphism rounded-xl">
                <h2 className="text-lg font-bold text-white">{ptBR.imageCounter(imageCount, MAX_FILES)}</h2>
                <Button onClick={handleReset} variant="danger" size="sm">
                    {ptBR.resetAll}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResolutionSelector resolution={resolution} setResolution={handleSetResolution} />
              <div className="glassmorphism p-4 rounded-xl flex flex-col justify-center">
                  <div className="flex items-center space-x-3">
                    <Button 
                      onClick={togglePerformance}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2"
                      title="Mostrar/ocultar métricas de performance"
                    >
                      <span>📊</span>
                      <span>Performance</span>
                    </Button>
                    
                    <Button onClick={handleDownloadAll} disabled={isZipping || !hasImages} size="lg" variant="primary" className="flex-1">
                        <div className="flex justify-center items-center gap-2">
                          {isZipping ? (
                              <><IconLoader className="w-6 h-6 animate-spin" /> {resolution === 'high' ? ptBR.processingHighRes : ptBR.processing}</>
                          ) : (
                              <><IconDownload className="w-6 h-6" /> {hasImages ? ptBR.downloadAll(imageCount) : ptBR.downloadAllNoImages}</>
                          )}
                        </div>
                    </Button>
                  </div>
              </div>
            </div>

            {activeTab === 'cover' && (
                <CoverEditor 
                    coverSlots={coverSlots} 
                    images={images}
                    setImages={setImages}
                    onSelectImage={openImageSelector}
                    onClearSlot={requestClearSlot}
                    resolution={resolution}
                    isLastImage={imageCount <= 1}
                />
            )}
            {activeTab === 'standard' && (
                <ImageGridEditor 
                    imageIds={standardImageIds} 
                    images={images}
                    setImages={setImages}
                    onRemoveImage={requestRemoveImage}
                    onSwapImage={(id) => openImageSelector({ imageId: id })}
                    resolution={resolution}
                    isLastImage={imageCount <= 1}
                />
            )}
          </div>
        )}
      <ImageSelectionModal 
        isOpen={imageSelectionModal.isOpen}
        onClose={() => setImageSelectionModal({ isOpen: false, targetSlot: null, targetImageId: null })}
        availableImages={availableImagesForModal}
        onImageSelect={handleSelectImageForSlot}
        onUploadNew={handleFiles}
      />
      <ConfirmationModal 
        modalState={confirmationModal}
        onClose={() => setConfirmationModal(DEFAULT_CONFIRMATION_MODAL_STATE)}
      />
      
      {/* Indicador de Performance */}
      <PerformanceIndicator 
        show={showPerformance}
        position="bottom-right"
        compact={true}
      />
      
      {/* Notificação de erro de otimização */}
      {optimizationError && (
        <div className="fixed top-4 right-4 z-50 bg-red-900/90 backdrop-blur-sm border border-red-500 rounded-lg p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="text-red-400 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-red-200 font-medium text-sm">Erro na Otimização</h4>
              <p className="text-red-300 text-xs mt-1">{optimizationError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;