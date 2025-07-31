import React, { useState, useMemo } from 'react';
import { FacebookPost, FacebookCampaign } from '../../services/facebookAnalytics';

interface PerformanceTableProps {
  posts?: FacebookPost[];
  campaigns?: FacebookCampaign[];
  loading?: boolean;
  type: 'posts' | 'campaigns';
}

type SortField = 'engagement' | 'reach' | 'impressions' | 'clicks' | 'spend' | 'cpc' | 'cpm' | 'roas';
type SortDirection = 'asc' | 'desc';

export const PerformanceTable: React.FC<PerformanceTableProps> = ({
  posts = [],
  campaigns = [],
  loading = false,
  type
}) => {
  const [sortField, setSortField] = useState<SortField>('engagement');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const data = type === 'posts' ? posts : campaigns;

  const sortedData = useMemo(() => {
    if (!data.length) return [];

    return [...data].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      if (type === 'posts') {
        const postA = a as FacebookPost;
        const postB = b as FacebookPost;
        
        switch (sortField) {
          case 'engagement':
            aValue = (postA.likes || 0) + (postA.comments || 0) + (postA.shares || 0);
            bValue = (postB.likes || 0) + (postB.comments || 0) + (postB.shares || 0);
            break;
          case 'reach':
            aValue = postA.reach || 0;
            bValue = postB.reach || 0;
            break;
          case 'impressions':
            aValue = postA.impressions || 0;
            bValue = postB.impressions || 0;
            break;
          default:
            aValue = 0;
            bValue = 0;
        }
      } else {
        const campaignA = a as FacebookCampaign;
        const campaignB = b as FacebookCampaign;
        
        switch (sortField) {
          case 'impressions':
            aValue = campaignA.impressions || 0;
            bValue = campaignB.impressions || 0;
            break;
          case 'clicks':
            aValue = campaignA.clicks || 0;
            bValue = campaignB.clicks || 0;
            break;
          case 'spend':
            aValue = campaignA.spend || 0;
            bValue = campaignB.spend || 0;
            break;
          case 'cpc':
            aValue = campaignA.cpc || 0;
            bValue = campaignB.cpc || 0;
            break;
          case 'cpm':
            aValue = campaignA.cpm || 0;
            bValue = campaignB.cpm || 0;
            break;
          case 'roas':
            aValue = campaignA.roas || 0;
            bValue = campaignB.roas || 0;
            break;
          default:
            aValue = 0;
            bValue = 0;
        }
      }

      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [data, sortField, sortDirection, type]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatValue = (value: number | undefined, type: 'currency' | 'number' | 'percentage') => {
    if (value === undefined || value === null) return '-';
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('pt-BR').format(value);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="glassmorphism p-6 rounded-xl">
        <div className="animate-pulse">
          <div className="bg-gray-600 h-6 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-600 h-12 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="glassmorphism p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">
          {type === 'posts' ? 'Posts Mais Performáticos' : 'Campanhas Mais Performáticas'}
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <p className="text-gray-400">
            Nenhum {type === 'posts' ? 'post' : 'campanha'} encontrado para o período selecionado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glassmorphism p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          {type === 'posts' ? 'Posts Mais Performáticos' : 'Campanhas Mais Performáticas'}
        </h3>
        <div className="text-sm text-gray-400">
          {sortedData.length} {type === 'posts' ? 'posts' : 'campanhas'}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                {type === 'posts' ? 'Post' : 'Campanha'}
              </th>
              
              {type === 'posts' ? (
                <>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">
                    <button
                      onClick={() => handleSort('engagement')}
                      className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                    >
                      <span>Engajamento</span>
                      <SortIcon field="engagement" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">
                    <button
                      onClick={() => handleSort('reach')}
                      className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                    >
                      <span>Alcance</span>
                      <SortIcon field="reach" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">
                    <button
                      onClick={() => handleSort('impressions')}
                      className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                    >
                      <span>Impressões</span>
                      <SortIcon field="impressions" />
                    </button>
                  </th>
                </>
              ) : (
                <>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">
                    <button
                      onClick={() => handleSort('impressions')}
                      className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                    >
                      <span>Impressões</span>
                      <SortIcon field="impressions" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">
                    <button
                      onClick={() => handleSort('clicks')}
                      className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                    >
                      <span>Cliques</span>
                      <SortIcon field="clicks" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">
                    <button
                      onClick={() => handleSort('spend')}
                      className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                    >
                      <span>Gasto</span>
                      <SortIcon field="spend" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">
                    <button
                      onClick={() => handleSort('cpc')}
                      className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                    >
                      <span>CPC</span>
                      <SortIcon field="cpc" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">
                    <button
                      onClick={() => handleSort('roas')}
                      className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                    >
                      <span>ROAS</span>
                      <SortIcon field="roas" />
                    </button>
                  </th>
                </>
              )}
              
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Data</th>
            </tr>
          </thead>
          
          <tbody>
            {paginatedData.map((item, index) => {
              if (type === 'posts') {
                const post = item as FacebookPost;
                const engagement = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
                
                return (
                  <tr key={post.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <p className="text-white text-sm font-medium truncate">
                          {post.message || 'Post sem texto'}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">ID: {post.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-white text-sm">
                      {formatValue(engagement, 'number')}
                    </td>
                    <td className="py-4 px-4 text-right text-white text-sm">
                      {formatValue(post.reach, 'number')}
                    </td>
                    <td className="py-4 px-4 text-right text-white text-sm">
                      {formatValue(post.impressions, 'number')}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-400 text-sm">
                      {formatDate(post.created_time)}
                    </td>
                  </tr>
                );
              } else {
                const campaign = item as FacebookCampaign;
                
                return (
                  <tr key={campaign.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <p className="text-white text-sm font-medium truncate">
                          {campaign.name}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Status: {campaign.status === 'ACTIVE' ? 'Ativa' : campaign.status}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-white text-sm">
                      {formatValue(campaign.impressions, 'number')}
                    </td>
                    <td className="py-4 px-4 text-right text-white text-sm">
                      {formatValue(campaign.clicks, 'number')}
                    </td>
                    <td className="py-4 px-4 text-right text-white text-sm">
                      {formatValue(campaign.spend, 'currency')}
                    </td>
                    <td className="py-4 px-4 text-right text-white text-sm">
                      {formatValue(campaign.cpc, 'currency')}
                    </td>
                    <td className="py-4 px-4 text-right text-white text-sm">
                      {formatValue(campaign.roas, 'number')}x
                    </td>
                    <td className="py-4 px-4 text-right text-gray-400 text-sm">
                      {formatDate(campaign.created_time)}
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, sortedData.length)} de {sortedData.length} resultados
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      currentPage === pageNum
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};