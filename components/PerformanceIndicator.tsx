import React, { useState } from 'react';
import { useImagePerformance } from '../hooks/useOptimizedImages';
import { IconLoader, IconPhoto } from './icons';

interface PerformanceIndicatorProps {
  show?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  show = false,
  position = 'bottom-right',
  compact = false
}) => {
  const { metrics } = useImagePerformance();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!show) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const getPerformanceColor = () => {
    const { loadedImages, totalImages, averageLoadTime } = metrics;
    const successRate = totalImages > 0 ? (loadedImages / totalImages) * 100 : 100;
    
    if (successRate >= 95 && averageLoadTime < 1000) return 'text-green-400';
    if (successRate >= 80 && averageLoadTime < 2000) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceIcon = () => {
    const { loadedImages, totalImages } = metrics;
    const successRate = totalImages > 0 ? (loadedImages / totalImages) * 100 : 100;
    
    if (successRate >= 95) return '🚀';
    if (successRate >= 80) return '⚡';
    return '🐌';
  };

  if (compact) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <div 
          className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 hover:bg-black/90"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getPerformanceIcon()}</span>
            <span className={`text-sm font-medium ${getPerformanceColor()}`}>
              {metrics.totalImages > 0 ? `${metrics.loadedImages}/${metrics.totalImages}` : '0/0'}
            </span>
          </div>
          
          {isExpanded && (
            <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-300 space-y-1">
              <div>Taxa de sucesso: {metrics.totalImages > 0 ? Math.round((metrics.loadedImages / metrics.totalImages) * 100) : 0}%</div>
              <div>Tempo médio: {Math.round(metrics.averageLoadTime)}ms</div>
              <div>Cache hit: {Math.round(metrics.cacheHitRate * 100)}%</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[200px] border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <IconPhoto className="w-4 h-4" />
            <span>Performance</span>
          </h3>
          <span className="text-lg">{getPerformanceIcon()}</span>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Imagens carregadas:</span>
            <span className={getPerformanceColor()}>
              {metrics.loadedImages}/{metrics.totalImages}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Taxa de sucesso:</span>
            <span className={getPerformanceColor()}>
              {metrics.totalImages > 0 ? Math.round((metrics.loadedImages / metrics.totalImages) * 100) : 0}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Tempo médio:</span>
            <span className="text-white">{Math.round(metrics.averageLoadTime)}ms</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Cache hit rate:</span>
            <span className="text-green-400">{Math.round(metrics.cacheHitRate * 100)}%</span>
          </div>
          
          {metrics.failedImages > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Falhas:</span>
              <span className="text-red-400">{metrics.failedImages}</span>
            </div>
          )}
        </div>
        
        {/* Barra de progresso visual */}
        <div className="mt-3">
          <div className="bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                metrics.totalImages > 0 && (metrics.loadedImages / metrics.totalImages) >= 0.95
                  ? 'bg-green-500'
                  : metrics.totalImages > 0 && (metrics.loadedImages / metrics.totalImages) >= 0.8
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{
                width: `${metrics.totalImages > 0 ? (metrics.loadedImages / metrics.totalImages) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceIndicator;

// Hook para controlar a visibilidade do indicador
export const usePerformanceIndicator = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  const [isCompact, setIsCompact] = useState(true);

  const toggle = () => setIsVisible(!isVisible);
  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);
  
  const changePosition = (newPosition: typeof position) => setPosition(newPosition);
  const toggleCompact = () => setIsCompact(!isCompact);

  return {
    isVisible,
    position,
    isCompact,
    toggle,
    show,
    hide,
    changePosition,
    toggleCompact,
  };
};