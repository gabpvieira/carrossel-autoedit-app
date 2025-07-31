import React, { useRef, ChangeEvent, useEffect } from 'react';
import { ImageFile } from '../types';
import { Button } from './Button';
import { IconX, IconUpload } from './icons';
import { ptBR } from '../locales/pt-BR';

interface ImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableImages: ImageFile[];
  onImageSelect: (id: string) => void;
  onUploadNew: (files: FileList) => void;
}

export const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
  isOpen,
  onClose,
  availableImages,
  onImageSelect,
  onUploadNew,
}) => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUploadClick = () => {
    uploadRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadNew(e.target.files);
      onClose(); // Close modal after upload starts
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="glassmorphism rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700/50 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">{ptBR.imageSelectionModalTitle}</h2>
            <p className="text-sm text-gray-400">{ptBR.imageSelectionModalSubtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400">
            <IconX className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 overflow-y-auto">
          {availableImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {availableImages.map((image) => (
                <div key={image.id} className="group relative rounded-lg overflow-hidden aspect-square">
                  <img src={image.previewUrl} alt={image.file.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <Button onClick={() => onImageSelect(image.id)} size="sm" variant="primary">
                      {ptBR.modalUseThisImage}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="font-semibold text-gray-300">{ptBR.modalNoImages}</h3>
              <p className="text-sm text-gray-500 mt-1">{ptBR.modalNoImagesSub}</p>
            </div>
          )}
        </main>
        
        <footer className="p-4 border-t border-gray-700/50 bg-black/20 rounded-b-xl flex-shrink-0">
          <input
            type="file"
            ref={uploadRef}
            className="hidden"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
          <Button onClick={handleUploadClick} variant="secondary" className="w-full flex items-center justify-center gap-2">
            <IconUpload className="w-5 h-5" />
            {ptBR.modalUploadNew}
          </Button>
        </footer>
      </div>
    </div>
  );
};