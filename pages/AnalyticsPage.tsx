import React, { useState, useEffect } from 'react';
import { useFacebookAnalytics } from '../hooks/useFacebookAnalytics';
import { AnalyticsFilters as AnalyticsFiltersType } from '../services/facebookAnalytics';
import { MetricsDashboard } from '../components/analytics/MetricsCard';
import { LineChart, BarChart, DonutChart } from '../components/analytics/Charts';
import { AnalyticsFilters } from '../components/analytics/Filters';
import { PerformanceTable } from '../components/analytics/PerformanceTable';
import { ExportData } from '../components/analytics/ExportData';
import { Button } from '../components/Button';

const defaultFilters: AnalyticsFiltersType = {
  period: '30d',
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  },
  pageIds: [],
  adAccountIds: [],
  contentType: 'all'
};

export const AnalyticsPage: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFiltersType>(defaultFilters);
  const [activeTab, setActiveTab] = useState<'posts' | 'campaigns'>('posts');
  const [showExport, setShowExport] = useState(false);

  const {
    metrics,
    posts,
    campaigns,
    pages,
    adAccounts,
    audienceInsights,
    loading,
    loadingPages,
    loadingAdAccounts,
    error,
    fetchData,
    refreshData,
    clearError,
    hasData,
    totalEngagement,
    topPerformingPosts,
    topPerformingCampaigns
  } = useFacebookAnalytics({
    autoFetch: false,
    initialFilters: filters,
    onError: (error) => {
      console.error('Analytics Error:', error);
    }
  });

  // Auto-select all pages and ad accounts when they're loaded
  useEffect(() => {
    if (pages.length > 0 && filters.pageIds?.length === 0) {
      setFilters(prev => ({
        ...prev,
        pageIds: pages.map(page => page.id)
      }));
    }
  }, [pages, filters.pageIds]);

  useEffect(() => {
    if (adAccounts.length > 0 && filters.adAccountIds?.length === 0) {
      setFilters(prev => ({
        ...prev,
        adAccountIds: adAccounts.map(account => account.id)
      }));
    }
  }, [adAccounts, filters.adAccountIds]);

  // Fetch data when filters change
  useEffect(() => {
    if ((filters.pageIds?.length || 0) > 0 || (filters.adAccountIds?.length || 0) > 0) {
      fetchData(filters);
    }
  }, [filters, fetchData]);

  const handleFiltersChange = (newFilters: AnalyticsFiltersType) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refreshData();
  };

  // Prepare chart data
  const engagementTrendData = posts.slice(0, 10).map(post => ({
    label: new Date(post.created_time).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
    value: (post.likes || 0) + (post.comments || 0) + (post.shares || 0)
  }));

  const campaignPerformanceData = campaigns.slice(0, 10).map(campaign => ({
    label: campaign.name.length > 20 ? campaign.name.substring(0, 20) + '...' : campaign.name,
    value: campaign.roas || 0
  }));

  const contentTypeData = [
    {
      label: 'Posts Orgânicos',
      value: posts.length,
      color: '#10B981'
    },
    {
      label: 'Campanhas Pagas',
      value: campaigns.length,
      color: '#8B5CF6'
    }
  ];

  const audienceAgeData = audienceInsights?.age_distribution ? 
    Object.entries(audienceInsights.age_distribution).map(([age, percentage]) => ({
      label: age,
      value: percentage
    })) : [];

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('facebook_access_token');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glassmorphism p-8 rounded-2xl text-center">
            <div className="text-6xl mb-6">🔐</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Acesso Restrito
            </h1>
            <p className="text-gray-300 mb-6">
              Você precisa estar autenticado com o Facebook para acessar os analytics.
            </p>
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Fazer Login com Facebook
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Analytics do Facebook
            </h1>
            <p className="text-gray-300">
              Acompanhe o desempenho das suas páginas e campanhas
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowExport(!showExport)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar</span>
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glassmorphism p-4 rounded-xl border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-red-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-400 font-medium">Erro ao carregar dados</h3>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <AnalyticsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          pages={pages}
          adAccounts={adAccounts}
          loading={loadingPages || loadingAdAccounts}
          onRefresh={handleRefresh}
        />

        {/* Export Panel */}
        {showExport && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="glassmorphism p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Exportação de Dados
                </h3>
                <p className="text-gray-300 text-sm">
                  Exporte seus dados de analytics em formato CSV ou PDF para análises detalhadas e apresentações.
                </p>
              </div>
            </div>
            <ExportData
              metrics={metrics}
              posts={posts}
              campaigns={campaigns}
              filters={filters}
              loading={loading}
            />
          </div>
        )}

        {/* Metrics Dashboard */}
        <MetricsDashboard
          metrics={metrics}
          loading={loading}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <LineChart
            title="Tendência de Engajamento"
            data={engagementTrendData}
            loading={loading}
            valueFormatter={(value) => new Intl.NumberFormat('pt-BR').format(value)}
          />
          
          <BarChart
            title="Performance de Campanhas (ROAS)"
            data={campaignPerformanceData}
            loading={loading}
            valueFormatter={(value) => `${value.toFixed(2)}x`}
          />
          
          <DonutChart
            title="Distribuição de Conteúdo"
            data={contentTypeData}
            loading={loading}
            valueFormatter={(value) => new Intl.NumberFormat('pt-BR').format(value)}
          />
        </div>

        {/* Audience Insights */}
        {audienceInsights && audienceAgeData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonutChart
              title="Distribuição por Idade"
              data={audienceAgeData.map((item, index) => ({
                ...item,
                color: `hsl(${(index * 360) / audienceAgeData.length}, 70%, 60%)`
              }))}
              loading={loading}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            
            <div className="glassmorphism p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">
                Insights da Audiência
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Gênero Predominante</div>
                  <div className="text-white font-medium">
                    {audienceInsights.gender_distribution.male > audienceInsights.gender_distribution.female ? 'Masculino' : 'Feminino'}
                    <span className="text-gray-400 ml-2">
                      ({Math.max(audienceInsights.gender_distribution.male, audienceInsights.gender_distribution.female).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-1">Principais Países</div>
                  <div className="space-y-1">
                    {Object.entries(audienceInsights.country_distribution)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([country, percentage]) => (
                        <div key={country} className="flex justify-between text-sm">
                          <span className="text-white">{country}</span>
                          <span className="text-gray-400">{percentage.toFixed(1)}%</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tables */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'posts'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'campaigns'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Campanhas ({campaigns.length})
            </button>
          </div>

          {/* Performance Table */}
          <PerformanceTable
            posts={activeTab === 'posts' ? posts : undefined}
            campaigns={activeTab === 'campaigns' ? campaigns : undefined}
            loading={loading}
            type={activeTab}
          />
        </div>

        {/* No Data State */}
        {!loading && !hasData && (
          <div className="glassmorphism p-8 rounded-xl text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum dado encontrado
            </h3>
            <p className="text-gray-300 mb-6">
              Selecione páginas ou contas de anúncios nos filtros acima para visualizar os dados de analytics.
            </p>
            <Button
              onClick={handleRefresh}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Tentar Novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};