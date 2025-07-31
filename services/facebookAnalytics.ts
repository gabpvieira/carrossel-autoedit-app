import { getSession } from './authService';
import { mockFacebookApi } from './mockFacebookApi';

// Tipos para as métricas do Facebook
export interface FacebookMetrics {
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  spend: number;
  cpc: number;
  cpm: number;
  ctr: number;
  roas: number;
}

export interface FacebookPost {
  id: string;
  message: string;
  created_time: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  post_type: 'organic' | 'paid';
}

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  followers_count: number;
  fan_count: number;
}

export interface FacebookAdAccount {
  id: string;
  name: string;
  currency: string;
  account_status: number;
  spend_cap: number;
}

export interface FacebookCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  cpm: number;
  ctr: number;
  reach: number;
  created_time: string;
}

export interface FacebookAudienceInsights {
  age_ranges: { [key: string]: number };
  genders: { [key: string]: number };
  countries: { [key: string]: number };
  interests: string[];
}

export interface AnalyticsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  pageIds?: string[];
  adAccountIds?: string[];
  contentType?: 'all' | 'organic' | 'paid';
  period?: '7d' | '30d' | '90d' | 'custom';
}

export class FacebookAnalyticsService {
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos
  private readonly USE_MOCK = true; // Alterar para false em produção

  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    // Se estiver usando mock, não fazer requisições reais
    if (this.USE_MOCK) {
      return {}; // Retorna dados vazios pois o mock é usado diretamente nos métodos
    }

    const session = getSession();
    if (!session?.token) {
      throw new Error('Token do Facebook não encontrado');
    }

    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('access_token', session.token);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro na API do Facebook');
      }

      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('Erro na requisição Facebook API:', error);
      throw error;
    }
  }

  async getUserPages(): Promise<FacebookPage[]> {
    if (this.USE_MOCK) {
      return mockFacebookApi.getPages();
    }

    const response = await this.makeRequest('/me/accounts', {
      fields: 'id,name,category,followers_count,fan_count'
    });
    
    return response.data || [];
  }

  async getUserAdAccounts(): Promise<FacebookAdAccount[]> {
    if (this.USE_MOCK) {
      return mockFacebookApi.getAdAccounts();
    }

    const response = await this.makeRequest('/me/adaccounts', {
      fields: 'id,name,currency,account_status,spend_cap'
    });
    
    return response.data || [];
  }

  async getPageInsights(pageId: string, filters: AnalyticsFilters): Promise<FacebookMetrics> {
    const { dateRange } = filters;
    
    const response = await this.makeRequest(`/${pageId}/insights`, {
      metric: 'page_impressions,page_reach,page_engaged_users,page_post_engagements',
      since: dateRange.start,
      until: dateRange.end,
      period: 'day'
    });

    // Processar e agregar os dados
    const metrics = this.aggregateMetrics(response.data);
    return metrics;
  }

  async getPagePosts(pageId: string, filters: AnalyticsFilters): Promise<FacebookPost[]> {
    if (this.USE_MOCK) {
      return mockFacebookApi.getPosts([pageId], filters.dateRange.start, filters.dateRange.end);
    }

    const { dateRange } = filters;
    
    const response = await this.makeRequest(`/${pageId}/posts`, {
      fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
      since: dateRange.start,
      until: dateRange.end,
      limit: 100
    });

    const posts = response.data || [];
    
    // Buscar insights para cada post
    const postsWithInsights = await Promise.all(
      posts.map(async (post: any) => {
        try {
          const insights = await this.makeRequest(`/${post.id}/insights`, {
            metric: 'post_impressions,post_reach,post_engaged_users'
          });
          
          const impressions = insights.data?.find((m: any) => m.name === 'post_impressions')?.values[0]?.value || 0;
          const reach = insights.data?.find((m: any) => m.name === 'post_reach')?.values[0]?.value || 0;
          const engagement = insights.data?.find((m: any) => m.name === 'post_engaged_users')?.values[0]?.value || 0;
          
          return {
            id: post.id,
            message: post.message || '',
            created_time: post.created_time,
            likes: post.likes?.summary?.total_count || 0,
            comments: post.comments?.summary?.total_count || 0,
            shares: post.shares?.count || 0,
            reach,
            impressions,
            engagement_rate: reach > 0 ? (engagement / reach) * 100 : 0,
            post_type: 'organic' as const
          };
        } catch (error) {
          console.warn(`Erro ao buscar insights do post ${post.id}:`, error);
          return {
            id: post.id,
            message: post.message || '',
            created_time: post.created_time,
            likes: post.likes?.summary?.total_count || 0,
            comments: post.comments?.summary?.total_count || 0,
            shares: post.shares?.count || 0,
            reach: 0,
            impressions: 0,
            engagement_rate: 0,
            post_type: 'organic' as const
          };
        }
      })
    );

    return postsWithInsights;
  }

  async getAdAccountInsights(adAccountId: string, filters: AnalyticsFilters): Promise<FacebookMetrics> {
    const { dateRange } = filters;
    
    const response = await this.makeRequest(`/${adAccountId}/insights`, {
      fields: 'impressions,reach,clicks,spend,cpc,cpm,ctr',
      time_range: JSON.stringify({
        since: dateRange.start,
        until: dateRange.end
      }),
      level: 'account'
    });

    const data = response.data?.[0] || {};
    
    return {
      impressions: parseInt(data.impressions) || 0,
      reach: parseInt(data.reach) || 0,
      engagement: 0, // Calculado separadamente
      clicks: parseInt(data.clicks) || 0,
      spend: parseFloat(data.spend) || 0,
      cpc: parseFloat(data.cpc) || 0,
      cpm: parseFloat(data.cpm) || 0,
      ctr: parseFloat(data.ctr) || 0,
      roas: 0 // Calculado com dados de conversão
    };
  }

  async getCampaigns(adAccountId: string, filters: AnalyticsFilters): Promise<FacebookCampaign[]> {
    if (this.USE_MOCK) {
      return mockFacebookApi.getCampaigns([adAccountId], filters.dateRange.start, filters.dateRange.end);
    }

    const { dateRange } = filters;
    
    const response = await this.makeRequest(`/${adAccountId}/campaigns`, {
      fields: 'id,name,status,objective,created_time',
      effective_status: ['ACTIVE', 'PAUSED'],
      time_range: JSON.stringify({
        since: dateRange.start,
        until: dateRange.end
      })
    });

    const campaigns = response.data || [];
    
    // Buscar insights para cada campanha
    const campaignsWithInsights = await Promise.all(
      campaigns.map(async (campaign: any) => {
        try {
          const insights = await this.makeRequest(`/${campaign.id}/insights`, {
            fields: 'impressions,reach,clicks,spend,cpc,cpm,ctr',
            time_range: JSON.stringify({
              since: dateRange.start,
              until: dateRange.end
            })
          });
          
          const data = insights.data?.[0] || {};
          
          return {
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            objective: campaign.objective,
            spend: parseFloat(data.spend) || 0,
            impressions: parseInt(data.impressions) || 0,
            clicks: parseInt(data.clicks) || 0,
            cpc: parseFloat(data.cpc) || 0,
            cpm: parseFloat(data.cpm) || 0,
            ctr: parseFloat(data.ctr) || 0,
            reach: parseInt(data.reach) || 0,
            created_time: campaign.created_time
          };
        } catch (error) {
          console.warn(`Erro ao buscar insights da campanha ${campaign.id}:`, error);
          return {
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            objective: campaign.objective,
            spend: 0,
            impressions: 0,
            clicks: 0,
            cpc: 0,
            cpm: 0,
            ctr: 0,
            reach: 0,
            created_time: campaign.created_time
          };
        }
      })
    );

    return campaignsWithInsights;
  }

  async getAudienceInsights(adAccountId: string, filters: AnalyticsFilters): Promise<FacebookAudienceInsights> {
    if (this.USE_MOCK) {
      return mockFacebookApi.getAudienceInsights();
    }

    const { dateRange } = filters;
    
    try {
      const response = await this.makeRequest(`/${adAccountId}/insights`, {
        fields: 'impressions',
        breakdowns: 'age,gender,country',
        time_range: JSON.stringify({
          since: dateRange.start,
          until: dateRange.end
        })
      });

      const data = response.data || [];
      
      const ageRanges: { [key: string]: number } = {};
      const genders: { [key: string]: number } = {};
      const countries: { [key: string]: number } = {};
      
      data.forEach((item: any) => {
        const impressions = parseInt(item.impressions) || 0;
        
        if (item.age) {
          ageRanges[item.age] = (ageRanges[item.age] || 0) + impressions;
        }
        
        if (item.gender) {
          genders[item.gender] = (genders[item.gender] || 0) + impressions;
        }
        
        if (item.country) {
          countries[item.country] = (countries[item.country] || 0) + impressions;
        }
      });
      
      return {
        age_ranges: ageRanges,
        genders,
        countries,
        interests: [] // Requer permissões especiais
      };
    } catch (error) {
      console.warn('Erro ao buscar insights de audiência:', error);
      return {
        age_ranges: {},
        genders: {},
        countries: {},
        interests: []
      };
    }
  }

  private aggregateMetrics(data: any[]): FacebookMetrics {
    const totals = data.reduce((acc, item) => {
      const value = item.values?.[0]?.value || 0;
      
      switch (item.name) {
        case 'page_impressions':
          acc.impressions += value;
          break;
        case 'page_reach':
          acc.reach += value;
          break;
        case 'page_engaged_users':
          acc.engagement += value;
          break;
        case 'page_post_engagements':
          acc.clicks += value;
          break;
      }
      
      return acc;
    }, {
      impressions: 0,
      reach: 0,
      engagement: 0,
      clicks: 0,
      spend: 0,
      cpc: 0,
      cpm: 0,
      ctr: 0,
      roas: 0
    });

    // Calcular métricas derivadas
    if (totals.impressions > 0) {
      totals.ctr = (totals.clicks / totals.impressions) * 100;
    }
    
    if (totals.reach > 0) {
      totals.cpm = (totals.spend / totals.impressions) * 1000;
    }

    return totals;
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Utilitários para formatação de dados
  formatCurrency(value: number, currency = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  // Geração de períodos predefinidos
  getDateRange(period: '7d' | '30d' | '90d'): { start: string; end: string } {
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
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }
}

export const facebookAnalyticsService = new FacebookAnalyticsService();