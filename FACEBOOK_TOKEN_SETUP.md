# Configuração do Token do Facebook - Analytics

## 🚀 Status Atual

Atualmente, o sistema está configurado para **modo de desenvolvimento** usando dados simulados (mock). Isso permite testar todas as funcionalidades sem precisar de um token real do Facebook.

## 🔧 Como Funciona

### Modo Desenvolvimento (Atual)
- **Flag**: `USE_MOCK = true` em `services/facebookAnalytics.ts`
- **Dados**: Simulados através do `mockFacebookApi.ts`
- **Token**: Não necessário
- **Funcionalidades**: Todas disponíveis com dados fictícios

### Modo Produção (Futuro)
- **Flag**: `USE_MOCK = false` em `services/facebookAnalytics.ts`
- **Dados**: API real do Facebook Graph v18.0
- **Token**: Obrigatório
- **Configuração**: Necessária

## 🔑 Como Obter o Token do Facebook (Para Produção)

### 1. Criar App no Facebook Developers
1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Crie uma nova aplicação
3. Adicione o produto "Facebook Login"
4. Configure as permissões necessárias:
   - `pages_read_engagement`
   - `pages_show_list`
   - `ads_read`
   - `business_management`

### 2. Gerar Token de Acesso
1. Use o Graph API Explorer
2. Selecione sua aplicação
3. Gere um token com as permissões necessárias
4. **Importante**: Use um token de longa duração

### 3. Configurar no Sistema
```javascript
// Salvar o token no localStorage
localStorage.setItem('facebook_access_token', 'SEU_TOKEN_AQUI');
```

### 4. Ativar Modo Produção
```typescript
// Em services/facebookAnalytics.ts
private readonly USE_MOCK = false; // Alterar para false
```

## 📊 Dados Disponíveis

### Métricas
- Impressões
- Alcance
- Engajamento
- Cliques
- Gastos
- CPC (Custo por Clique)
- CPM (Custo por Mil Impressões)
- CTR (Taxa de Cliques)
- ROAS (Retorno sobre Investimento)

### Conteúdo
- Posts orgânicos e pagos
- Campanhas publicitárias
- Páginas do Facebook
- Contas de anúncios
- Insights demográficos

## 🛡️ Segurança

### Boas Práticas
- **Nunca** commitar tokens no código
- Use variáveis de ambiente em produção
- Implemente renovação automática de tokens
- Configure permissões mínimas necessárias

### Exemplo de Configuração Segura
```typescript
// .env.local
VITE_FACEBOOK_ACCESS_TOKEN=seu_token_aqui

// No código
const token = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN;
```

## 🔄 Alternando Entre Modos

### Para Desenvolvimento
```typescript
// services/facebookAnalytics.ts
private readonly USE_MOCK = true;
```

### Para Produção
```typescript
// services/facebookAnalytics.ts
private readonly USE_MOCK = false;
```

## 📝 Notas Importantes

1. **Cache**: O sistema implementa cache de 5 minutos para otimizar performance
2. **Rate Limiting**: A API do Facebook tem limites de requisições
3. **Permissões**: Algumas métricas requerem permissões específicas
4. **Validação**: Tokens expiram e precisam ser renovados

## 🆘 Resolução de Problemas

### Erro: "Token de acesso do Facebook não encontrado"
- **Causa**: Sistema em modo produção sem token configurado
- **Solução**: Configurar token ou voltar para modo mock

### Erro: "Token inválido"
- **Causa**: Token expirado ou com permissões insuficientes
- **Solução**: Gerar novo token com permissões corretas

### Erro: "Rate limit exceeded"
- **Causa**: Muitas requisições em pouco tempo
- **Solução**: Aguardar ou implementar backoff

## 📞 Suporte

Para dúvidas sobre a configuração do Facebook Analytics, consulte:
- [Documentação Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [Facebook Marketing API](https://developers.facebook.com/docs/marketing-api/)