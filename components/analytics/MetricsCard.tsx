import React from 'react';
import { FacebookMetrics } from '../../services/facebookAnalytics';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  loading?: boolean;
  currency?: boolean;
  percentage?: boolean;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  loading = false,
  currency = false,
  percentage = false
}) => {
  const formatValue = (val: string | number) => {
    if (loading) return '---';
    
    if (typeof val === 'number') {
      if (currency) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(val);
      }
      
      if (percentage) {
        return `${val.toFixed(2)}%`;
      }
      
      return new Intl.NumberFormat('pt-BR').format(val);
    }
    
    return val;
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-400';
      case 'decrease':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return '↗';
      case 'decrease':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <div className="glassmorphism p-6 rounded-xl hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-400 text-sm font-medium">{title}</div>
        <div className="text-purple-400">{icon}</div>
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold text-white">
          {loading ? (
            <div className="animate-pulse bg-gray-600 h-8 w-24 rounded"></div>
          ) : (
            formatValue(value)
          )}
        </div>
        
        {change !== undefined && !loading && (
          <div className={`flex items-center text-sm ${getChangeColor()}`}>
            <span className="mr-1">{getChangeIcon()}</span>
            <span>{Math.abs(change).toFixed(1)}%</span>
            <span className="ml-1 text-gray-500">vs período anterior</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface MetricsDashboardProps {
  metrics: FacebookMetrics;
  loading?: boolean;
  previousMetrics?: FacebookMetrics;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  loading = false,
  previousMetrics
}) => {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeType = (change: number): 'increase' | 'decrease' | 'neutral' => {
    if (change > 0) return 'increase';
    if (change < 0) return 'decrease';
    return 'neutral';
  };

  const metricsConfig = [
    {
      title: 'Impressões',
      value: metrics.impressions,
      change: previousMetrics ? calculateChange(metrics.impressions, previousMetrics.impressions) : undefined,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      title: 'Alcance',
      value: metrics.reach,
      change: previousMetrics ? calculateChange(metrics.reach, previousMetrics.reach) : undefined,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: 'Engajamento',
      value: metrics.engagement,
      change: previousMetrics ? calculateChange(metrics.engagement, previousMetrics.engagement) : undefined,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      title: 'Cliques',
      value: metrics.clicks,
      change: previousMetrics ? calculateChange(metrics.clicks, previousMetrics.clicks) : undefined,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    },
    {
      title: 'Gastos',
      value: metrics.spend,
      change: previousMetrics ? calculateChange(metrics.spend, previousMetrics.spend) : undefined,
      currency: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      title: 'CPC',
      value: metrics.cpc,
      change: previousMetrics ? calculateChange(metrics.cpc, previousMetrics.cpc) : undefined,
      currency: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'CTR',
      value: metrics.ctr,
      change: previousMetrics ? calculateChange(metrics.ctr, previousMetrics.ctr) : undefined,
      percentage: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      title: 'ROAS',
      value: metrics.roas,
      change: previousMetrics ? calculateChange(metrics.roas, previousMetrics.roas) : undefined,
      percentage: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsConfig.map((metric, index) => {
        const change = metric.change;
        const changeType = change !== undefined ? getChangeType(change) : undefined;
        
        return (
          <MetricsCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={change}
            changeType={changeType}
            icon={metric.icon}
            loading={loading}
            currency={metric.currency}
            percentage={metric.percentage}
          />
        );
      })}
    </div>
  );
};