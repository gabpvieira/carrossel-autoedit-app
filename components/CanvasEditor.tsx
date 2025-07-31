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
    
    const applyFilters = (ctx: CanvasRenderingContext2D) => {
      const filters = [];
      
      if (editParams.brightness !== 0) {
        filters.push(`brightness(${100 + editParams.brightness}%)`);
      }
      
      if (editParams.contrast !== 0) {
        filters.push(`contrast(${100 + editParams.contrast}%)`);
      }
      
      if (editParams.saturation !== 0) {
        filters.push(`saturate(${100 + editParams.saturation}%)`);
      }
      
      if (editParams.highlights !== 0) {
        // Highlights effect using brightness and contrast combination
        const highlightValue = 100 + (editParams.highlights * 0.5);
        filters.push(`brightness(${highlightValue}%)`);
      }
      
      if (editParams.sharpness !== 0) {
        // Sharpness effect using contrast
        const sharpnessValue = 100 + (editParams.sharpness * 0.3);
        filters.push(`contrast(${sharpnessValue}%)`);
      }
      
      ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';
    };
    
    applyFilters(ctx);
    
    const hRatio = rect.width / image.width;
    const vRatio = rect.height / image.height;
    const ratio = Math.max(hRatio, vRatio);
    const finalZoom = zoom * ratio;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    ctx.translate(centerX + x, centerY + y);
    ctx.scale(finalZoom, finalZoom);
    ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
    
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