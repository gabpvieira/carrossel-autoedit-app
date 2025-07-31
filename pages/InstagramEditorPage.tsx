import React, { useState, useRef } from 'react';
import { ptBR } from '../locales/pt-BR';
import { ImageFile, Resolution, DEFAULT_EDIT_PARAMS } from '../types';
import { Button } from '../components/Button';
import { UploadArea } from '../components/UploadArea';
import { InstagramEditor } from '../components/InstagramEditor';
import { IconDownload, IconArrowLeft } from '../components/icons';

const InstagramEditorPage: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [resolution] = useState<Resolution>('standard');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = async (files: FileList) => {
    setIsProcessing(true);
    try {
      const newImages: ImageFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const id = `img-${Date.now()}-${i}`;
        const previewUrl = URL.createObjectURL(file);
        
        newImages.push({
          id,
          file,
          previewUrl,
          name: file.name,
          editParams: DEFAULT_EDIT_PARAMS
        });
      }
      
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Erro ao processar imagens:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSwapImage = (id: string) => {
    // Implementar lógica de troca se necessário
    console.log('Swap image:', id);
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;

    try {
      // Criar um canvas temporário para renderizar o layout final
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      // Definir dimensões do Instagram (1350x1080)
      tempCanvas.width = 1350;
      tempCanvas.height = 1080;

      // Preencher com fundo preto
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1350, 1080);

      // Aqui você implementaria a lógica para desenhar as imagens no canvas
      // Por enquanto, vamos apenas baixar um canvas vazio como placeholder

      // Converter para blob e fazer download
      tempCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `instagram-layout-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <a
                href="#dashboard"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <IconArrowLeft className="w-5 h-5" />
                <span>{ptBR.backToDashboard}</span>
              </a>
              <div className="h-6 w-px bg-gray-600" />
              <h1 className="text-xl font-semibold text-white">{ptBR.instagramEditorTitle}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleDownload}
                disabled={images.length === 0}
                className="flex items-center space-x-2"
              >
                <IconDownload className="w-4 h-4" />
                <span>{ptBR.downloadImage}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {images.length === 0 ? (
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {ptBR.uploadImagesTitle}
              </h2>
              <p className="text-gray-400 mb-8">
                {ptBR.uploadImagesSubtitle}
              </p>
              <UploadArea
                onFilesSelected={handleFilesSelected}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upload adicional */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {ptBR.addMoreImages}
              </h3>
              <UploadArea
                onFilesSelected={handleFilesSelected}
                isProcessing={isProcessing}
              />
            </div>

            {/* Editor de Instagram */}
            <InstagramEditor
              images={images}
              setImages={setImages}
              onRemoveImage={handleRemoveImage}
              onSwapImage={handleSwapImage}
            />
          </div>
        )}
      </div>

      {/* Canvas oculto para renderização */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={1350}
        height={1080}
      />
    </div>
  );
};

export default InstagramEditorPage;