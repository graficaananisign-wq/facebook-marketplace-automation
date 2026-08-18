/**
 * Facebook Marketplace Ad Generator
 * 
 * Gera conteúdo otimizado para anúncios e abre o Facebook Marketplace
 * com os dados pré-preenchidos para facilitar a publicação.
 */

const MarketplaceAutomation = require('./marketplace-automation');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class AdGenerator {
  constructor() {
    this.automation = new MarketplaceAutomation();
    this.templates = this.loadTemplates();
  }

  loadTemplates() {
    return {
      // Templates por categoria
      categories: {
        electronics: {
          titlePrefix: ['Ótimo', 'Excelente', 'Perfeito', 'Vendo', 'Disponível'],
          conditions: ['Novo na caixa', 'Semi-novo', 'Usado - Como novo', 'Usado - Bom estado', 'Com defeito'],
          keywords: ['frete grátis', 'entrega rápida', 'garantia', 'acessórios originais'],
          descriptionStructure: (data) => `
📱 ${data.title}

✅ CONDIÇÃO: ${data.condition}
📦 O QUE VEM: ${data.includes || 'Produto completo com acessórios'}
💰 MOTIVO DA VENDA: ${data.reason || 'Preciso do dinheiro / Atualização de equipamento'}

🎯 CARACTERÍSTICAS:
${data.features ? data.features.map(f => `• ${f}`).join('\n') : '• Produto em excelente estado'}

📞 INTERESSADOS: Me chame por mensagem!
📍 LOCALIZAÇÃO: ${data.location || 'São Paulo'}
🚚 ENTREGA: ${data.delivery || 'Combinar no chat'}

#venda #marketplace #${data.category || 'eletronicos'}
          `.trim()
        },
        vehicles: {
          titleSuffix: ['Aceito troca', 'Financiamento disponível', 'IPVA pago', ' Documentos ok'],
          conditions: ['Novo', 'Semi-novo', 'Usado'],
          descriptionStructure: (data) => `
🚗 ${data.title}

📋 INFORMAÇÕES DO VEÍCULO:
• Marca/Modelo: ${data.brand} ${data.model}
• Ano: ${data.year}
• Quilometragem: ${data.mileage || 'A combinar'}
• Cambio: ${data.transmission || 'Manual'}
• Combustível: ${data.fuel || 'Flex'}
• Cor: ${data.color || 'A combinar'}

✅ DIFERENCIAIS:
${data.features ? data.features.map(f => `• ${f}`).join('\n') : '• Documentação em dia'}

📝 DETALHES:
• Placa: Informada no chat
• IPVA: ${data.ipva || 'Pago'}
• Revisões: ${data.reviews || 'Em dia'}

💰 VALOR: R$${data.price}
🔄 Aceito troca? ${data.trade || 'Sim, com complemento'}

📞 Chame para mais informações!
📍 ${data.location || 'São Paulo'}
          `.trim()
        },
        furniture: {
          titlePrefix: ['Vendo', 'Ótimo', 'Elegante', 'Moderno', 'Clássico'],
          conditions: ['Novo', 'Semi-novo', 'Usado - Bom estado'],
          descriptionStructure: (data) => `
🪑 ${data.title}

✨ CONDIÇÃO: ${data.condition}
📐 DIMENSÕES: ${data.dimensions || 'A combinar no chat'}
🎨 COR/MATERIAL: ${data.color || data.material || 'A combinar'}

📦 INCLUSOS:
${data.includes ? data.includes.map(i => `• ${i}`).join('\n') : '• Peça principal'}

💰 PREÇO: R$${data.price}
💵 Aceito proposta? ${data.negotiable !== false ? 'Sim' : 'Não'}

📍 LOCALIZAÇÃO: ${data.location || 'São Paulo'}
🚚 ENTREGA: ${data.delivery || 'Retirada no local / Frete por conta do comprador'}

💬 Me chame para combinar!
          `.trim()
        },
        realEstate: {
          titleSuffix: ['Área nobre', 'Próx. metrô', 'Vagas inclusas', 'Mobiliado'],
          conditions: ['Novo', 'Usado'],
          descriptionStructure: (data) => `
🏠 ${data.title}

📋 DADOS DO IMÓVEL:
• Tipo: ${data.type || 'Apartamento'}
• Área: ${data.area || 'A combinar'}
• Quartos: ${data.bedrooms || 'A combinar'}
• Banheiros: ${data.bathrooms || '1'}
• Vagas: ${data.parking || '0'}

✅ CARACTERÍSTICAS:
${data.features ? data.features.map(f => `• ${f}`).join('\n') : '• Ótima localização'}

📍 LOCALIZAÇÃO: ${data.location || 'São Paulo'}
🚇 TRANSPORTE: ${data.transport || 'Próximo a estações'}

💰 VALOR: R$${data.price}
📝 Condomínio: ${data.condo || 'Incluso no valor'}
💡 IPTU: ${data.iptu || 'A combinar'}

📞 Agende sua visita!
          `.trim()
        }
      },
      // Templates de urgência
      urgency: [
        '🔥 PROMOÇÃO POR TEMPO LIMITADO!',
        '⚡ ÚLTIMA UNIDADE!',
        '🏷️ PREÇO ESPECIAL!',
        '📦 VENDA RÁPIDA!',
        '🎯 OFERTA IMPERDÍVEL!'
      ],
      // Call to actions
      cta: [
        'Chame agora!',
        'Me chame para mais detalhes!',
        'Interessado? Me contate!',
        'Disponível imediatamente!',
        'Garanta já o seu!'
      ]
    };
  }

  // Gerar título otimizado
  generateTitle(product) {
    const { name, condition, brand, model, year, category } = product;
    
    let title = '';
    
    // Adicionar prefixo de urgência (opcional)
    if (product.urgent) {
      title += this.getRandomItem(this.templates.urgency) + ' ';
    }
    
    // Construir título baseado na categoria
    if (category === 'vehicles') {
      title = `${brand || ''} ${model || ''} ${year || ''} ${condition || ''}`.trim();
    } else if (category === 'electronics') {
      title = `${brand || ''} ${name} ${condition || ''}`.trim();
    } else {
      title = `${name} ${condition || ''}`.trim();
    }
    
    // Limitar a 100 caracteres (limite do Facebook)
    if (title.length > 100) {
      title = title.substring(0, 97) + '...';
    }
    
    return title;
  }

  // Gerar descrição completa
  generateDescription(product) {
    const category = product.category || 'electronics';
    const template = this.templates.categories[category];
    
    if (template && template.descriptionStructure) {
      return template.descriptionStructure(product);
    }
    
    // Descrição genérica
    return `
${product.name}

✅ CONDIÇÃO: ${product.condition || 'Semi-novo'}
💰 PREÇO: R$${product.price}
📍 LOCALIZAÇÃO: ${product.location || 'São Paulo'}

${product.description || ''}

📞 Me chame para mais informações!
    `.trim();
  }

  // Calcular preço competitivo baseado no mercado
  async calculateCompetitivePrice(searchTerm, targetPrice, location) {
    try {
      console.log(`💰 Analisando preços para "${searchTerm}"...`);
      
      const items = await this.automation.scrape([], {
        searchKeyword: searchTerm,
        location: location,
        getListingDetails: true
      });
      
      const prices = items
        .map(i => parseFloat(i.listing_price?.amount || 0))
        .filter(p => p > 0);
      
      if (prices.length === 0) {
        return {
          suggested: targetPrice,
          market: { min: 0, max: 0, avg: 0, count: 0 },
          analysis: 'Sem dados de mercado disponíveis'
        };
      }
      
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const avg = (prices.reduce((a, b) => a + b, 0) / prices.length);
      const median = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
      
      // Calcular preço sugerido (10% abaixo da média para venda rápida)
      const suggested = Math.round(avg * 0.9);
      
      // Determinar análise
      let analysis = '';
      if (targetPrice < min) {
        analysis = '⚠️ Preço MUITO baixo! Você pode vender mais caro.';
      } else if (targetPrice < avg * 0.8) {
        analysis = '✅ Preço MUITO competitivo! Venda rápida garantida.';
      } else if (targetPrice < avg) {
        analysis = '✅ Preço competitivo. Boa chance de venda.';
      } else if (targetPrice < max) {
        analysis = '⚠️ Preço acima da média. Pode demorar para vender.';
      } else {
        analysis = '❌ Preço muito alto! Considere reduzir.';
      }
      
      return {
        suggested,
        market: {
          min,
          max,
          avg: Math.round(avg),
          median,
          count: prices.length
        },
        analysis
      };
    } catch (error) {
      console.error('Erro ao analisar preços:', error.message);
      return {
        suggested: targetPrice,
        market: { min: 0, max: 0, avg: 0, count: 0 },
        analysis: 'Não foi possível analisar o mercado'
      };
    }
  }

  // Gerar anúncio completo
  async generateAd(productData) {
    console.log('\n🎯 GERANDO ANÚNCIO...\n');
    
    // 1. Gerar título
    const title = this.generateTitle(productData);
    console.log(`📝 Título: ${title}`);
    
    // 2. Analisar preço competitivo
    const priceAnalysis = await this.calculateCompetitivePrice(
      productData.name || productData.searchTerm,
      productData.price,
      productData.location
    );
    
    console.log(`\n💰 ANÁLISE DE PREÇO:`);
    console.log(`   Seu preço: R$${productData.price}`);
    console.log(`   Preço sugerido: R$${priceAnalysis.suggested}`);
    console.log(`   Média do mercado: R$${priceAnalysis.market.avg}`);
    console.log(`   ${priceAnalysis.analysis}`);
    
    // 3. Gerar descrição
    const description = this.generateDescription({
      ...productData,
      title
    });
    
    // 4. Preparar dados finais
    const ad = {
      title,
      description,
      price: productData.price,
      suggestedPrice: priceAnalysis.suggested,
      priceAnalysis: priceAnalysis.market,
      location: productData.location || 'São Paulo, Brazil',
      category: productData.category || 'eletronicos',
      condition: productData.condition || 'Semi-novo',
      images: productData.images || [],
      contact: productData.contact || '',
      features: productData.features || [],
      timestamp: new Date().toISOString()
    };
    
    // 5. Salvar anúncio
    this.saveAd(ad);
    
    return ad;
  }

  // Salvar anúncio em arquivo
  saveAd(ad) {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filename = `ad-${Date.now()}.json`;
    const filepath = path.join(dataDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(ad, null, 2));
    console.log(`\n💾 Anúncio salvo em: ${filepath}`);
  }

  // Abrir Facebook Marketplace para publicação
  openMarketplace(ad) {
    console.log('\n🌐 ABRINDO FACEBOOK MARKETPLACE...\n');
    
    // URL do Facebook Marketplace para criar anúncio
    const marketplaceUrl = 'https://www.facebook.com/marketplace/create';
    
    // Preparar dados para clipboard
    const clipboardData = {
      title: ad.title,
      price: ad.price.toString(),
      description: ad.description,
      location: ad.location
    };
    
    // Criar script para copiar dados e abrir navegador
    const script = `
# Dados do anúncio para copiar:
TÍTULO: ${ad.title}
PREÇO: R$${ad.price}
DESCRIÇÃO:
${ad.description}

# Instruções:
# 1. O Facebook Marketplace será aberto
# 2. Copie o título acima
# 3. Cole no campo "Título"
# 4. Copie a descrição
# 5. Cole no campo "Descrição"
# 6. Adicione suas fotos
# 7. Configure localização e categoria
# 8. Clique em "Publicar"

Start-Process "${marketplaceUrl}"
    `.trim();
    
    // Salvar script
    const scriptPath = path.join(__dirname, 'open-marketplace.ps1');
    fs.writeFileSync(scriptPath, script);
    
    console.log('📋 DADOS DO ANÚNCIO:');
    console.log('─'.repeat(50));
    console.log(`📝 TÍTULO: ${ad.title}`);
    console.log(`💰 PREÇO: R$${ad.price}`);
    console.log('─'.repeat(50));
    console.log('📄 DESCRIÇÃO:');
    console.log(ad.description);
    console.log('─'.repeat(50));
    
    console.log('\n✅ Script gerado: open-marketplace.ps1');
    console.log('\n🚀 PARA PUBLICAR:');
    console.log('   1. Execute: .\\open-marketplace.ps1');
    console.log('   2. Copie os dados acima');
    console.log('   3. Cole no Facebook Marketplace');
    console.log('   4. Adicione suas fotos');
    console.log('   5. Clique em "Publicar"');
    
    return {
      scriptPath,
      clipboardData
    };
  }

  // Criar anúncio e abrir Marketplace
  async createAndPublish(productData) {
    // Gerar anúncio
    const ad = await this.generateAd(productData);
    
    // Abrir Marketplace
    const result = this.openMarketplace(ad);
    
    return {
      ad,
      scriptPath: result.scriptPath,
      instructions: [
        'Execute o script open-marketplace.ps1',
        'Copie o título e cole no Facebook',
        'Copie a descrição e cole no Facebook',
        'Adicione suas fotos',
        'Configure localização',
        'Clique em Publicar'
      ]
    };
  }

  // Utility: Get random item from array
  getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Criar anúncios em lote
  async createBatch(products) {
    console.log('\n🎯 CRIANDO ANÚNCIOS EM LOTE...\n');
    
    const results = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`📦 [${i + 1}/${products.length}] ${product.name}`);
      
      try {
        const ad = await this.generateAd(product);
        results.push({ success: true, product: product.name, ad });
      } catch (error) {
        console.error(`❌ Erro: ${error.message}`);
        results.push({ success: false, product: product.name, error: error.message });
      }
    }
    
    console.log(`\n✅ Lote concluído: ${results.filter(r => r.success).length}/${products.length}`);
    return results;
  }

  // Gerar variações automáticas de um produto
  generateVariations(baseProduct, count = 10) {
    const conditions = ['Novo', 'Semi-novo', 'Usado - Como novo', 'Usado - Bom estado'];
    const titlePrefixes = {
      electronics: ['Ótimo', 'Excelente', 'Perfeito', 'Vendo', 'Disponível'],
      vehicles: ['IPVA Pago', 'Documentos OK', 'Revisado', 'Único Dono', 'Financiamento'],
      furniture: ['Semi-novo', 'Como Novo', 'Promoção', 'Oportunidade', 'Venda'],
      other: ['Promoção', 'Oportunidade', 'Raro', 'Imperdível', 'Última Unidade']
    };
    
    const variations = [];
    const category = baseProduct.category || 'electronics';
    const prefixes = titlePrefixes[category] || titlePrefixes.other;
    
    for (let i = 0; i < count; i++) {
      const condition = conditions[i % conditions.length];
      const prefix = prefixes[i % prefixes.length];
      const priceAdjust = [-10, -5, 0, 5, 10][i % 5];
      const adjustedPrice = Math.round(baseProduct.price * (1 + priceAdjust / 100));
      
      variations.push({
        ...baseProduct,
        name: `${prefix} ${baseProduct.name} - ${condition}`,
        condition,
        price: adjustedPrice,
        originalPrice: baseProduct.price,
        urgent: i % 3 === 0,
        variationIndex: i + 1,
        searchTerm: baseProduct.name
      });
    }
    
    return variations;
  }
}

// Exportar
module.exports = AdGenerator;

// Executar se chamado diretamente
if (require.main === module) {
  const generator = new AdGenerator();
  
  // Exemplo de uso
  const exampleProduct = {
    name: 'iPhone 13 Pro Max 256GB',
    brand: 'Apple',
    model: 'iPhone 13 Pro Max',
    condition: 'Semi-novo',
    price: 4500,
    location: 'São Paulo, SP',
    category: 'electronics',
    features: [
      'Bateria 95%',
      'Sem riscos',
      'Caixa e acessórios originais',
      'Garantia Apple até 2024'
    ],
    reason: 'Comprei iPhone 15',
    includes: 'Celular, caixa, carregador, cabo',
    urgent: true,
    searchTerm: 'iPhone 13 Pro Max'
  };
  
  generator.createAndPublish(exampleProduct);
}
