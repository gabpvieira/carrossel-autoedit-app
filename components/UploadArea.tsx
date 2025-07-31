import React, { useCallback, useState } from 'react';
import { IconUpload, IconLoader } from './icons';
import { ptBR } from '../locales/pt-BR';
import { MAX_FILES } from '../types';


interface UploadAreaProps {
  onFilesSelected: (files: FileList) => void;
  isProcessing: boolean;
}

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export const UploadArea: React.FC<UploadAreaProps> = ({ onFilesSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleValidation = (files: FileList): boolean => {
    setError(null);
    if (files.length > MAX_FILES) {
      setError(ptBR.errorMaxFiles(MAX_FILES));
      return false;
    }
    for (const file of Array.from(files)) {
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        setError(ptBR.errorFileType(file.name));
        return false;
      }
    }
    return true;
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if(handleValidation(e.target.files)) {
        await processFiles(e.target.files);
      }
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = async (files: FileList) => {
    onFilesSelected(files);
  };

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if(handleValidation(files)) {
        await processFiles(files);
      }
    }
  }, []);


  return (
    <div className="max-w-4xl mx-auto">
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 ${isDragging ? 'border-purple-400 bg-white/10' : 'border-gray-500 hover:border-purple-400 bg-white/5'}`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer text-gray-300">
          {isProcessing ? (
            <>
              <IconLoader className="w-16 h-16 text-purple-400 animate-spin" />
              <p className="mt-4 text-lg font-semibold text-gray-200">
                {ptBR.processingImages}
              </p>

            </>
          ) : (
            <>
              <IconUpload className="w-16 h-16 text-purple-400"/>
              <p className="mt-4 text-lg font-semibold text-gray-200">
                <span className="text-purple-400 font-bold">{ptBR.clickToUpload}</span> {ptBR.orDragAndDrop}
              </p>
              <p className="mt-1 text-sm text-gray-400">{ptBR.uploadHint(MAX_FILES)}</p>

            </>
          )}
        </label>
      </div>
      {error && <p className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-md border border-red-500/50">{error}</p>}
    </div>
  );
};