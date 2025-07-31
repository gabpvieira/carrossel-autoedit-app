import React, { useState } from 'react';
import { FacebookMetrics, FacebookPost, FacebookCampaign, AnalyticsFilters } from '../../services/facebookAnalytics';
import { Button } from '../Button';

interface ExportDataProps {
  metrics: FacebookMetrics;
  posts: FacebookPost[];
  campaigns: FacebookCampaign[];
  filters: AnalyticsFilters;
  loading?: boolean;
}

export const ExportData: React.FC<ExportDataProps> = ({
  metrics,
  posts,
  campaigns,
  filters,
  loading = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'pdf'>('csv');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const generateCSVContent = () => {
    let csvContent = '';
    
    // Cabeçalho do relatório
    csvContent += `Relatório de Analytics do Facebook\n`;
    csvContent += `Período: ${formatDate(filters.dateRange.start)} a ${formatDate(filters.dateRange.end)}\n`;
    csvContent += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
    
    // Métricas gerais
    csvContent += `MÉTRICAS GERAIS\n`;
    csvContent += `Métrica,Valor\n`;
    csvContent += `Impressões,${formatNumber(metrics.impressions)}\n`;
    csvContent += `Alcance,${formatNumber(metrics.reach)}\n`;
    csvContent += `Engajamento,${formatNumber(metrics.engagement)}\n`;
    csvContent += `Cliques,${formatNumber(metrics.clicks)}\n`;
    csvContent += `Gastos,${formatCurrency(metrics.spend)}\n`;
    csvContent += `CPC,${formatCurrency(metrics.cpc)}\n`;
    csvContent += `CPM,${formatCurrency(metrics.cpm)}\n`;
    csvContent += `ROAS,${metrics.roas.toFixed(2)}x\n\n`;
    
    // Posts mais performáticos
    if (posts.length > 0) {
      csvContent += `POSTS MAIS PERFORMÁTICOS\n`;
      csvContent += `ID,Mensagem,Curtidas,Comentários,Compartilhamentos,Alcance,Impressões,Data de Criação\n`;
      
      posts.slice(0, 20).forEach(post => {
        const message = (post.message || 'Post sem texto').replace(/"/g, '""').replace(/\n/g, ' ');
        csvContent += `"${post.id}","${message}",${post.likes || 0},${post.comments || 0},${post.shares || 0},${post.reach || 0},${post.impressions || 0},${formatDate(post.created_time)}\n`;
      });
      
      csvContent += `\n`;
    }
    
    // Campanhas mais performáticas
    if (campaigns.length > 0) {
      csvContent += `CAMPANHAS MAIS PERFORMÁTICAS\n`;
      csvContent += `ID,Nome,Status,Impressões,Cliques,Gastos,CPC,CPM,ROAS,Data de Criação\n`;
      
      campaigns.slice(0, 20).forEach(campaign => {
        const name = campaign.name.replace(/"/g, '""');
        csvContent += `"${campaign.id}","${name}",${campaign.status},${campaign.impressions || 0},${campaign.clicks || 0},${formatCurrency(campaign.spend || 0)},${formatCurrency(campaign.cpc || 0)},${formatCurrency(campaign.cpm || 0)},${(campaign.roas || 0).toFixed(2)},${formatDate(campaign.created_time)}\n`;
      });
    }
    
    return csvContent;
  };

  const generatePDFContent = () => {
    // Para PDF, vamos criar um HTML que pode ser convertido
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Analytics do Facebook</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #1877f2;
                padding-bottom: 20px;
            }
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .metric-card {
                border: 1px solid #ddd;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }
            .metric-value {
                font-size: 24px;
                font-weight: bold;
                color: #1877f2;
            }
            .metric-label {
                font-size: 14px;
                color: #666;
                margin-top: 5px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f8f9fa;
                font-weight: bold;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                margin: 30px 0 15px 0;
                color: #1877f2;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Relatório de Analytics do Facebook</h1>
            <p>Período: ${formatDate(filters.dateRange.start)} a ${formatDate(filters.dateRange.end)}</p>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="section-title">Métricas Gerais</div>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${formatNumber(metrics.impressions)}</div>
                <div class="metric-label">Impressões</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${formatNumber(metrics.reach)}</div>
                <div class="metric-label">Alcance</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${formatNumber(metrics.engagement)}</div>
                <div class="metric-label">Engajamento</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${formatNumber(metrics.clicks)}</div>
                <div class="metric-label">Cliques</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${formatCurrency(metrics.spend)}</div>
                <div class="metric-label">Gastos</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${formatCurrency(metrics.cpc)}</div>
                <div class="metric-label">CPC</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${formatCurrency(metrics.cpm)}</div>
                <div class="metric-label">CPM</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${metrics.roas.toFixed(2)}x</div>
                <div class="metric-label">ROAS</div>
            </div>
        </div>
        
        ${posts.length > 0 ? `
        <div class="section-title">Posts Mais Performáticos (Top 10)</div>
        <table>
            <thead>
                <tr>
                    <th>Mensagem</th>
                    <th>Curtidas</th>
                    <th>Comentários</th>
                    <th>Compartilhamentos</th>
                    <th>Alcance</th>
                    <th>Data</th>
                </tr>
            </thead>
            <tbody>
                ${posts.slice(0, 10).map(post => `
                <tr>
                    <td>${(post.message || 'Post sem texto').substring(0, 50)}${(post.message || '').length > 50 ? '...' : ''}</td>
                    <td>${formatNumber(post.likes || 0)}</td>
                    <td>${formatNumber(post.comments || 0)}</td>
                    <td>${formatNumber(post.shares || 0)}</td>
                    <td>${formatNumber(post.reach || 0)}</td>
                    <td>${formatDate(post.created_time)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
        
        ${campaigns.length > 0 ? `
        <div class="section-title">Campanhas Mais Performáticas (Top 10)</div>
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Status</th>
                    <th>Impressões</th>
                    <th>Cliques</th>
                    <th>Gastos</th>
                    <th>CPC</th>
                    <th>ROAS</th>
                    <th>Data</th>
                </tr>
            </thead>
            <tbody>
                ${campaigns.slice(0, 10).map(campaign => `
                <tr>
                    <td>${campaign.name.substring(0, 30)}${campaign.name.length > 30 ? '...' : ''}</td>
                    <td>${campaign.status}</td>
                    <td>${formatNumber(campaign.impressions || 0)}</td>
                    <td>${formatNumber(campaign.clicks || 0)}</td>
                    <td>${formatCurrency(campaign.spend || 0)}</td>
                    <td>${formatCurrency(campaign.cpc || 0)}</td>
                    <td>${(campaign.roas || 0).toFixed(2)}x</td>
                    <td>${formatDate(campaign.created_time)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
        
        <div class="footer">
            <p>Relatório gerado automaticamente pela plataforma SaaS</p>
        </div>
    </body>
    </html>
    `;
    
    return htmlContent;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (exportType === 'csv') {
        const csvContent = generateCSVContent();
        downloadFile(csvContent, `facebook-analytics-${timestamp}.csv`, 'text/csv;charset=utf-8;');
      } else {
        const htmlContent = generatePDFContent();
        
        // Para PDF, vamos usar a API do navegador para imprimir
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          
          // Aguardar o carregamento e então imprimir
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              printWindow.close();
            }, 500);
          };
        }
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const hasData = posts.length > 0 || campaigns.length > 0 || metrics.impressions > 0;

  return (
    <div className="glassmorphism p-4 rounded-xl">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Exportar Dados</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-2">Formato</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setExportType('csv')}
              className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                exportType === 'csv'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>CSV</span>
            </button>
            
            <button
              onClick={() => setExportType('pdf')}
              className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                exportType === 'pdf'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>PDF</span>
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          {exportType === 'csv' ? (
            <div>
              <p>• Arquivo CSV compatível com Excel</p>
              <p>• Inclui todas as métricas e dados</p>
              <p>• Ideal para análises detalhadas</p>
            </div>
          ) : (
            <div>
              <p>• Relatório visual em PDF</p>
              <p>• Inclui gráficos e tabelas</p>
              <p>• Ideal para apresentações</p>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleExport}
          disabled={loading || isExporting || !hasData}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            loading || isExporting || !hasData
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isExporting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar {exportType.toUpperCase()}</span>
            </>
          )}
        </Button>
        
        {!hasData && (
          <p className="text-xs text-gray-500 text-center">
            Nenhum dado disponível para exportação
          </p>
        )}
      </div>
    </div>
  );
};