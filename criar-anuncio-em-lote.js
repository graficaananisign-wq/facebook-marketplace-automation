/**
 * Facebook Marketplace - Gerador de Anúncios em Lote
 * 
 * Uso: node criar-anuncio-em-lote.js
 * 
 * Cria múltiplos anúncios com variações de uma só vez.
 */

const AdGenerator = require('./ad-generator');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const generator = new AdGenerator();

// Variações automáticas
const variations = {
  condition: ['Novo', 'Semi-novo', 'Usado - Como novo', 'Usado - Bom estado'],
  urgency: [true, false],
  priceAdjust: [0, -5, -10, -15, +5], // Variações de preço (%)
  titles: {
    electronics: [
      '{name} {condition} - Ótimo Estado',
      '{name} {brand} - Promoção!',
      '{name} - Preço Imbatível',
      '{name} {condition} - Entrega Rápida',
      'Vendo {name} {condition}'
    ],
    vehicles: [
      '{brand} {model} {year} - IPVA Pago',
      '{brand} {model} - Documentos OK',
      '{name} - Financiamento Disponível',
      '{name} {year} - Aceito Troca',
      '{brand} {model} - Revisado'
    ],
    furniture: [
      '{name} - Excelente Estado',
      '{name} {condition} - Promoção',
      '{name} - Preço Baixo!',
      '{name} - Semi-novo',
      'Vendo {name} - Urgente'
    ],
    other: [
      '{name} {condition}',
      '{name} - Promoção!',
      '{name} - Preço Imbatível',
      'Vendo {name}',
      '{name} - Ótima Oportunidade'
    ]
  },
  descriptions: {
    electronics: [
      'Produto em excelente estado. Acompanha acessórios originais.',
      'Semi-novo, sem defeitos. Perfeito para quem quer economizar.',
      'Como novo, pouco usado. Garantia do fabricante.',
      'Ótimo estado de conservação. Venda rápida.',
      'Produto original, sem avarias. Recomendado!'
    ],
    vehicles: [
      'Carro revisado, documentos em dia. IPVA pago.',
      'Semi-novo, baixa quilometragem. Único dono.',
      'Excelente estado, sem sinistro. Financiamento disponível.',
      'Revisado pela concessionária. Garantia de fábrica.',
      'Carro cuidadoso, interior limpo. Aceito troca.'
    ],
    furniture: [
      'Semi-novo, sem manchas. Muito confortável.',
      'Excelente estado, pouco usado. Entrega combinável.',
      'Moderno e elegante. Perfeito para sua casa.',
      'Semi-novo, conservação impecável. Preço justo.',
      'Como novo, sem defeitos. Aproveite!'
    ],
    other: [
      'Produto em bom estado. Preço negociável.',
      'Semi-novo, pouco usado. Oportunidade única!',
      'Excelente condição. Venda rápida.',
      'Original, sem defeitos. Recomendo!',
      'Bom estado de conservação. Interessados, me chame!'
    ]
  }
};

async function askQuestion(question, options = null, defaultVal = null) {
  return new Promise((resolve) => {
    const q = options ? `${question}\n  Opções: ${options.join(', ')}\n  → ` : question;
    
    rl.question(q, (answer) => {
      if (!answer && defaultVal) {
        resolve(defaultVal);
        return;
      }
      
      if (options && !options.includes(answer)) {
        console.log('❌ Opção inválida. Tente novamente.');
        askQuestion(question, options, defaultVal).then(resolve);
        return;
      }
      
      resolve(answer || defaultVal);
    });
  });
}

// Gerar variações de um produto
function generateVariations(baseProduct, count = 10) {
  const variationsList = [];
  const category = baseProduct.category || 'electronics';
  
  for (let i = 0; i < count; i++) {
    // Variação de condição
    const conditionIndex = i % variations.condition.length;
    const condition = variations.condition[conditionIndex];
    
    // Variação de urgência
    const urgent = i % 3 === 0; // A cada 3, 1 é urgente
    
    // Variação de preço (-15% a +5%)
    const priceAdjustIndex = i % variations.priceAdjust.length;
    const priceAdjust = variations.priceAdjust[priceAdjustIndex];
    const adjustedPrice = Math.round(baseProduct.price * (1 + priceAdjust / 100));
    
    // Variação de título
    const titleTemplates = variations.titles[category] || variations.titles.other;
    const titleTemplate = titleTemplates[i % titleTemplates.length];
    const title = titleTemplate
      .replace('{name}', baseProduct.name)
      .replace('{brand}', baseProduct.brand || '')
      .replace('{model}', baseProduct.model || '')
      .replace('{year}', baseProduct.year || '')
      .replace('{condition}', condition);
    
    // Variação de descrição
    const descTemplates = variations.descriptions[category] || variations.descriptions.other;
    const description = descTemplates[i % descTemplates.length];
    
    // Variação de características
    const features = [...(baseProduct.features || [])];
    if (urgent) features.push('🔥 VENDA URGENTE!');
    if (i % 2 === 0) features.push('📦 Frete grátis!');
    
    variationsList.push({
      ...baseProduct,
      name: title,
      condition,
      price: adjustedPrice,
      originalPrice: baseProduct.price,
      urgent,
      description,
      features,
      variationIndex: i + 1,
      searchTerm: baseProduct.name
    });
  }
  
  return variationsList;
}

// Gerar anúncios em lote
async function generateBatch(products) {
  console.log('\n🎯 GERANDO ANÚNCIOS EM LOTE...\n');
  
  const results = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n📦 [${i + 1}/${products.length}] Gerando: ${product.name}`);
    
    try {
      const ad = await generator.generateAd(product);
      results.push({
        success: true,
        product: product.name,
        variation: product.variationIndex,
        ad
      });
    } catch (error) {
      console.error(`❌ Erro ao gerar anúncio: ${error.message}`);
      results.push({
        success: false,
        product: product.name,
        variation: product.variationIndex,
        error: error.message
      });
    }
  }
  
  return results;
}

// Criar arquivo de publicação em lote
function createBatchPublishScript(results) {
  const script = `
# ============================================
# FACEBOOK MARKETPLACE - PUBLICAÇÃO EM LOTE
# ============================================
# Gerado em: ${new Date().toISOString()}
# Total de anúncios: ${results.length}
# ============================================

${results.map((r, i) => `
# ============================================
# ANÚNCIO ${i + 1}: ${r.product}
# ============================================
# TÍTULO: ${r.ad.title}
# PREÇO: R$${r.ad.price}
# ============================================
# DESCRIÇÃO:
${r.ad.description}
# ============================================

`).join('\n')}

# ============================================
# INSTRUÇÕES
# ============================================
# 1. Abra o Facebook Marketplace
# 2. Para cada anúncio acima:
#    a. Clique em "Criar novo anúncio"
#    b. Copie o TÍTULO e cole
#    c. Copie a DESCRIÇÃO e cole
#    d. Adicione fotos
#    e. Configure preço e localização
#    f. Clique em "Publicar"
# 3. Repita para todos os ${results.length} anúncios
# ============================================

Write-Host "Abrindo Facebook Marketplace..." -ForegroundColor Green
Start-Process "https://www.facebook.com/marketplace/create"

Write-Host ""
Write-Host "📋 ${results.length} anúncios prontos para publicar!" -ForegroundColor Yellow
Write-Host "Copie os dados acima e cole no Facebook Marketplace" -ForegroundColor Cyan
  `.trim();
  
  const scriptPath = path.join(__dirname, 'publicar-em-lote.ps1');
  fs.writeFileSync(scriptPath, script);
  
  return scriptPath;
}

// Criar arquivo JSON com todos os anúncios
function saveBatchAds(results) {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const filename = `batch-${Date.now()}.json`;
  const filepath = path.join(dataDir, filename);
  
  const data = {
    generatedAt: new Date().toISOString(),
    totalAds: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    ads: results
  };
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  
  return filepath;
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 FACEBOOK MARKETPLACE - GERADOR EM LOTE');
  console.log('='.repeat(60));
  
  // Perguntar quantidade
  const count = parseInt(await askQuestion(
    ' Quantos anúncios deseja criar?',
    null,
    '10'
  ));
  
  console.log(`\n📦 Criando ${count} anúncios com variações...\n`);
  
  // Coletar dados base
  const baseProduct = {};
  
  baseProduct.name = await askQuestion('📝 Nome do produto: ');
  baseProduct.brand = await askQuestion('🏷️ Marca (opcional): ') || '';
  baseProduct.category = await askQuestion(
    '📦 Categoria:',
    ['1', '2', '3', '4'],
    '1'
  );
  
  const categoryMap = { '1': 'electronics', '2': 'vehicles', '3': 'furniture', '4': 'other' };
  baseProduct.category = categoryMap[baseProduct.category];
  
  baseProduct.price = parseFloat(await askQuestion('💰 Preço base (R$): ')) || 0;
  baseProduct.location = await askQuestion('📍 Localização: ');
  
  const featuresStr = await askQuestion('⭐ Características (separadas por vírgula): ');
  baseProduct.features = featuresStr ? featuresStr.split(',').map(f => f.trim()) : [];
  
  // Gerar variações
  console.log('\n🔄 Gerando variações automáticas...');
  const variationsList = generateVariations(baseProduct, count);
  
  // Gerar anúncios
  const results = await generateBatch(variationsList);
  
  // Salvar resultados
  const filepath = saveBatchAds(results);
  const scriptPath = createBatchPublishScript(results);
  
  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('✅ ANÚNCIOS GERADOS COM SUCESSO!');
  console.log('='.repeat(60));
  
  console.log(`\n📊 RESUMO:`);
  console.log(`   Total: ${results.length}`);
  console.log(`   Sucesso: ${results.filter(r => r.success).length}`);
  console.log(`   Erros: ${results.filter(r => !r.success).length}`);
  
  console.log(`\n📁 Arquivos criados:`);
  console.log(`   Dados: ${filepath}`);
  console.log(`   Script: ${scriptPath}`);
  
  console.log(`\n🚀 PARA PUBLICAR:`);
  console.log(`   1. Execute: .\\publicar-em-lote.ps1`);
  console.log(`   2. Copie os dados de cada anúncio`);
  console.log(`   3. Cole no Facebook Marketplace`);
  console.log(`   4. Repita para todos os ${count} anúncios`);
  
  console.log('\n' + '='.repeat(60));
  
  rl.close();
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { generateVariations, generateBatch };
