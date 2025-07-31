// Mock service para simular dados da API do Facebook
// Em produção, isso seria substituído por chamadas reais à API

import { 
  FacebookMetrics, 
  FacebookPost, 
  FacebookPage, 
  FacebookAdAccount, 
  FacebookCampaign, 
  FacebookAudienceInsights 
} from './facebookAnalytics';

// Dados mock para demonstração
const mockPages: FacebookPage[] = [
  {
    id: 'page_1',
    name: 'Minha Empresa',
    category: 'Business',
    followers_count: 15420,
    likes_count: 14890
  },
  {
    id: 'page_2', 
    name: 'Loja Online',
    category: 'Retail',
    followers_count: 8750,
    likes_count: 8320
  }
];

const mockAdAccounts: FacebookAdAccount[] = [
  {
    id: 'act_123456789',
    name: 'Conta Principal',
    currency: 'BRL',
    timezone_name: 'America/Sao_Paulo'
  },
  {
    id: 'act_987654321',
    name: 'Conta Secundária', 
    currency: 'BRL',
    timezone_name: 'America/Sao_Paulo'
  }
];

const generateMockMetrics = (baseValue: number, variance: number = 0.2): FacebookMetrics => {
  const randomVariance = () => 1 + (Math.random() - 0.5) * variance;
  
  return {
    impressions: Math.floor(baseValue * 100 * randomVariance()),
    reach: Math.floor(baseValue * 80 * randomVariance()),
    engagement: Math.floor(baseValue * 15 * randomVariance()),
    clicks: Math.floor(baseValue * 12 * randomVariance()),
    likes: Math.floor(baseValue * 8 * randomVariance()),
    comments: Math.floor(baseValue * 3 * randomVariance()),
    shares: Math.floor(baseValue * 2 * randomVariance()),
    video_views: Math.floor(baseValue * 25 * randomVariance()),
    spend: parseFloat((baseValue * 0.5 * randomVariance()).toFixed(2)),
    cpc: parseFloat((0.15 + Math.random() * 0.3).toFixed(2)),
    cpm: parseFloat((2.5 + Math.random() * 5).toFixed(2)),
    ctr: parseFloat((1.2 + Math.random() * 2.8).toFixed(2)),
    roas: parseFloat((2.5 + Math.random() * 3.5).toFixed(2))
  };
};

const generateMockPosts = (count: number): FacebookPost[] => {
  const posts: FacebookPost[] = [];
  const postTypes = ['photo', 'video', 'link', 'status'] as const;
  const sampleMessages = [
    'Confira nossa nova promoção! 🎉',
    'Dica importante para nossos seguidores',
    'Novidade chegando em breve...',
    'Obrigado pelo carinho de todos! ❤️',
    'Vem conferir nossos produtos',
    'Final de semana chegando! 🌟'
  ];

  for (let i = 0; i < count; i++) {
    const baseValue = 50 + Math.random() * 200;
    const createdTime = new Date();
    createdTime.setDate(createdTime.getDate() - Math.floor(Math.random() * 30));

    posts.push({
      id: `post_${i + 1}`,
      message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
      type: postTypes[Math.floor(Math.random() * postTypes.length)],
      created_time: createdTime.toISOString(),
      page_id: mockPages[Math.floor(Math.random() * mockPages.length)].id,
      metrics: generateMockMetrics(baseValue)
    });
  }

  return posts.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime());
};

const generateMockCampaigns = (count: number): FacebookCampaign[] => {
  const campaigns: FacebookCampaign[] = [];
  const campaignNames = [
    'Campanha de Verão 2024',
    'Black Friday Especial',
    'Lançamento Produto X',
    'Remarketing Geral',
    'Promoção Fim de Ano',
    'Campanha Brand Awareness'
  ];
  const objectives = ['CONVERSIONS', 'TRAFFIC', 'REACH', 'ENGAGEMENT'] as const;
  const statuses = ['ACTIVE', 'PAUSED', 'COMPLETED'] as const;

  for (let i = 0; i < count; i++) {
    const baseValue = 100 + Math.random() * 500;
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 60));
    
    const endTime = new Date(startTime);
    endTime.setDate(endTime.getDate() + 7 + Math.floor(Math.random() * 30));

    campaigns.push({
      id: `campaign_${i + 1}`,
      name: campaignNames[Math.floor(Math.random() * campaignNames.length)],
      objective: objectives[Math.floor(Math.random() * objectives.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      ad_account_id: mockAdAccounts[Math.floor(Math.random() * mockAdAccounts.length)].id,
      metrics: generateMockMetrics(baseValue)
    });
  }

  return campaigns.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
};

const generateMockAudienceInsights = (): FacebookAudienceInsights => {
  return {
    age_gender: [
      { age_range: '18-24', gender: 'male', percentage: 15.2 },
      { age_range: '18-24', gender: 'female', percentage: 18.7 },
      { age_range: '25-34', gender: 'male', percentage: 22.1 },
      { age_range: '25-34', gender: 'female', percentage: 25.3 },
      { age_range: '35-44', gender: 'male', percentage: 8.9 },
      { age_range: '35-44', gender: 'female', percentage: 9.8 }
    ],
    countries: [
      { country: 'Brazil', percentage: 78.5 },
      { country: 'United States', percentage: 12.3 },
      { country: 'Portugal', percentage: 4.2 },
      { country: 'Other', percentage: 5.0 }
    ],
    cities: [
      { city: 'São Paulo', percentage: 28.7 },
      { city: 'Rio de Janeiro', percentage: 15.2 },
      { city: 'Belo Horizonte', percentage: 8.9 },
      { city: 'Brasília', percentage: 6.4 },
      { city: 'Other', percentage: 40.8 }
    ],
    devices: [
      { device: 'mobile', percentage: 82.3 },
      { device: 'desktop', percentage: 15.7 },
      { device: 'tablet', percentage: 2.0 }
    ]
  };
};

// Simula delay de rede
const simulateNetworkDelay = (min: number = 500, max: number = 1500): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock service class
export class MockFacebookApiService {
  private static instance: MockFacebookApiService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static getInstance(): MockFacebookApiService {
    if (!MockFacebookApiService.instance) {
      MockFacebookApiService.instance = new MockFacebookApiService();
    }
    return MockFacebookApiService.instance;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getPages(): Promise<FacebookPage[]> {
    await simulateNetworkDelay();
    
    const cacheKey = 'pages';
    const cached = this.getCachedData<FacebookPage[]>(cacheKey);
    if (cached) return cached;

    const data = mockPages;
    this.setCachedData(cacheKey, data);
    return data;
  }

  async getAdAccounts(): Promise<FacebookAdAccount[]> {
    await simulateNetworkDelay();
    
    const cacheKey = 'ad_accounts';
    const cached = this.getCachedData<FacebookAdAccount[]>(cacheKey);
    if (cached) return cached;

    const data = mockAdAccounts;
    this.setCachedData(cacheKey, data);
    return data;
  }

  async getPosts(pageIds?: string[], since?: string, until?: string): Promise<FacebookPost[]> {
    await simulateNetworkDelay();
    
    const cacheKey = `posts_${pageIds?.join(',') || 'all'}_${since || ''}_${until || ''}`;
    const cached = this.getCachedData<FacebookPost[]>(cacheKey);
    if (cached) return cached;

    let posts = generateMockPosts(25);
    
    // Filtrar por páginas se especificado
    if (pageIds && pageIds.length > 0) {
      posts = posts.filter(post => pageIds.includes(post.page_id));
    }

    // Filtrar por data se especificado
    if (since || until) {
      const sinceDate = since ? new Date(since) : new Date(0);
      const untilDate = until ? new Date(until) : new Date();
      
      posts = posts.filter(post => {
        const postDate = new Date(post.created_time);
        return postDate >= sinceDate && postDate <= untilDate;
      });
    }

    this.setCachedData(cacheKey, posts);
    return posts;
  }

  async getCampaigns(adAccountIds?: string[], since?: string, until?: string): Promise<FacebookCampaign[]> {
    await simulateNetworkDelay();
    
    const cacheKey = `campaigns_${adAccountIds?.join(',') || 'all'}_${since || ''}_${until || ''}`;
    const cached = this.getCachedData<FacebookCampaign[]>(cacheKey);
    if (cached) return cached;

    let campaigns = generateMockCampaigns(15);
    
    // Filtrar por contas de anúncios se especificado
    if (adAccountIds && adAccountIds.length > 0) {
      campaigns = campaigns.filter(campaign => adAccountIds.includes(campaign.ad_account_id));
    }

    // Filtrar por data se especificado
    if (since || until) {
      const sinceDate = since ? new Date(since) : new Date(0);
      const untilDate = until ? new Date(until) : new Date();
      
      campaigns = campaigns.filter(campaign => {
        const startDate = new Date(campaign.start_time);
        return startDate >= sinceDate && startDate <= untilDate;
      });
    }

    this.setCachedData(cacheKey, campaigns);
    return campaigns;
  }

  async getAudienceInsights(): Promise<FacebookAudienceInsights> {
    await simulateNetworkDelay();
    
    const cacheKey = 'audience_insights';
    const cached = this.getCachedData<FacebookAudienceInsights>(cacheKey);
    if (cached) return cached;

    const data = generateMockAudienceInsights();
    this.setCachedData(cacheKey, data);
    return data;
  }

  // Simula erro de token expirado ocasionalmente
  async validateToken(): Promise<boolean> {
    await simulateNetworkDelay(200, 500);
    
    // 5% de chance de token expirado para demonstrar tratamento de erro
    if (Math.random() < 0.05) {
      throw new Error('Token expirado. Faça login novamente.');
    }
    
    return true;
  }

  // Limpa o cache
  clearCache(): void {
    this.cache.clear();
  }
}

export const mockFacebookApi = MockFacebookApiService.getInstance();