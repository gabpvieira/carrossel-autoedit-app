import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EditParams } from '../types';
import { Slider } from './Slider';
import { ptBR } from '../locales/pt-BR';

interface CanvasEditorProps {
  image: HTMLImageElement;
  editParams: EditParams;
  setEditParams: (params: Partial<EditParams>) => void;
  aspectRatio: number;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ image, editParams, setEditParams, aspectRatio }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    
    // Create transparent checkerboard pattern background
    const checkSize = 20;
    for (let x = 0; x < rect.width; x += checkSize) {
      for (let y = 0; y < rect.height; y += checkSize) {
        const isEven = (Math.floor(x / checkSize) + Math.floor(y / checkSize)) % 2 === 0;
        ctx.fillStyle = isEven ? '#f0f0f0' : '#e0e0e0';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }
    
    ctx.save();

    const { zoom, x, y, brightness, contrast, saturation, shadows, sharpness } = editParams;
    
    const applyFiltersToImageData = (imageData: ImageData, params: EditParams) => {
      const data = imageData.data;
      const { brightness, contrast, saturation, highlights, sharpness } = params;
      
      // Convert parameters to usable values
      const brightnessValue = brightness / 100;
      const contrastValue = (contrast + 100) / 100;
      const saturationValue = (saturation + 100) / 100;
      const highlightsValue = highlights / 100;
      const sharpnessValue = sharpness / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Apply brightness
        if (brightness !== 0) {
          r += brightnessValue * 255;
          g += brightnessValue * 255;
          b += brightnessValue * 255;
        }
        
        // Apply contrast
        if (contrast !== 0) {
          r = ((r / 255 - 0.5) * contrastValue + 0.5) * 255;
          g = ((g / 255 - 0.5) * contrastValue + 0.5) * 255;
          b = ((b / 255 - 0.5) * contrastValue + 0.5) * 255;
        }
        
        // Apply saturation
        if (saturation !== 0) {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray + (r - gray) * saturationValue;
          g = gray + (g - gray) * saturationValue;
          b = gray + (b - gray) * saturationValue;
        }
        
        // Apply highlights (brighten lighter areas more)
        if (highlights !== 0) {
          const luminance = (r + g + b) / 3;
          const factor = (luminance / 255) * highlightsValue;
          r += factor * 255;
          g += factor * 255;
          b += factor * 255;
        }
        
        // Apply sharpness (enhance contrast in mid-tones)
        if (sharpness !== 0) {
          const luminance = (r + g + b) / 3;
          if (luminance > 64 && luminance < 192) {
            const factor = 1 + sharpnessValue;
            r = ((r / 255 - 0.5) * factor + 0.5) * 255;
            g = ((g / 255 - 0.5) * factor + 0.5) * 255;
            b = ((b / 255 - 0.5) * factor + 0.5) * 255;
          }
        }
        
        // Clamp values
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }
      
      return imageData;
    };
    
    // Draw image first without filters
    const hRatio = rect.width / image.width;
    const vRatio = rect.height / image.height;
    const ratio = Math.max(hRatio, vRatio);
    const finalZoom = zoom * ratio;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate the actual image bounds on canvas
    const imageWidth = image.width * finalZoom;
    const imageHeight = image.height * finalZoom;
    const imageX = centerX + x - imageWidth / 2;
    const imageY = centerY + y - imageHeight / 2;
    
    // Apply filters using ImageData if any filters are active
    const hasFilters = brightness !== 0 || contrast !== 0 || saturation !== 0 || 
                      editParams.highlights !== 0 || editParams.sharpness !== 0;
    
    if (hasFilters) {
      // Draw image to a temporary canvas first
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageWidth;
      tempCanvas.height = imageHeight;
      const tempCtx = tempCanvas.getContext('2d')!;
      
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      tempCtx.drawImage(image, 0, 0, imageWidth, imageHeight);
      
      // Get image data from temp canvas
      const imageData = tempCtx.getImageData(0, 0, imageWidth, imageHeight);
      
      // Apply filters to the image data
      const filteredImageData = applyFiltersToImageData(imageData, editParams);
      
      // Put filtered image data back to temp canvas
      tempCtx.putImageData(filteredImageData, 0, 0);
      
      // Draw the filtered image to main canvas
      ctx.drawImage(tempCanvas, imageX, imageY);
    } else {
      // Draw image normally without filters
      ctx.translate(centerX + x, centerY + y);
      ctx.scale(finalZoom, finalZoom);
      ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
    }
    
    ctx.restore();
  }, [image, editParams]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(canvas);
    draw();
    return () => resizeObserver.disconnect();
  }, [draw]);

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    lastPosition.current = { x: clientX, y: clientY };
    if(canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dx = clientX - lastPosition.current.x;
    const dy = clientY - lastPosition.current.y;
    lastPosition.current = { x: clientX, y: clientY };
    setEditParams({ x: editParams.x + dx, y: editParams.y + dy });
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    if(canvasRef.current) canvasRef.current.style.cursor = 'grab';
  };

  return (
    <div className="space-y-3">
        <canvas
            ref={canvasRef}
            style={{aspectRatio: `${aspectRatio}`}}
            className="w-full h-auto bg-gray-800 rounded-lg cursor-grab touch-none"
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleDragEnd}
        />
        <Slider
            label={ptBR.zoom}
            value={editParams.zoom}
            onChange={(e) => setEditParams({ zoom: parseFloat(e.target.value) })}
            min={0.1}
            max={3}
            step={0.01}
        />
        <Slider
            label={ptBR.brightness}
            value={editParams.brightness}
            onChange={(e) => setEditParams({ brightness: parseFloat(e.target.value) })}
            min={-50}
            max={50}
            step={1}
        />
        <Slider
            label={ptBR.contrast}
            value={editParams.contrast}
            onChange={(e) => setEditParams({ contrast: parseFloat(e.target.value) })}
            min={-50}
            max={50}
            step={1}
        />
        <Slider
            label={ptBR.saturation}
            value={editParams.saturation}
            onChange={(e) => setEditParams({ saturation: parseFloat(e.target.value) })}
            min={-50}
            max={50}
            step={1}
        />
        <Slider
            label={ptBR.highlights}
            value={editParams.highlights}
            onChange={(e) => setEditParams({ highlights: parseFloat(e.target.value) })}
            min={-20}
            max={20}
            step={1}
        />
        <Slider
            label={ptBR.sharpness}
            value={editParams.sharpness}
            onChange={(e) => setEditParams({ sharpness: parseFloat(e.target.value) })}
            min={-20}
            max={20}
            step={1}
        />
    </div>
  );
};