#!/usr/bin/env node
// Gerador de Anúncios Inteligentes - Baseado em Dados Minerados
// Lê os dados da mineração e gera anúncios inspirados nas melhores ofertas

const fs = require('fs');
const path = require('path');
const AdGenerator = require('./ad-generator');

// Configuração
const config = {
  whatsapp: '91981305395',
  website: 'https://sitefenixdigital.online',
  defaultPrice: '599',
  defaultDelivery: 'até 2 dias'
};

// Carregar dados minerados
function loadMinedData() {
  const dataDir = path.join(__dirname, 'data', 'minerados');
  
  if (!fs.existsSync(dataDir)) {
    console.log('Nenhum dado minerado encontrado. Execute primeiro: npm run minerar');
    return null;
  }
  
  const files = fs.readdirSync(dataDir)
    .filter(f => f.startsWith('ads-library-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    console.log('Nenhum arquivo de dados encontrado.');
    return null;
  }
  
  const latestFile = path.join(dataDir, files[0]);
  console.log('Carregando dados de:', files[0]);
  
  return JSON.parse(fs.readFileSync(latestFile, 'utf8'));
}

// Analisar padrões vencedores
function analyzeWinningPatterns(data) {
  const patterns = {
    bestHooks: [],
    bestAngles: [],
    pricePoints: [],
    Guarantees: [],
    deliveryTimes: [],
    ctaPatterns: []
  };
  
  const allAds = [];
  for (const result of data) {
    for (const ad of result.ads) {
      if (ad.score >= 60) {
        allAds.push({
          ...ad,
          category: result.category,
          keyword: result.keyword
        });
      }
    }
  }
  
  console.log(`\nAnalisando ${allAds.length} anúncios qualificados...`);
  
  // Analisar hooks (primeiras linhas)
  for (const ad of allAds) {
    if (ad.text) {
      const lines = ad.text.split('\n');
      if (lines.length > 0) {
        patterns.bestHooks.push(lines[0].substring(0, 100));
      }
    }
  }
  
  // Analisar preços
  for (const ad of allAds) {
    if (ad.price) {
      patterns.pricePoints.push(ad.price);
    }
  }
  
  // Analisar garantias
  for (const ad of allAds) {
    if (ad.hasGuarantee) {
      const text = ad.text || '';
      const guaranteeMatch = text.match(/garantia[^.]*\./i);
      if (guaranteeMatch) {
        patterns.Guarantees.push(guaranteeMatch[0]);
      }
    }
  }
  
  // Analisar CTAs
  const ctaKeywords = ['clique', 'compre', 'garanta', 'acesse', 'saiba mais', 'clica aqui'];
  for (const ad of allAds) {
    if (ad.text) {
      const textLower = ad.text.toLowerCase();
      for (const cta of ctaKeywords) {
        if (textLower.includes(cta)) {
          patterns.ctaPatterns.push(cta);
          break;
        }
      }
    }
  }
  
  // Contar frequência e pegar os mais comuns
  patterns.bestHooks = countAndSort(patterns.bestHooks).slice(0, 5);
  patterns.pricePoints = countAndSort(patterns.pricePoints).slice(0, 3);
  patterns.Guarantees = countAndSort(patterns.Guarantees).slice(0, 3);
  patterns.ctaPatterns = countAndSort(patterns.ctaPatterns).slice(0, 3);
  
  return patterns;
}

function countAndSort(arr) {
  const counts = {};
  for (const item of arr) {
    counts[item] = (counts[item] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([item, count]) => ({ item, count }));
}

// Gerar anúncios baseados nos padrões
function generateSmartAds(patterns, count = 5) {
  const generator = new AdGenerator(config);
  const ads = [];
  
  const serviceTypes = [
    { type: 'site', name: 'Site Profissional', price: '599' },
    { type: 'landing_page', name: 'Landing Page', price: '399' },
    { type: 'loja', name: 'Loja Virtual', price: '1299' },
    { type: 'funil', name: 'Funil de Vendas', price: '899' }
  ];
  
  for (let i = 0; i < count; i++) {
    const service = serviceTypes[i % serviceTypes.length];
    
    // Criar variações baseadas nos padrões
    const variations = [
      {
        title: `${service.name} Profissional - Entrega Rápida`,
        description: `✅ ${service.name} completa e profissional\n\n💰 Apenas R$ ${service.price}\n⏰ Entrega em ${config.defaultDelivery}\n🎯 100% online\n🔒 Garantia de 7 dias\n\n📱 WhatsApp: ${config.whatsapp}\n🌐 ${config.website}`
      },
      {
        title: `Precisa de um ${service.name}?`,
        description: `🚀 ${service.name} profissional para seu negócio!\n\n✅ Design moderno\n✅ Responsivo\n✅ SEO otimizado\n✅ Entrega rápida\n\n💰 Por apenas R$ ${service.price}\n📱 Fale conosco: ${config.whatsapp}`
      },
      {
        title: `${service.name} - Oferta Especial`,
        description: `🎯 ${service.name} com desconto especial!\n\n✅ Tudo que você precisa\n✅ Suporte completo\n✅ Entrega em ${config.defaultDelivery}\n\n💰 Apenas R$ ${service.price}\n🔥 Vagas limitadas!\n📱 ${config.whatsapp}`
      }
    ];
    
    const variation = variations[i % variations.length];
    const ad = generator.generate({
      name: variation.title,
      type: service.type,
      category: 'servicos',
      price: service.price,
      customDescription: variation.description
    });
    
    ads.push(ad);
  }
  
  return ads;
}

// Salvar anúncios gerados
function saveGeneratedAds(ads) {
  const outputDir = path.join(__dirname, 'anuncios-inteligentes');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  // Salvar cada anúncio individualmente
  for (let i = 0; i < ads.length; i++) {
    const ad = ads[i];
    const filename = path.join(outputDir, `anuncio-inteligente-${today}-${i + 1}.txt`);
    fs.writeFileSync(filename, ad.formatted);
    console.log(`Salvo: anuncio-inteligente-${today}-${i + 1}.txt`);
  }
  
  // Salvar resumo
  const summary = {
    date: new Date().toISOString(),
    totalAds: ads.length,
    ads: ads.map(ad => ({
      title: ad.title,
      category: ad.category
    }))
  };
  
  fs.writeFileSync(path.join(outputDir, `resumo-${today}.json`), JSON.stringify(summary, null, 2));
  console.log(`\nResumo salvo em: resumo-${today}.json`);
  
  return outputDir;
}

// Função principal
async function main() {
  console.log('=== Gerador de Anúncios Inteligentes ===\n');
  
  // 1. Carregar dados minerados
  const data = loadMinedData();
  if (!data) {
    console.log('\nExecute primeiro a mineração: npm run minerar');
    process.exit(1);
  }
  
  // 2. Analisar padrões
  const patterns = analyzeWinningPatterns(data);
  
  console.log('\nPadrões encontrados:');
  console.log('- Hooks mais usados:', patterns.bestHooks.length);
  console.log('- Faixas de preço:', patterns.pricePoints.length);
  console.log('- Garantias:', patterns.Guarantees.length);
  console.log('- CTAs:', patterns.ctaPatterns.length);
  
  // 3. Gerar anúncios inteligentes
  console.log('\nGerando anúncios inteligentes...');
  const ads = generateSmartAds(patterns, 5);
  
  // 4. Salvar resultados
  const outputDir = saveGeneratedAds(ads);
  
  console.log('\n=== CONCLUÍDO ===');
  console.log(`Anúncios gerados: ${ads.length}`);
  console.log(`Pasta de saída: ${outputDir}`);
  console.log('\nPróximos passos:');
  console.log('1. Abra os arquivos gerados');
  console.log('2. Revise e personalize os anúncios');
  console.log('3. Use o workflow.js para publicar no Marketplace');
}

main().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
