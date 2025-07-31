import React from 'react';
import { FacebookMetrics } from '../../services/facebookAnalytics';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface LineChartProps {
  data: ChartDataPoint[];
  title: string;
  color?: string;
  height?: number;
  loading?: boolean;
  currency?: boolean;
  percentage?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  color = '#8B5CF6',
  height = 300,
  loading = false,
  currency = false,
  percentage = false
}) => {
  if (loading) {
    return (
      <div className="glassmorphism p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="animate-pulse">
          <div className="bg-gray-600 h-64 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glassmorphism p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Nenhum dado disponível</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const formatValue = (value: number) => {
    if (currency) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    if (percentage) {
      return `${value.toFixed(1)}%`;
    }
    
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Criar pontos do SVG
  const svgWidth = 100;
  const svgHeight = 60;
  const padding = 5;
  
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (svgWidth - 2 * padding);
    const y = padding + ((maxValue - point.value) / range) * (svgHeight - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const pathD = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (svgWidth - 2 * padding);
    const y = padding + ((maxValue - point.value) / range) * (svgHeight - 2 * padding);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  return (
    <div className="glassmorphism p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div className="relative" style={{ height: `${height}px` }}>
        {/* SVG Chart */}
        <svg 
          className="w-full h-full" 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
        >
          {/* Gradient */}
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Area under curve */}
          <path
            d={`${pathD} L ${padding + (svgWidth - 2 * padding)} ${svgHeight - padding} L ${padding} ${svgHeight - padding} Z`}
            fill={`url(#gradient-${title})`}
          />
          
          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Points */}
          {data.map((point, index) => {
            const x = padding + (index / (data.length - 1)) * (svgWidth - 2 * padding);
            const y = padding + ((maxValue - point.value) / range) * (svgHeight - 2 * padding);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="0.3"
                fill={color}
                className="hover:r-1 transition-all duration-200"
              />
            );
          })}
        </svg>
        
        {/* Tooltip overlay */}
        <div className="absolute inset-0 flex">
          {data.map((point, index) => (
            <div
              key={index}
              className="flex-1 group relative cursor-pointer"
              style={{ minHeight: '100%' }}
            >
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-700">
                  <div className="font-medium">{formatValue(point.value)}</div>
                  <div className="text-gray-400">{formatDate(point.date)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-400">
        <span>{formatDate(data[0].date)}</span>
        {data.length > 2 && (
          <span>{formatDate(data[Math.floor(data.length / 2)].date)}</span>
        )}
        <span>{formatDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
};

interface BarChartProps {
  data: ChartDataPoint[];
  title: string;
  color?: string;
  height?: number;
  loading?: boolean;
  currency?: boolean;
  percentage?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  color = '#10B981',
  height = 300,
  loading = false,
  currency = false,
  percentage = false
}) => {
  if (loading) {
    return (
      <div className="glassmorphism p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="animate-pulse">
          <div className="bg-gray-600 h-64 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glassmorphism p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Nenhum dado disponível</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  
  const formatValue = (value: number) => {
    if (currency) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    if (percentage) {
      return `${value.toFixed(1)}%`;
    }
    
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  return (
    <div className="glassmorphism p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div className="space-y-4" style={{ height: `${height}px`, overflowY: 'auto' }}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300 truncate flex-1 mr-4">
                  {item.label || item.date}
                </span>
                <span className="text-sm font-medium text-white">
                  {formatValue(item.value)}
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}40`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface DonutChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  loading?: boolean;
  currency?: boolean;
  percentage?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  loading = false,
  currency = false,
  percentage = false
}) => {
  if (loading) {
    return (
      <div className="glassmorphism p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="animate-pulse">
          <div className="bg-gray-600 h-64 w-64 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glassmorphism p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <p>Nenhum dado disponível</p>
          </div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5A2B'];
  
  const formatValue = (value: number) => {
    if (currency) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    if (percentage) {
      return `${value.toFixed(1)}%`;
    }
    
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  let cumulativePercentage = 0;
  const radius = 80;
  const strokeWidth = 20;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  return (
    <div className="glassmorphism p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="relative">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              stroke="#374151"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            
            {/* Data segments */}
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
              const color = item.color || colors[index % colors.length];
              
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  stroke={color}
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  className="transition-all duration-500"
                  style={{
                    filter: `drop-shadow(0 0 6px ${color}40)`
                  }}
                />
              );
            })}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{data.length}</div>
              <div className="text-xs text-gray-400">itens</div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="space-y-3 flex-1">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const color = item.color || colors[index % colors.length];
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-300 truncate">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {formatValue(item.value)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};