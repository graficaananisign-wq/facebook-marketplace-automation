/**
 * Facebook Marketplace Automation - Script Principal
 * 
 * Automação completa usando Apify para:
 * - Monitorar concorrentes
 * - Encontrar ofertas
 * - Analisar mercado
 * - Criar anúncios multi-plataforma
 * 
 * Uso: node marketplace-automation.js [comando]
 * 
 * Comandos:
 *   monitor    - Monitorar concorrentes
 *   ofertas    - Buscar ofertas abaixo do preço
 *   analise    - Análise de mercado
 *   relatorio  - Gerar relatório completo
 */

const { ApifyClient } = require('apify-client');
const fs = require('fs');
const path = require('path');

class MarketplaceAutomation {
  constructor(configPath = 'config.json') {
    this.loadConfig(configPath);
    this.client = new ApifyClient({ token: this.config.token });
    this.dataDir = path.join(__dirname, 'data');
    this.ensureDataDir();
  }

  loadConfig(configPath) {
    try {
      const configFull = JSON.parse(fs.readFileSync(configPath));
      this.config = {
        token: configFull.token,
        actor: configFull.actor || 'curious_coder/facebook-marketplace',
        defaultLocation: configFull.defaultLocation || 'São Paulo, Brazil',
        defaultCategory: configFull.defaultCategory || 'electronics',
        monitorInterval: configFull.monitoringInterval || 30,
        priceAlerts: configFull.priceAlerts || { enabled: false },
        locations: configFull.locations || ['São Paulo, Brazil']
      };
    } catch (error) {
      console.error('❌ Erro ao carregar configuração:', error.message);
      console.log('💡 Copie config.example.json para config.json e preencha seu token');
      process.exit(1);
    }
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  async scrape(urls, options = {}) {
    const input = {
      urls: urls,
      getListingDetails: options.includeDetails !== false,
      getAllListingPhotos: options.includePhotos !== false,
      strictFiltering: options.strictFiltering !== false,
      ...options
    };

    console.log('🔍 Iniciando scrape...');
    const run = await this.client.actor(this.config.actor).call(input);
    
    const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
    console.log(`✅ Coletados ${items.length} itens`);
    
    return items;
  }

  async monitorar(urls) {
    console.log('\n📊 MONITORANDO CONCORRENTES...\n');
    
    const items = await this.scrape(urls, 200, true);
    const timestamp = this.getTimestamp();
    
    // Salvar dados atuais
    const filename = path.join(this.dataDir, `monitor-${timestamp}.json`);
    fs.writeFileSync(filename, JSON.stringify(items, null, 2));
    
    // Comparar com dados anteriores
    const arquivosAnteriores = fs.readdirSync(this.dataDir)
      .filter(f => f.startsWith('monitor-') && f.endsWith('.json'))
      .sort()
      .slice(-2, -1);
    
    if (arquivosAnteriores.length > 0) {
      const dadosAnteriores = JSON.parse(fs.readFileSync(path.join(this.dataDir, arquivosAnteriores[0])));
      const mudancas = this.detectarMudancas(dadosAnteriores, items);
      
      if (mudancas.length > 0) {
        console.log('\n📈 MUDANÇAS DETECTADAS:');
        mudancas.forEach(m => {
          const emoji = m.variacaoPercentual < 0 ? '📉' : '📈';
          console.log(`${emoji} ${m.titulo}`);
          console.log(`   Preço: R$${m.precoAnterior} → R$${m.precoAtual} (${m.variacaoPercentual}%)`);
          console.log(`   URL: ${m.url}\n`);
        });
      } else {
        console.log('\n✅ Nenhuma mudança significativa detectada');
      }
    }
    
    return { items, filename };
  }

  detectarMudancas(anteriores, atuais) {
    const mudancas = [];
    const mapaAnterior = new Map(anteriores.map(a => [a.id, a]));
    
    for (const atual of atuais) {
      const anterior = mapaAnterior.get(atual.id);
      
      if (anterior) {
        const precoAnterior = parseFloat(anterior.listing_price?.amount || 0);
        const precoAtual = parseFloat(atual.listing_price?.amount || 0);
        
        if (precoAnterior > 0 && precoAtual > 0 && precoAnterior !== precoAtual) {
          mudancas.push({
            id: atual.id,
            titulo: atual.marketplace_listing_title,
            url: atual.listingUrl,
            precoAnterior,
            precoAtual,
            variacaoPercentual: ((precoAtual - precoAnterior) / precoAnterior * 100).toFixed(1)
          });
        }
      }
    }
    
    return mudancas;
  }

  async buscarOfertas(busca, precoMaximo, localizacao = null) {
    const loc = localizacao || this.config.defaultLocation;
    
    console.log(`\n🔍 Buscando "${busca}" em ${loc} (até R$${precoMaximo})...`);
    
    const items = await this.scrape([], {
      searchKeyword: busca,
      location: loc,
      maxPrice: precoMaximo
    });
    
    const ofertas = items
      .filter(item => {
        const preco = parseFloat(item.listing_price?.amount || 0);
        return preco > 0 && preco <= precoMaximo;
      })
      .map(item => ({
        id: item.id,
        titulo: item.marketplace_listing_title,
        preco: parseFloat(item.listing_price?.amount),
        precoFormatado: item.listing_price?.formatted_amount_zeros_stripped || item.listing_price?.formatted_amount,
        url: item.listingUrl,
        vendedor: item.marketplace_listing_seller?.name,
        localizacao: item.location_text?.text || item.location?.reverse_geocode?.city,
        status: {
          ativo: item.is_live,
          vendido: item.is_sold,
          pendente: item.is_pending
        }
      }))
      .sort((a, b) => a.preco - b.preco);
    
    console.log(`✅ Encontradas ${ofertas.length} ofertas abaixo de R$${precoMaximo}`);
    
    return ofertas;
  }

  async monitorarOfertas() {
    if (!this.config.priceAlerts.enabled) {
      console.log('⚠️ Alertas de preço desativados na configuração');
      return [];
    }
    
    console.log('\n🔔 MONITORANDO OFERTAS...\n');
    
    const todasOfertas = [];
    
    for (const local of this.config.locations) {
      for (const [produto, precos] of Object.entries(this.config.priceAlerts.products)) {
        try {
          const ofertas = await this.buscarOfertas(produto, precos.maxPrice, local);
          
          ofertas.forEach(o => {
            const desconto = ((precos.avgPrice - o.preco) / precos.avgPrice * 100).toFixed(1);
            o.produto = produto;
            o.precoMedio = precos.avgPrice;
            o.desconto = desconto;
          });
          
          todasOfertas.push(...ofertas);
          
          // Delay entre requests
          await new Promise(r => setTimeout(r, 2000));
        } catch (error) {
          console.error(`❌ Erro ao buscar ${produto} em ${local}:`, error.message);
        }
      }
    }
    
    // Salvar ofertas
    if (todasOfertas.length > 0) {
      const timestamp = this.getTimestamp();
      const filename = path.join(this.dataDir, `ofertas-${timestamp}.json`);
      fs.writeFileSync(filename, JSON.stringify(todasOfertas, null, 2));
      
      console.log('\n📊 RESUMO DAS OFERTAS:');
      console.log(`Total: ${todasOfertas.length} ofertas encontradas\n`);
      
      todasOfertas.slice(0, 10).forEach((o, i) => {
        console.log(`${i + 1}. ${o.titulo}`);
        console.log(`   💰 R$${o.preco} (média: R$${o.precoMedio} | desconto: ${o.desconto}%)`);
        console.log(`   📍 ${o.localizacao || 'N/A'} | 👤 ${o.vendedor || 'N/A'}`);
        console.log(`   🔗 ${o.url}\n`);
      });
      
      if (todasOfertas.length > 10) {
        console.log(`... e mais ${todasOfertas.length - 10} ofertas no arquivo ${filename}`);
      }
    }
    
    return todasOfertas;
  }

  async analisarMercado(busca, localizacao = null) {
    const loc = localizacao || this.config.defaultLocation;
    
    console.log(`\n📊 ANALISANDO MERCADO: "${busca}" em ${loc}\n`);
    
    const items = await this.scrape([], {
      searchKeyword: busca,
      location: loc
    });
    
    const precos = items
      .map(i => parseFloat(i.listing_price?.amount || 0))
      .filter(p => p > 0);
    
    if (precos.length === 0) {
      console.log('⚠️ Nenhum preço encontrado');
      return null;
    }
    
    const stats = {
      busca,
      localizacao: loc,
      timestamp: new Date().toISOString(),
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
      vendedores: {
        total: new Set(items.map(i => i.marketplace_listing_seller?.name)).size,
        maisVendidos: this.contarVendedores(items)
      }
    };
    
    // Salvar análise
    const timestamp = this.getTimestamp();
    const filename = path.join(this.dataDir, `analise-${busca.replace(/\s+/g, '-')}-${timestamp}.json`);
    fs.writeFileSync(filename, JSON.stringify(stats, null, 2));
    
    console.log('📈 RESULTADOS:');
    console.log(`   Total de anúncios: ${stats.totalAnuncios}`);
    console.log(`   Preço mínimo: R$${stats.precos.minimo}`);
    console.log(`   Preço máximo: R$${stats.precos.maximo}`);
    console.log(`   Preço médio: R$${stats.precos.medio}`);
    console.log(`   Mediana: R$${stats.precos.mediana}`);
    console.log(`   Ativos: ${stats.porStatus.ativos}`);
    console.log(`   Vendidos: ${stats.porStatus.vendidos}`);
    console.log(`   Vendedores únicos: ${stats.vendedores.total}`);
    console.log(`\n💾 Análise salva em ${filename}`);
    
    return stats;
  }

  contarVendedores(items) {
    const contagem = {};
    items.forEach(item => {
      const vendedor = item.marketplace_listing_seller?.name;
      if (vendedor) {
        contagem[vendedor] = (contagem[vendedor] || 0) + 1;
      }
    });
    
    return Object.entries(contagem)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([nome, count]) => ({ nome, anuncios: count }));
  }

  async gerarRelatorio(categorias = null) {
    console.log('\n📋 GERANDO RELATÓRIO COMPLETO...\n');
    
    const cats = categorias || ['iphone', 'samsung', 'macbook', 'ps5', 'notebook'];
    const relatorio = {
      timestamp: new Date().toISOString(),
      localizacao: this.config.defaultLocation,
      categorias: {}
    };
    
    for (const cat of cats) {
      console.log(`📊 Analisando ${cat}...`);
      relatorio.categorias[cat] = await this.analisarMercado(cat);
      
      // Delay entre requests
      await new Promise(r => setTimeout(r, 2000));
    }
    
    // Salvar relatório
    const timestamp = this.getTimestamp();
    const filename = path.join(this.dataDir, `relatorio-completo-${timestamp}.json`);
    fs.writeFileSync(filename, JSON.stringify(relatorio, null, 2));
    
    console.log('\n✅ RELATÓRIO GERADO!');
    console.log(`💾 Salvo em ${filename}`);
    
    // Resumo
    console.log('\n📊 RESUMO:');
    for (const [cat, dados] of Object.entries(relatorio.categorias)) {
      if (dados) {
        console.log(`   ${cat}: R$${dados.precos.medio} (média) | ${dados.totalAnuncios} anúncios`);
      }
    }
    
    return relatorio;
  }

  prepararAnuncio(produto) {
    console.log('\n📝 PREPARANDO DADOS DO ANÚNCIO...\n');
    
    const timestamp = this.getTimestamp();
    
    // Facebook Marketplace
    const facebook = {
      title: produto.titulo,
      description: produto.descricao,
      price: produto.preco,
      location: produto.localizacao,
      category: produto.categoria,
      images: produto.fotos,
      delivery: produto.envio,
      pickup: produto.retirada
    };
    
    const fbFile = path.join(this.dataDir, `anuncio-facebook-${timestamp}.json`);
    fs.writeFileSync(fbFile, JSON.stringify(facebook, null, 2));
    console.log('✅ Facebook Marketplace: ' + fbFile);
    
    // OLX
    const olx = {
      subject: produto.titulo,
      description: produto.descricao,
      price: [{ value: produto.preco }],
      location: { city: 'São Paulo', state: 'SP' },
      category: 1205,
      images: produto.fotos
    };
    
    const olxFile = path.join(this.dataDir, `anuncio-olx-${timestamp}.json`);
    fs.writeFileSync(olxFile, JSON.stringify(olx, null, 2));
    console.log('✅ OLX: ' + olxFile);
    
    // Mercado Livre
    const ml = {
      title: produto.titulo,
      description: produto.descricao,
      price: produto.preco,
      currency_id: 'BRL',
      category_id: 'MLB1055',
      condition: 'used',
      available_quantity: 1,
      buying_mode: 'buy_it_now',
      listing_type_id: 'gold_special',
      shipping: { mode: 'me2', free_shipping: true },
      pictures: produto.fotos.map(url => ({ source: url }))
    };
    
    const mlFile = path.join(this.dataDir, `anuncio-ml-${timestamp}.json`);
    fs.writeFileSync(mlFile, JSON.stringify(ml, null, 2));
    console.log('✅ Mercado Livre: ' + mlFile);
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Facebook: Acesse marketplace.facebook.com e crie o anúncio manualmente');
    console.log('2. OLX: Use a API da OLX ou publique manualmente em olx.com.br');
    console.log('3. Mercado Livre: Use a API do ML ou publique em mercadolivre.com.br');
    
    return { facebook: fbFile, olx: olxFile, mercadolivre: mlFile };
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const comando = args[0] || 'help';
  
  const automation = new MarketplaceAutomation();
  
  (async () => {
    try {
      switch (comando) {
        case 'monitor':
          const urls = args.slice(1);
          if (urls.length === 0) {
            console.log('Uso: node marketplace-automation.js monitor [url1] [url2]...');
            console.log('Exemplo: node marketplace-automation.js monitor "https://www.facebook.com/marketplace/saopaulo/search/?query=iphone"');
          } else {
            await automation.monitorar(urls);
          }
          break;
          
        case 'ofertas':
          await automation.monitorarOfertas();
          break;
          
        case 'analise':
          const busca = args[1] || 'iphone';
          const local = args[2] || automation.config.defaultLocation;
          await automation.analisarMercado(busca, local);
          break;
          
        case 'relatorio':
          await automation.gerarRelatorio();
          break;
          
        case 'anuncio':
          const produto = {
            titulo: args[1] || 'Produto de Teste',
            descricao: args[2] || 'Descrição do produto',
            preco: parseFloat(args[3]) || 100,
            localizacao: args[4] || 'São Paulo, SP',
            categoria: args[5] || 'electronics',
            fotos: [],
            envio: true,
            retirada: true
          };
          automation.prepararAnuncio(produto);
          break;
          
        default:
          console.log(`
📚 Facebook Marketplace Automation

Uso: node marketplace-automation.js [comando] [opções]

Comandos:
  monitor [url1] [url2]...  Monitorar concorrentes
  ofertas                   Buscar ofertas abaixo do preço
  analise [busca] [local]   Análise de mercado
  relatorio                 Gerar relatório completo
  anuncio [título] [desc] [preço] [local] [cat]  Preparar anúncio
  help                      Mostrar esta ajuda

Exemplos:
  node marketplace-automation.js monitor "https://www.facebook.com/marketplace/saopaulo/search/?query=iphone"
  node marketplace-automation.js analise "samsung s23" "rio-de-janeiro"
  node marketplace-automation.js relatorio
          `);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  })();
}

module.exports = MarketplaceAutomation;
