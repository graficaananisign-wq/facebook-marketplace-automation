---
name: facebook-marketplace-automation
description: Automação completa do Facebook Marketplace usando Apify — monitorar concorrentes, alertar preços baixos, análise de mercado, criar anúncios e postar em múltiplas plataformas (OLX, Mercado Livre). Use quando o usuário pedir "automatizar Marketplace", "monitorar concorrentes no Facebook", "criar anúncios automáticos", "análise de preços do Marketplace", "postar em várias plataformas".
---

# Facebook Marketplace Automation

## ⚡ Visão Geral

Skill completo para automatizar tarefas no Facebook Marketplace usando a plataforma Apify. Permite monitorar concorrentes, encontrar oportunidades, analisar mercado e criar anúncios — tudo sem abrir navegador.

## 🎯 Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Minerador de Ofertas** | Minera anúncios da Meta Ads Library via Playwright |
| **Gerador Inteligente** | Gera anúncios baseados em padrões vencedores |
| **Workflow Semi-Automático** | Gera anúncios em lote e facilita publicação |
| **Monitor de Concorrentes** | Rastreia preços e anúncios de concorrentes |
| **Alerta de Preços Baixos** | Notifica quando surgir produto abaixo do mercado |
| **Análise de Mercado** | Coleta dados de preços, tendências e demanda |
| **Gerador de Anúncios** | Gera conteúdo otimizado e abre Marketplace |
| **Multi-Plataforma** | Posta em Marketplace + OLX + Mercado Livre |

## 🔧 Pré-requisitos

1. **Conta Apify** — Criar em https://console.apify.com/sign-up
2. **Token da API** — Em Apify Console > Settings > Integrations
3. **Node.js** — v16+ instalado
4. **npm** — Instalado

## 📦 Instalação

```bash
# Instalar dependências
npm install apify-client

# Ou instalar globalmente
npm install -g apify-client
```

## 🔑 Configuração

### Estrutura de Credenciais

Crie o arquivo `apify-credentials.json` na raiz do projeto:

```json
{
  "token": "SEU_TOKEN_AQUI",
  "defaultLocation": "https://www.facebook.com/marketplace/saopaulo/",
  "defaultCategory": "electronics",
  "notifyEmail": "seu@email.com"
}
```

### Como Obter o Token

1. Acesse https://console.apify.com/settings/integrations
2. Clique em **Generate Token**
3. Copie o token gerado
4. Salve no arquivo `apify-credentials.json`

## 🚀 Uso

### 1. Gerador de Anúncios (NOVO)

Gera conteúdo otimizado para anúncios e abre o Facebook Marketplace com dados pré-preenchidos.

#### Uso Interativo (Recomendado)

```bash
# Executar gerador interativo
node criar-anuncio.js
```

O assistente irá:
1. Perguntar categoria, nome, preço, localização
2. Analisar preços do mercado automaticamente
3. Gerar título e descrição otimizados
4. Criar script para abrir Facebook Marketplace

#### Uso Programático

```javascript
const AdGenerator = require('./ad-generator');

// Criar generator com WhatsApp (opcional)
const generator = new AdGenerator({
  whatsapp: '91981305395' // Seu número com DDD
});

const produto = {
  name: 'iPhone 13 Pro Max 256GB',
  brand: 'Apple',
  condition: 'Semi-novo',
  price: 4500,
  location: 'São Paulo, SP',
  category: 'electronics',
  features: ['Bateria 95%', 'Sem riscos', 'Caixa original'],
  urgent: true
};

// Gerar anúncio e abrir Marketplace
const result = await generator.createAndPublish(produto);

console.log('Título:', result.ad.title);
console.log('Descrição:', result.ad.description);
console.log('Preço sugerido:', result.ad.suggestedPrice);
```

#### Integração com WhatsApp

O sistema pode incluir automaticamente um link do WhatsApp na descrição do anúncio:

```javascript
// Ao criar o generator
const generator = new AdGenerator({
  whatsapp: '91981305395' // Apenas números com DDD
});

// O link será adicionado automaticamente:
// 📱 Para resposta rápida, me chame no WhatsApp:
// https://wa.me/5591981305395
```

**Como funciona:**
- O botão "Mensagem" do Marketplace sempre vai para o Messenger
- Mas o link do WhatsApp fica na descrição
- Pessoa clica no link e vai direto para seu WhatsApp
- Funciona em qualquer celular com WhatsApp instalado

#### O que o gerador faz:

1. **Gera título otimizado** — Usando templates por categoria
2. **Analisa preços do mercado** — Busca anúncios similares no Facebook
3. **Calcula preço competitivo** — Sugere preço 10% abaixo da média
4. **Gera descrição completa** — Com emojis, características e CTAs
5. **Cria script PowerShell** — Abre Facebook Marketplace automaticamente
6. **Salva dados em JSON** — Para referência futura

#### Exemplo de saída:

```
📝 TÍTULO: Apple iPhone 13 Pro Max 256GB Semi-novo
💰 SEU PREÇO: R$4500
💰 PREÇO SUGERIDO: R$2527
📊 MÉDIA DO MERCADO: R$2807
⚠️ Preço acima da média. Pode demorar para vender.

📄 DESCRIÇÃO:
📱 Apple iPhone 13 Pro Max 256GB Semi-novo

✅ CONDIÇÃO: Semi-novo
📦 O QUE VEM: Celular, caixa, carregador, cabo
💰 MOTIVO DA VENDA: Comprei iPhone 15

🎯 CARACTERÍSTICAS:
• Bateria 95%
• Sem riscos
• Caixa e acessórios originais
• Garantia Apple até 2024

📞 INTERESSADOS: Me chame por mensagem!
📍 LOCALIZAÇÃO: São Paulo, SP
🚚 ENTREGA: Combinar no chat
```

#### Para publicar:

1. Execute: `.\open-marketplace.ps1`
2. Copie o título e cole no Facebook
3. Copie a descrição e cole no Facebook
4. Adicione suas fotos
5. Clique em "Publicar"

### 2. Gerador em Lote (10+ Anúncios de uma vez)

Cria múltiplos anúncios com variações automáticas de título, preço e condição.

#### Uso Interativo

```bash
# Executar gerador em lote
node criar-anuncio-em-lote.js
```

#### Uso Programático

```javascript
const AdGenerator = require('./ad-generator');
const generator = new AdGenerator();

// Produto base
const produtoBase = {
  name: 'iPhone 13 Pro Max 256GB',
  brand: 'Apple',
  category: 'electronics',
  price: 4500,
  location: 'São Paulo, SP',
  features: ['Bateria 95%', 'Sem riscos', 'Caixa original']
};

// Gerar 10 variações automáticas
const variacoes = generator.generateVariations(produtoBase, 10);

// Criar 10 anúncios de uma vez
const resultados = await generator.createBatch(variacoes);

// Resultado:
// [
//   { success: true, product: 'iPhone...', ad: { title: '...', price: 4275 } },
//   { success: true, product: 'iPhone...', ad: { title: '...', price: 4500 } },
//   ...
// ]
```

#### O que o gerador em lote faz:

1. **Gera 10 variações automáticas** de um produto base:
   - 4 condições diferentes (Novo, Semi-novo, Como novo, Bom estado)
   - 5 ajustes de preço (-10%, -5%, 0%, +5%, +10%)
   - Títulos variados por categoria
   - Urgência a cada 3 anúncios

2. **Analisa preços do mercado** para cada variação

3. **Gera descrições otimizadas** automaticamente

4. **Cria script PowerShell** para publicação em lote

5. **Salva tudo em JSON** para referência

#### Exemplo de saída (10 anúncios):

```
📋 VARIAÇÕES GERADAS:
  1. Ótimo iPhone 13 Pro Max - Novo - R$4050
  2. Excelente iPhone 13 Pro Max - Semi-novo - R$4275
  3. Perfeito iPhone 13 Pro Max - Como novo - R$4500
  4. Vendo iPhone 13 Pro Max - Bom estado - R$4725
  5. Disponível iPhone 13 Pro Max - Novo - R$4950
  6. Ótimo iPhone 13 Pro Max - Semi-novo - R$4275 🔥 URGENTE
  7. Excelente iPhone 13 Pro Max - Como novo - R$4050
  8. Perfeito iPhone 13 Pro Max - Bom estado - R$4275
  9. Vendo iPhone 13 Pro Max - Novo - R$4500 🔥 URGENTE
  10. Disponível iPhone 13 Pro Max - Semi-novo - R$4725
```

#### Para publicar em lote:

1. Execute: `.\publicar-em-lote.ps1`
2. O script lista todos os 10 anúncios com títulos e descrições
3. Copie cada anúncio e cole no Facebook Marketplace
4. Repita para os 10 anúncios

### 3. Minerador de Ofertas (Meta Ads Library)

Minera anúncios da Meta Ads Library via Playwright para encontrar ofertas vencedoras no nicho de serviços digitais.

#### Como funciona

1. **Busca** anúncios ativos na Meta Ads Library para cada palavra-chave
2. **Extrai** dados via DOM: anunciante, texto, preço, landing page, dias no ar
3. **Pontua** cada anúncio de 0-100 usando rubrica fixa
4. **Salva** apenas ofertas qualificadas (nota >= 50)

#### Palavras-chave monitoradas

- criação de sites profissionais
- landing page profissional
- desenvolvimento de sites
- criar site agora
- site profissional barato
- página de vendas
- funil de vendas completo
- loja virtual pronta
- site institucional
- criação de landing page

#### Uso

```bash
# Executar mineração
npm run minerar

# Ou diretamente
node minerador-ofertas.js
```

#### Rubrica de Pontuação (0-100)

| Critério | Pontos | Descrição |
|----------|--------|-----------|
| Base | 20 | Pontuação inicial |
| Dias no ar >= 90 | +30 | Muito estável |
| Dias no ar >= 60 | +25 | Estável |
| Dias no ar >= 30 | +20 | Moderado |
| Dias no ar >= 14 | +10 | Novo mas ativo |
| Tem preço | +15 | Preço definido no anúncio |
| Garantia | +10 | Oferece garantia |
| Entrega rápida | +10 | Menciona entrega ou prazo |
| Serviço online | +5 | Menciona online/digital |
| Inclui material | +5 | PDF, ebook, etc. |
| Acesso vitalício | +5 | Acesso vitalício |

#### Saída

- JSON: `data/minerados/ads-library-[DATA].json`
- CSV: `data/minerados/radar-servicos-[DATA].csv`

### 4. Gerador Inteligente de Anúncios

Gera anúncios automaticamente baseado nos padrões encontrados na mineração.

#### Uso

```bash
# Gerar anúncios inteligentes
node gerar-anuncios-inteligentes.js
```

#### O que faz

1. **Carrega** dados da mineração mais recente
2. **Analisa** padrões vencedores (hooks, preços, garantias, CTAs)
3. **Gera** anúncios inspirados nos melhores exemplos
4. **Salva** em `anuncios-inteligentes/`

#### Serviços gerados

| Tipo | Preço Padrão |
|------|--------------|
| Site Profissional | R$ 599 |
| Landing Page | R$ 399 |
| Loja Virtual | R$ 1.299 |
| Funil de Vendas | R$ 899 |

### 5. Workflow Semi-Automático

Gera múltiplos anúncios com variações e facilita a publicação manual no Marketplace.

#### Uso

```bash
# Gerar anúncios para o dia
npm run workflow

# Listar e publicar anúncios
node publicar.js
```

#### Como funciona

1. **Gera** anúncios com variações de título e descrição
2. **Salva** cada anúncio em arquivo individual
3. **Abre** Chrome e copia para área de transferência
4. **Usuário** cola no Facebook Marketplace

#### Configuração

Edite `config-servicos.json` para personalizar:

```json
{
  "services": [
    {
      "type": "site",
      "name": "Site Profissional",
      "basePrice": 599,
      "category": "servicos"
    }
  ]
}
```

### 6. Monitor de Concorrentes

Rastreia anúncios de concorrentes e detecta mudanças de preço.

```javascript
// monitor-concorrentes.js
const { ApifyClient } = require('apify-client');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('apify-credentials.json'));
const client = new ApifyClient({ token: credentials.token });

async function monitorarConcorrentes(buscas, localizacao) {
  const input = {
    urls: [],
    searchKeyword: buscas.join(' OR '),
    location: localizacao,
    getListingDetails: true
  };

  console.log('🔍 Iniciando monitoramento...');
  const run = await client.actor('curious_coder/facebook-marketplace').call(input);
  
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  
  // Salvar dados atuais
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    `concorrentes-${timestamp}.json`,
    JSON.stringify(items, null, 2)
  );
  
  console.log(`✅ Coletados ${items.length} anúncios`);
  
  // Comparar com dados anteriores (se existirem)
  const anteriores = fs.readdirSync('.')
    .filter(f => f.startsWith('concorrentes-') && f.endsWith('.json'))
    .sort()
    .slice(-2, -1);
  
  if (anteriores.length > 0) {
    const dadosAnteriores = JSON.parse(fs.readFileSync(anteriores[0]));
    detectarMudancas(dadosAnteriores, items);
  }
  
  return items;
}

function detectarMudancas(anteriores, atuais) {
  const mudancas = [];
  
  for (const atual of atuais) {
    const anterior = anteriores.find(a => a.id === atual.id);
    
    if (anterior) {
      const precoAnterior = parseFloat(anterior.listing_price?.amount || 0);
      const precoAtual = parseFloat(atual.listing_price?.amount || 0);
      
      if (precoAnterior !== precoAtual && precoAnterior > 0) {
        mudancas.push({
          titulo: atual.marketplace_listing_title,
          url: atual.listingUrl,
          precoAnterior,
          precoAtual,
          variacao: ((precoAtual - precoAnterior) / precoAnterior * 100).toFixed(1)
        });
      }
    }
  }
  
  if (mudancas.length > 0) {
    console.log('\n📊 MUDANÇAS DETECTADAS:');
    mudancas.forEach(m => {
      const emoji = m.variacao < 0 ? '📉' : '📈';
      console.log(`${emoji} ${m.titulo}: R$${m.precoAnterior} → R$${m.precoAtual} (${m.variacao}%)`);
    });
  }
  
  return mudancas;
}

// Uso
monitorarConcorrentes(['iphone', 'samsung'], 'São Paulo, Brazil');
```

### 2. Alerta de Preços Baixos

Monitora continuamente e alerta quando encontrar produtos abaixo do preço de mercado.

```javascript
// alerta-precos-baixos.js
const { ApifyClient } = require('apify-client');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('apify-credentials.json'));
const client = new ApifyClient({ token: credentials.token });

// Configurar preços alvo por produto
const precosAlvo = {
  'iphone 13': { max: 2500, media: 3200 },
  'iphone 14': { max: 3500, media: 4200 },
  'samsung s23': { max: 2000, media: 2800 },
  'macbook air': { max: 4000, media: 5500 },
  'ps5': { max: 2500, media: 3500 }
};

async function buscarOfertas(busca, localizacao) {
  const input = {
    urls: [],
    searchKeyword: busca,
    location: localizacao,
    getListingDetails: true
  };

  const run = await client.actor('curious_coder/facebook-marketplace').call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  
  return items;
}

function analisarOfertas(items) {
  const ofertas = [];
  
  for (const item of items) {
    const titulo = (item.marketplace_listing_title || '').toLowerCase();
    const preco = parseFloat(item.listing_price?.amount || 0);
    
    if (preco <= 0) continue;
    
    // Verificar se o título corresponde a algum produto monitorado
    for (const [produto, precos] of Object.entries(precosAlvo)) {
      if (titulo.includes(produto.toLowerCase())) {
        const desconto = ((precos.media - preco) / precos.media * 100).toFixed(1);
        
        if (preco <= precos.max) {
          ofertas.push({
            produto,
            titulo: item.marketplace_listing_title,
            preco,
            precoMedio: precos.media,
            desconto: `${desconto}%`,
            url: item.listingUrl,
            localizacao: item.location_text?.text || 'N/A',
            vendedor: item.marketplace_listing_seller?.name || 'N/A'
          });
        }
      }
    }
  }
  
  return ofertas.sort((a, b) => b.desconto - a.desconto);
}

async function monitorarOfertas(locais, intervaloMinutos = 30) {
  console.log('🔔 Iniciando monitoramento de ofertas...\n');
  
  const todasOfertas = [];
  
  for (const local of locais) {
    for (const produto of Object.keys(precosAlvo)) {
      console.log(`🔍 Buscando ${produto} em ${local}...`);
      
      try {
        const items = await buscarOfertas(produto, local);
        const ofertas = analisarOfertas(items);
        todasOfertas.push(...ofertas);
        
        if (ofertas.length > 0) {
          console.log(`✅ ${ofertas.length} ofertas encontradas!`);
          ofertas.forEach(o => {
            console.log(`  💰 ${o.titulo}: R$${o.preco} (${o.desconto} de desconto)`);
            console.log(`     ${o.url}\n`);
          });
        }
        
        // Esperar entre requests para evitar bloqueio
        await new Promise(r => setTimeout(r, 2000));
      } catch (error) {
        console.error(`❌ Erro ao buscar ${produto} em ${local}:`, error.message);
      }
    }
  }
  
  // Salvar ofertas encontradas
  if (todasOfertas.length > 0) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
      `ofertas-${timestamp}.json`,
      JSON.stringify(todasOfertas, null, 2)
    );
    
    console.log(`\n📊 RESUMO: ${todasOfertas.length} ofertas encontradas`);
    console.log('💾 Salvo em ofertas-' + timestamp + '.json');
  }
  
  return todasOfertas;
}

// Uso
monitorarOfertas(['São Paulo, Brazil', 'Rio de Janeiro, Brazil', 'Campinas, Brazil']);
```

### 3. Análise de Mercado

Coleta dados completos para análise de tendências e precificação.

```javascript
// analise-mercado.js
const { ApifyClient } = require('apify-client');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('apify-credentials.json'));
const client = new ApifyClient({ token: credentials.token });

async function analisarMercado(busca, localizacao, diasHistorico = 30) {
  console.log(`📊 Analisando mercado: ${busca} em ${localizacao}\n`);
  
  const input = {
    urls: [],
    searchKeyword: busca,
    location: localizacao,
    getListingDetails: true
  };

  const run = await client.actor('curious_coder/facebook-marketplace').call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  
  // Análise estatística
  const precos = items
    .map(i => parseFloat(i.listing_price?.amount || 0))
    .filter(p => p > 0);
  
  const stats = {
    totalAnuncios: items.length,
    precos: {
      minimo: Math.min(...precos),
      maximo: Math.max(...precos),
      medio: (precos.reduce((a, b) => a + b, 0) / precos.length).toFixed(2),
      mediana: precos.sort((a, b) => a - b)[Math.floor(precos.length / 2)]
    },
    porStatus: {
      ativos: items.filter(i => i.is_live).length,
      vendidos: items.filter(i => i.is_sold).length,
      pendentes: items.filter(i => i.is_pending).length
    },
    porLocalizacao: {},
    vendedoresAtivos: new Set(items.map(i => i.marketplace_listing_seller?.name)).size,
    timestamp: new Date().toISOString()
  };
  
  // Agrupar por cidade
  items.forEach(item => {
    const cidade = item.location_text?.text || 'Desconhecida';
    stats.porLocalizacao[cidade] = (stats.porLocalizacao[cidade] || 0) + 1;
  });
  
  // Salvar relatório
  const filename = `analise-${busca.replace(/\s+/g, '-')}-${localizacao.replace(/\s+/g, '-')}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(stats, null, 2));
  
  console.log('📈 RELATÓRIO DE MERCADO:');
  console.log(`   Total de anúncios: ${stats.totalAnuncios}`);
  console.log(`   Preço mínimo: R$${stats.precos.minimo}`);
  console.log(`   Preço máximo: R$${stats.precos.maximo}`);
  console.log(`   Preço médio: R$${stats.precos.medio}`);
  console.log(`   Mediana: R$${stats.precos.mediana}`);
  console.log(`   Ativos: ${stats.porStatus.ativos} | Vendidos: ${stats.porStatus.vendidos} | Pendentes: ${stats.porStatus.pendentes}`);
  console.log(`   Vendedores únicos: ${stats.vendedoresAtivos}`);
  console.log(`\n💾 Relatório salvo em ${filename}`);
  
  return stats;
}

// Uso
analisarMercado('iphone', 'São Paulo, Brazil');
analisarMercado('carros', 'Rio de Janeiro, Brazil');
```

### 4. Criação de Anúncios (Multi-Plataforma)

```javascript
// criar-anuncio.js
const { ApifyClient } = require('apify-client');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('apify-credentials.json'));

// Dados do produto para anunciar
const produto = {
  titulo: 'iPhone 13 Pro Max 256GB - Único Dono',
  descricao: 'iPhone 13 Pro Max 256GB, cor Sierra Blue. Único dono, sem riscos, bateria 98%. Acompanha caixa e carregador original. Motivo da venda: upgrade para iPhone 15.',
  preco: 4500,
  categoria: 'electronics',
  localizacao: 'São Paulo, SP',
  fotos: [
    'https://exemplo.com/foto1.jpg',
    'https://exemplo.com/foto2.jpg'
  ],
  envio: true, // aceita envio
  retirada: true // aceita retirada
};

async function criarAnuncioMultiPlataforma(produto) {
  const resultados = {
    facebook: null,
    olx: null,
    mercadolivre: null
  };
  
  // 1. Facebook Marketplace (via Apify - apenas coleta dados, criação é manual)
  console.log('📱 Preparando dados para Facebook Marketplace...');
  
  const facebookData = {
    title: produto.titulo,
    description: produto.descricao,
    price: produto.preco,
    location: produto.localizacao,
    category: produto.categoria,
    images: produto.fotos,
    delivery: produto.envio,
    pickup: produto.retirada
  };
  
  fs.writeFileSync('anuncio-facebook.json', JSON.stringify(facebookData, null, 2));
  resultados.facebook = 'Dados preparados em anuncio-facebook.json';
  console.log('✅ Facebook: Dados preparados');
  
  // 2. OLX (via API não oficial - requer autenticação)
  console.log('\n🛒 Preparando dados para OLX...');
  
  const olxData = {
    subject: produto.titulo,
    description: produto.descricao,
    price: [{ value: produto.preco }],
    location: { city: 'São Paulo', state: 'SP' },
    category: 1205, // Celulares
    images: produto.fotos
  };
  
  fs.writeFileSync('anuncio-olx.json', JSON.stringify(olxData, null, 2));
  resultados.olx = 'Dados preparados em anuncio-olx.json';
  console.log('✅ OLX: Dados preparados');
  
  // 3. Mercado Livre (via API oficial)
  console.log('\n📦 Preparando dados para Mercado Livre...');
  
  const mlData = {
    title: produto.titulo,
    description: produto.descricao,
    price: produto.preco,
    currency_id: 'BRL',
    category_id: 'MLB1055', // Celulares e Smartphones
    condition: 'used',
    available_quantity: 1,
    buying_mode: 'buy_it_now',
    listing_type_id: 'gold_special',
    shipping: {
      mode: 'me2',
      free_shipping: true
    },
    pictures: produto.fotos.map(url => ({ source: url }))
  };
  
  fs.writeFileSync('anuncio-mercadolivre.json', JSON.stringify(mlData, null, 2));
  resultados.mercadolivre = 'Dados preparados em anuncio-mercadolivre.json';
  console.log('✅ Mercado Livre: Dados preparados');
  
  // Resumo
  console.log('\n📋 RESUMO:');
  console.log('Todos os dados foram preparados nos respectivos arquivos JSON.');
  console.log('Para publicar, você precisará:');
  console.log('1. Facebook: Publicar manualmente ou usar ferramenta de automação');
  console.log('2. OLX: Usar API da OLX (requer conta business)');
  console.log('3. Mercado Livre: Usar API oficial (requer credenciais)');
  
  return resultados;
}

// Uso
criarAnuncioMultiPlataforma(produto);
```

### 5. Script Integrado Completo

```javascript
// marketplace-automation.js
const { ApifyClient } = require('apify-client');
const fs = require('fs');

class MarketplaceAutomation {
  constructor() {
    const credentials = JSON.parse(fs.readFileSync('apify-credentials.json'));
    this.client = new ApifyClient({ token: credentials.token });
    this.defaultLocation = credentials.defaultLocation || 'São Paulo, Brazil';
  }

  async scrape(urls, options = {}) {
    const input = {
      urls: urls,
      searchKeyword: options.searchKeyword || '',
      location: options.location || this.defaultLocation,
      getListingDetails: options.getListingDetails ?? true,
      maxPrice: options.maxPrice || null
    };

    const run = await this.client.actor('curious_coder/facebook-marketplace').call(input);
    const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
    return items;
  }

  async monitorar(buscas, localizacao = this.defaultLocation) {
    console.log('🔍 Iniciando monitoramento...');
    const items = await this.scrape([], {
      searchKeyword: buscas.join(' OR '),
      location: localizacao
    });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(`monitoramento-${timestamp}.json`, JSON.stringify(items, null, 2));
    
    console.log(`✅ Coletados ${items.length} itens`);
    return items;
  }

  async buscarProdutos(busca, localizacao = this.defaultLocation) {
    return this.scrape([], {
      searchKeyword: busca,
      location: localizacao
    });
  }

  async analisarPreco(busca, localizacao = this.defaultLocation) {
    const items = await this.buscarProdutos(busca, localizacao);
    
    const precos = items
      .map(i => parseFloat(i.listing_price?.amount || 0))
      .filter(p => p > 0);
    
    if (precos.length === 0) return null;
    
    return {
      busca,
      localizacao,
      total: items.length,
      precos: {
        min: Math.min(...precos),
        max: Math.max(...precos),
        media: (precos.reduce((a, b) => a + b, 0) / precos.length).toFixed(2),
        mediana: precos.sort((a, b) => a - b)[Math.floor(precos.length / 2)]
      }
    };
  }

  async encontrarOfertas(busca, precoMaximo, localizacao = this.defaultLocation) {
    const items = await this.buscarProdutos(busca, localizacao);
    
    return items
      .filter(item => {
        const preco = parseFloat(item.listing_price?.amount || 0);
        return preco > 0 && preco <= precoMaximo;
      })
      .map(item => ({
        titulo: item.marketplace_listing_title,
        preco: parseFloat(item.listing_price?.amount),
        precoFormatado: item.listing_price?.formatted_amount_zeros_stripped,
        url: item.listingUrl,
        vendedor: item.marketplace_listing_seller?.name,
        localizacao: item.location_text?.text
      }))
      .sort((a, b) => a.preco - b.preco);
  }

  async gerarRelatorio(categorias, localizacao = this.defaultLocation) {
    const relatorio = {
      timestamp: new Date().toISOString(),
      localizacao,
      categorias: {}
    };

    for (const categoria of categorias) {
      console.log(`📊 Analisando ${categoria}...`);
      relatorio.categorias[categoria] = await this.analisarPreco(categoria, localizacao);
      
      // Pausa entre requests
      await new Promise(r => setTimeout(r, 2000));
    }

    const filename = `relatorio-${localizacao.replace(/\s+/g, '-')}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(relatorio, null, 2));
    console.log(`\n💾 Relatório salvo em ${filename}`);

    return relatorio;
  }
}

// Exportar para uso
module.exports = MarketplaceAutomation;

// Exemplo de uso
if (require.main === module) {
  (async () => {
    const automation = new MarketplaceAutomation();
    
    // Exemplo 1: Buscar ofertas
    console.log('=== BUSCANDO OFERTAS ===');
    const ofertas = await automation.encontrarOfertas('iphone 13', 3000);
    console.log(`Encontradas ${ofertas.length} ofertas abaixo de R$3.000\n`);
    ofertas.slice(0, 5).forEach(o => {
      console.log(`💰 ${o.titulo}: ${o.precoFormatado || 'R$' + o.preco}`);
      console.log(`   ${o.url}\n`);
    });
    
    // Exemplo 2: Análise de mercado
    console.log('\n=== ANÁLISE DE MERCADO ===');
    const analise = await automation.analisarPreco('macbook air');
    if (analise) {
      console.log(`Preço médio: R$${analise.precos.media}`);
      console.log(`Faixa: R$${analise.precos.min} - R$${analise.precos.max}`);
    }
  })();
}
```

## 📊 Exemplos de Uso Rápido

### Buscar produtos
```bash
node marketplace-automation.js
```

### Monitorar concorrentes
```javascript
const automation = new MarketplaceAutomation();
await automation.monitorar([
  'https://www.facebook.com/marketplace/saopaulo/search/?query=samsung'
]);
```

### Gerar relatório completo
```javascript
const relatorio = await automation.gerarRelatorio(
  ['iphone', 'samsung', 'macbook'],
  'saopaulo'
);
```

## 🔄 Automação com Cron

Para rodar automaticamente, configure um cron job:

```bash
# A cada 6 horas
0 */6 * * * cd /caminho/do/projeto && node marketplace-automation.js

# A cada 30 minutos (para monitoramento intensivo)
*/30 * * * * cd /caminho/do/projeto && node alerta-precos-baixos.js
```

## ⚠️ Limitações e Cuidados

| Item | Detalhe |
|------|---------|
| **Custo** | $0.005 por listagem (~R$0.025) |
| **Limite free** | $5/mês (~1.000 listagens) |
| **Velocidade** | Max 1-2 requests/segundo |
| **Bloqueios** | Facebook pode bloquear IPs de datacenter |
| **Dados** | Apenas dados públicos (não precisa login) |
| **ToS** | Viola Termos de Serviço do Facebook |

## 🛠️ Troubleshooting

### "No results found"
- Verifique se a URL está correta
- Tente aumentar o `resultsLimit`
- O Facebook pode ter mudado a estrutura GraphQL

### "Rate limit exceeded"
- Reduza a frequência de requests
- Adicione delays entre chamadas
- Considere usar proxy residencial

### "Actor not found"
- Verifique se o nome do Actor está correto: `curious_coder/facebook-marketplace`
- Atualize o Apify Client: `npm update apify-client`

## 📚 Referências

- [Apify Facebook Marketplace Scraper](https://apify.com/curious_coder/facebook-marketplace)
- [Apify API Documentation](https://docs.apify.com/api/v2)
- [Apify Client for Node.js](https://docs.apify.com/api/client/js)
- [Facebook Marketplace Terms](https://www.facebook.com/policies/commerce/)

## 🔗 Integrações Disponíveis

| Ferramenta | Como usar |
|------------|-----------|
| **Zapier** | Conectar output do scraper para Google Sheets, Slack, Email |
| **Make** | Criar automações complexas com múltiplos apps |
| **Google Sheets** | Exportar dados automaticamente para planilhas |
| **Slack** | Receber notificações em tempo real |
| **Webhooks** | Chamar seu sistema quando scraper completar |
| **MCP Server** | Integrar com Claude/ChatGPT para análises com IA |

## 📈 Exemplo de Integração com Zapier

1. Crie uma conta no Zapier
2. Crie um novo Zap com trigger "Apify"
3. Selecione o Actor "Facebook Marketplace Scraper"
4. Configure um webhook para enviar resultados para Google Sheets
5. Adicione um filtro para alertar quando preço < X

## 💡 Dicas Avançadas

1. **Cache de dados**: Salve resultados anteriores para comparação
2. **Rate limiting**: Adicione 2-3 segundos entre requests
3. **Proxy residencial**: Para scraping pesado, considere plano pago do Apify
4. **Múltiplas cidades**: Monitore várias localizações para encontrar melhores preços
5. **Alertas inteligentes**: Use filtros por preço, condição e distância

---

**Criado por:** OpenCode AI
**Versão:** 1.0.0
**Última atualização:** Agosto 2026
