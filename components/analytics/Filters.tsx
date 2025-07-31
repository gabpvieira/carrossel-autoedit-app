import React, { useState } from 'react';
import { AnalyticsFilters, FacebookPage, FacebookAdAccount } from '../../services/facebookAnalytics';
import { Button } from '../Button';

interface DateRangeSelectorProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  filters,
  onFiltersChange
}) => {
  const [showCustom, setShowCustom] = useState(filters.period === 'custom');

  const handlePeriodChange = (period: '7d' | '30d' | '90d' | 'custom') => {
    if (period === 'custom') {
      setShowCustom(true);
      onFiltersChange({ ...filters, period });
    } else {
      setShowCustom(false);
      const end = new Date();
      const start = new Date();
      
      switch (period) {
        case '7d':
          start.setDate(end.getDate() - 7);
          break;
        case '30d':
          start.setDate(end.getDate() - 30);
          break;
        case '90d':
          start.setDate(end.getDate() - 90);
          break;
      }
      
      onFiltersChange({
        ...filters,
        period,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        }
      });
    }
  };

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const periods = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: 'custom', label: 'Período customizado' }
  ];

  return (
    <div className="glassmorphism p-4 rounded-xl">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Período</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => handlePeriodChange(period.value as any)}
            className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
              filters.period === period.value
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
      
      {showCustom && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Data inicial</label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Data final</label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface PageSelectorProps {
  pages: FacebookPage[];
  selectedPageIds: string[];
  onSelectionChange: (pageIds: string[]) => void;
  loading?: boolean;
}

export const PageSelector: React.FC<PageSelectorProps> = ({
  pages,
  selectedPageIds,
  onSelectionChange,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePageToggle = (pageId: string) => {
    const newSelection = selectedPageIds.includes(pageId)
      ? selectedPageIds.filter(id => id !== pageId)
      : [...selectedPageIds, pageId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedPageIds.length === pages.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(pages.map(page => page.id));
    }
  };

  if (loading) {
    return (
      <div className="glassmorphism p-4 rounded-xl">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Páginas do Facebook</h3>
        <div className="animate-pulse">
          <div className="bg-gray-600 h-10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glassmorphism p-4 rounded-xl">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Páginas do Facebook</h3>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm text-left focus:outline-none focus:border-purple-500 transition-colors flex items-center justify-between"
        >
          <span>
            {selectedPageIds.length === 0
              ? 'Selecionar páginas'
              : selectedPageIds.length === pages.length
              ? 'Todas as páginas'
              : `${selectedPageIds.length} página(s) selecionada(s)`
            }
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-600">
              <button
                onClick={handleSelectAll}
                className="w-full px-3 py-2 text-sm text-left text-purple-400 hover:bg-gray-700 rounded transition-colors"
              >
                {selectedPageIds.length === pages.length ? 'Desmarcar todas' : 'Selecionar todas'}
              </button>
            </div>
            
            {pages.map((page) => (
              <label
                key={page.id}
                className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedPageIds.includes(page.id)}
                  onChange={() => handlePageToggle(page.id)}
                  className="mr-3 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="text-sm text-white">{page.name}</div>
                  <div className="text-xs text-gray-400">
                    {page.category} • {new Intl.NumberFormat('pt-BR').format(page.fan_count)} seguidores
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface AdAccountSelectorProps {
  adAccounts: FacebookAdAccount[];
  selectedAdAccountIds: string[];
  onSelectionChange: (adAccountIds: string[]) => void;
  loading?: boolean;
}

export const AdAccountSelector: React.FC<AdAccountSelectorProps> = ({
  adAccounts,
  selectedAdAccountIds,
  onSelectionChange,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAccountToggle = (accountId: string) => {
    const newSelection = selectedAdAccountIds.includes(accountId)
      ? selectedAdAccountIds.filter(id => id !== accountId)
      : [...selectedAdAccountIds, accountId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedAdAccountIds.length === adAccounts.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(adAccounts.map(account => account.id));
    }
  };

  if (loading) {
    return (
      <div className="glassmorphism p-4 rounded-xl">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Contas de Anúncios</h3>
        <div className="animate-pulse">
          <div className="bg-gray-600 h-10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glassmorphism p-4 rounded-xl">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Contas de Anúncios</h3>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm text-left focus:outline-none focus:border-purple-500 transition-colors flex items-center justify-between"
        >
          <span>
            {selectedAdAccountIds.length === 0
              ? 'Selecionar contas'
              : selectedAdAccountIds.length === adAccounts.length
              ? 'Todas as contas'
              : `${selectedAdAccountIds.length} conta(s) selecionada(s)`
            }
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-600">
              <button
                onClick={handleSelectAll}
                className="w-full px-3 py-2 text-sm text-left text-purple-400 hover:bg-gray-700 rounded transition-colors"
              >
                {selectedAdAccountIds.length === adAccounts.length ? 'Desmarcar todas' : 'Selecionar todas'}
              </button>
            </div>
            
            {adAccounts.map((account) => (
              <label
                key={account.id}
                className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedAdAccountIds.includes(account.id)}
                  onChange={() => handleAccountToggle(account.id)}
                  className="mr-3 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="text-sm text-white">{account.name}</div>
                  <div className="text-xs text-gray-400">
                    {account.currency} • Status: {account.account_status === 1 ? 'Ativa' : 'Inativa'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ContentTypeSelectorProps {
  contentType: 'all' | 'organic' | 'paid';
  onContentTypeChange: (type: 'all' | 'organic' | 'paid') => void;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  contentType,
  onContentTypeChange
}) => {
  const options = [
    { value: 'all', label: 'Todos', icon: '📊' },
    { value: 'organic', label: 'Orgânico', icon: '🌱' },
    { value: 'paid', label: 'Pago', icon: '💰' }
  ];

  return (
    <div className="glassmorphism p-4 rounded-xl">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Tipo de Conteúdo</h3>
      
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onContentTypeChange(option.value as any)}
            className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              contentType === option.value
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  pages: FacebookPage[];
  adAccounts: FacebookAdAccount[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFiltersChange,
  pages,
  adAccounts,
  loading = false,
  onRefresh
}) => {
  const handlePageSelectionChange = (pageIds: string[]) => {
    onFiltersChange({ ...filters, pageIds });
  };

  const handleAdAccountSelectionChange = (adAccountIds: string[]) => {
    onFiltersChange({ ...filters, adAccountIds });
  };

  const handleContentTypeChange = (contentType: 'all' | 'organic' | 'paid') => {
    onFiltersChange({ ...filters, contentType });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Filtros</h2>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Atualizar</span>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <DateRangeSelector
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
        
        <PageSelector
          pages={pages}
          selectedPageIds={filters.pageIds || []}
          onSelectionChange={handlePageSelectionChange}
          loading={loading}
        />
        
        <AdAccountSelector
          adAccounts={adAccounts}
          selectedAdAccountIds={filters.adAccountIds || []}
          onSelectionChange={handleAdAccountSelectionChange}
          loading={loading}
        />
        
        <ContentTypeSelector
          contentType={filters.contentType || 'all'}
          onContentTypeChange={handleContentTypeChange}
        />
      </div>
    </div>
  );
};