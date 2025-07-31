import { useState, useEffect, useCallback, useMemo } from 'react';
import { facebookAnalyticsService, FacebookMetrics, FacebookPost, FacebookCampaign, FacebookPage, FacebookAdAccount, AnalyticsFilters, FacebookAudienceInsights } from '../services/facebookAnalytics';

interface UseFacebookAnalyticsReturn {
  // Data
  metrics: FacebookMetrics;
  posts: FacebookPost[];
  campaigns: FacebookCampaign[];
  pages: FacebookPage[];
  adAccounts: FacebookAdAccount[];
  audienceInsights: FacebookAudienceInsights | null;
  
  // Loading states
  loading: boolean;
  loadingMetrics: boolean;
  loadingPosts: boolean;
  loadingCampaigns: boolean;
  loadingPages: boolean;
  loadingAdAccounts: boolean;
  loadingAudience: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchData: (filters: AnalyticsFilters) => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  
  // Computed values
  hasData: boolean;
  totalEngagement: number;
  averageCPC: number;
  averageCPM: number;
  topPerformingPosts: FacebookPost[];
  topPerformingCampaigns: FacebookCampaign[];
}

interface UseFacebookAnalyticsOptions {
  autoFetch?: boolean;
  initialFilters?: AnalyticsFilters;
  onError?: (error: string) => void;
}

const defaultFilters: AnalyticsFilters = {
  period: '30d',
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  },
  pageIds: [],
  adAccountIds: [],
  contentType: 'all'
};

export const useFacebookAnalytics = (options: UseFacebookAnalyticsOptions = {}): UseFacebookAnalyticsReturn => {
  const {
    autoFetch = true,
    initialFilters = defaultFilters,
    onError
  } = options;

  // State
  const [metrics, setMetrics] = useState<FacebookMetrics>({
    impressions: 0,
    reach: 0,
    engagement: 0,
    clicks: 0,
    spend: 0,
    cpc: 0,
    cpm: 0,
    roas: 0
  });
  
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [campaigns, setCampaigns] = useState<FacebookCampaign[]>([]);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [adAccounts, setAdAccounts] = useState<FacebookAdAccount[]>([]);
  const [audienceInsights, setAudienceInsights] = useState<FacebookAudienceInsights | null>(null);
  
  // Loading states
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingAdAccounts, setLoadingAdAccounts] = useState(false);
  const [loadingAudience, setLoadingAudience] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<AnalyticsFilters>(initialFilters);
  
  // Service instance - usar a instância exportada
  const analyticsService = facebookAnalyticsService;

  // Computed values
  const loading = loadingMetrics || loadingPosts || loadingCampaigns || loadingPages || loadingAdAccounts || loadingAudience;
  
  const hasData = useMemo(() => {
    return metrics.impressions > 0 || posts.length > 0 || campaigns.length > 0;
  }, [metrics.impressions, posts.length, campaigns.length]);
  
  const totalEngagement = useMemo(() => {
    return posts.reduce((total, post) => {
      return total + (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
    }, 0);
  }, [posts]);
  
  const averageCPC = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.spend && c.spend > 0);
    if (activeCampaigns.length === 0) return 0;
    
    const totalCPC = activeCampaigns.reduce((sum, campaign) => sum + (campaign.cpc || 0), 0);
    return totalCPC / activeCampaigns.length;
  }, [campaigns]);
  
  const averageCPM = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.spend && c.spend > 0);
    if (activeCampaigns.length === 0) return 0;
    
    const totalCPM = activeCampaigns.reduce((sum, campaign) => sum + (campaign.cpm || 0), 0);
    return totalCPM / activeCampaigns.length;
  }, [campaigns]);
  
  const topPerformingPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => {
        const engagementA = (a.likes || 0) + (a.comments || 0) + (a.shares || 0);
        const engagementB = (b.likes || 0) + (b.comments || 0) + (b.shares || 0);
        return engagementB - engagementA;
      })
      .slice(0, 10);
  }, [posts]);
  
  const topPerformingCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => (b.roas || 0) - (a.roas || 0))
      .slice(0, 10);
  }, [campaigns]);

  // Error handling
  const handleError = useCallback((err: any) => {
    const errorMessage = err.response?.data?.error?.message || err.message || 'Erro desconhecido';
    setError(errorMessage);
    
    if (onError) {
      onError(errorMessage);
    }
    
    console.error('Facebook Analytics Error:', err);
  }, [onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch functions
  const fetchPages = useCallback(async () => {
    setLoadingPages(true);
    try {
      const pagesData = await analyticsService.getPages();
      setPages(pagesData);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingPages(false);
    }
  }, [analyticsService, handleError]);

  const fetchAdAccounts = useCallback(async () => {
    setLoadingAdAccounts(true);
    try {
      const adAccountsData = await analyticsService.getAdAccounts();
      setAdAccounts(adAccountsData);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingAdAccounts(false);
    }
  }, [analyticsService, handleError]);

  const fetchPosts = useCallback(async (filters: AnalyticsFilters) => {
    if (!filters.pageIds || filters.pageIds.length === 0) {
      setPosts([]);
      return;
    }

    setLoadingPosts(true);
    try {
      const allPosts: FacebookPost[] = [];
      
      for (const pageId of filters.pageIds) {
        const pagePosts = await analyticsService.getPagePosts(
          pageId,
          filters.dateRange.start,
          filters.dateRange.end
        );
        allPosts.push(...pagePosts);
      }
      
      setPosts(allPosts);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingPosts(false);
    }
  }, [analyticsService, handleError]);

  const fetchCampaigns = useCallback(async (filters: AnalyticsFilters) => {
    if (!filters.adAccountIds || filters.adAccountIds.length === 0) {
      setCampaigns([]);
      return;
    }

    setLoadingCampaigns(true);
    try {
      const allCampaigns: FacebookCampaign[] = [];
      
      for (const adAccountId of filters.adAccountIds) {
        const accountCampaigns = await analyticsService.getCampaigns(
          adAccountId,
          filters.dateRange.start,
          filters.dateRange.end
        );
        allCampaigns.push(...accountCampaigns);
      }
      
      setCampaigns(allCampaigns);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingCampaigns(false);
    }
  }, [analyticsService, handleError]);

  const fetchAudienceInsights = useCallback(async (filters: AnalyticsFilters) => {
    if (!filters.adAccountIds || filters.adAccountIds.length === 0) {
      setAudienceInsights(null);
      return;
    }

    setLoadingAudience(true);
    try {
      // Usar a primeira conta de anúncios para insights de audiência
      const adAccountId = filters.adAccountIds[0];
      const insights = await analyticsService.getAudienceInsights(
        adAccountId,
        filters.dateRange.start,
        filters.dateRange.end
      );
      setAudienceInsights(insights);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingAudience(false);
    }
  }, [analyticsService, handleError]);

  const calculateMetrics = useCallback((posts: FacebookPost[], campaigns: FacebookCampaign[]) => {
    setLoadingMetrics(true);
    
    try {
      // Agregar métricas de posts
      const postMetrics = posts.reduce((acc, post) => {
        return {
          impressions: acc.impressions + (post.impressions || 0),
          reach: acc.reach + (post.reach || 0),
          engagement: acc.engagement + (post.likes || 0) + (post.comments || 0) + (post.shares || 0),
          clicks: acc.clicks,
          spend: acc.spend,
          cpc: acc.cpc,
          cpm: acc.cpm,
          roas: acc.roas
        };
      }, { impressions: 0, reach: 0, engagement: 0, clicks: 0, spend: 0, cpc: 0, cpm: 0, roas: 0 });
      
      // Agregar métricas de campanhas
      const campaignMetrics = campaigns.reduce((acc, campaign) => {
        return {
          impressions: acc.impressions + (campaign.impressions || 0),
          reach: acc.reach,
          engagement: acc.engagement,
          clicks: acc.clicks + (campaign.clicks || 0),
          spend: acc.spend + (campaign.spend || 0),
          cpc: acc.cpc,
          cpm: acc.cpm,
          roas: acc.roas
        };
      }, { impressions: 0, reach: 0, engagement: 0, clicks: 0, spend: 0, cpc: 0, cpm: 0, roas: 0 });
      
      // Calcular métricas combinadas
      const totalImpressions = postMetrics.impressions + campaignMetrics.impressions;
      const totalClicks = campaignMetrics.clicks;
      const totalSpend = campaignMetrics.spend;
      
      const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
      const avgCPM = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
      
      // Calcular ROAS (assumindo conversões baseadas em cliques)
      const estimatedRevenue = totalClicks * 50; // Valor estimado por conversão
      const roas = totalSpend > 0 ? estimatedRevenue / totalSpend : 0;
      
      const combinedMetrics: FacebookMetrics = {
        impressions: totalImpressions,
        reach: postMetrics.reach,
        engagement: postMetrics.engagement,
        clicks: totalClicks,
        spend: totalSpend,
        cpc: avgCPC,
        cpm: avgCPM,
        roas: roas
      };
      
      setMetrics(combinedMetrics);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingMetrics(false);
    }
  }, [handleError]);

  // Main fetch function
  const fetchData = useCallback(async (filters: AnalyticsFilters) => {
    setCurrentFilters(filters);
    clearError();
    
    try {
      // Fetch posts and campaigns in parallel
      await Promise.all([
        fetchPosts(filters),
        fetchCampaigns(filters),
        fetchAudienceInsights(filters)
      ]);
    } catch (err) {
      handleError(err);
    }
  }, [fetchPosts, fetchCampaigns, fetchAudienceInsights, handleError, clearError]);

  const refreshData = useCallback(async () => {
    await fetchData(currentFilters);
  }, [fetchData, currentFilters]);

  // Calculate metrics when posts or campaigns change
  useEffect(() => {
    calculateMetrics(posts, campaigns);
  }, [posts, campaigns, calculateMetrics]);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch pages and ad accounts first
        await Promise.all([fetchPages(), fetchAdAccounts()]);
        
        // Then fetch analytics data if autoFetch is enabled
        if (autoFetch) {
          await fetchData(initialFilters);
        }
      } catch (err) {
        handleError(err);
      }
    };
    
    initializeData();
  }, [autoFetch, initialFilters, fetchPages, fetchAdAccounts, fetchData, handleError]);

  return {
    // Data
    metrics,
    posts,
    campaigns,
    pages,
    adAccounts,
    audienceInsights,
    
    // Loading states
    loading,
    loadingMetrics,
    loadingPosts,
    loadingCampaigns,
    loadingPages,
    loadingAdAccounts,
    loadingAudience,
    
    // Error states
    error,
    
    // Actions
    fetchData,
    refreshData,
    clearError,
    
    // Computed values
    hasData,
    totalEngagement,
    averageCPC,
    averageCPM,
    topPerformingPosts,
    topPerformingCampaigns
  };
};