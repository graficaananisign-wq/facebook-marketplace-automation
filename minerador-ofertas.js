/**
 * Minerador de Ofertas Vencedoras
 * 
 * Busca anúncios na Facebook Ads Library via Parse API
 * e salva os resultados para análise.
 * 
 * Uso: node minerador-ofertas.js
 * 
 * Requer: API_KEY do Parse Bot em config-mineracao.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class MineradorOfertas {
  constructor(configPath) {
    const configDir = configPath || path.join(__dirname, 'config-mineracao.json');
    this.config = JSON.parse(fs.readFileSync(configDir, 'utf8'));
    this.pastaMinerados = path.join(__dirname, this.config.output.pastaMinerados);
    this.criarPasta();
  }

  criarPasta() {
    if (!fs.existsSync(this.pastaMinerados)) {
      fs.mkdirSync(this.pastaMinerados, { recursive: true });
    }
  }

  /**
   * Faz requisição à Parse API
   */
  async requisicao(endpoint, body = null) {
    const url = new URL(endpoint, this.config.api.baseUrl);
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: body ? 'POST' : 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.api.apiKey}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ raw: data });
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Timeout na requisição'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  /**
   * Busca anúncios por palavra-chave
   */
  async buscarPorPalavraChave(palavraChave) {
    console.log(`\nBuscando: "${palavraChave}"...`);
    
    const body = {
      query: palavraChave,
      ad_type: 'all',
      country: this.config.filtros.pais,
      limit: this.config.filtros.limitePorBusca
    };

    try {
      const resultado = await this.requisicao('/search_ads', body);
      
      if (resultado.ads && Array.isArray(resultado.ads)) {
        console.log(`Encontrados ${resultado.ads.length} anuncios`);
        return resultado.ads;
      }
      
      if (resultado.data && Array.isArray(resultado.data)) {
        console.log(`Encontrados ${resultado.data.length} anuncios`);
        return resultado.data;
      }
      
      console.log('Formato de resposta nao reconhecido:', Object.keys(resultado));
      return [];
    } catch (error) {
      console.error(`Erro ao buscar "${palavraChave}":`, error.message);
      return [];
    }
  }

  /**
   * Busca detalhes de um anuncio especifico
   */
  async buscarDetalhes(adId) {
    try {
      const resultado = await this.requisicao(`/get_ad_details?ad_id=${adId}`);
      return resultado;
    } catch (error) {
      console.error(`Erro ao buscar detalhes do ad ${adId}:`, error.message);
      return null;
    }
  }

  /**
   * Salva anuncios minerados
   */
  salvarAnuncios(anuncios, palavraChave) {
    const timestamp = Date.now();
    const nomeArquivo = `minerado-${palavraChave.replace(/\s+/g, '-')}-${timestamp}.json`;
    const caminho = path.join(this.pastaMinerados, nomeArquivo);
    
    const dados = {
      palavraChave,
      dataMineracao: new Date().toISOString(),
      totalAnuncios: anuncios.length,
      anuncios
    };

    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
    console.log(`Salvo: ${caminho}`);
    return caminho;
  }

  /**
   * Aguarda entre requisicoes (rate limit)
   */
  aguardar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Executa mineracao completa
   */
  async minerar() {
    console.log('=== MINERADOR DE OFERTAS VENCEDORAS ===');
    console.log(`API: ${this.config.api.provider}`);
    console.log(`Pais: ${this.config.filtros.pais}`);
    console.log(`Palavras-chave: ${this.config.palavrasChave.length}`);
    console.log('');

    if (this.config.api.apiKey === 'SUA_API_KEY_PARSE_AQUI') {
      console.log('ERRO: Configure sua API key em config-mineracao.json');
      console.log('1. Acesse: https://parse.bot');
      console.log('2. Crie uma conta gratuita');
      console.log('3. Copie a API key');
      console.log('4. Cole em config-mineracao.json > api.apiKey');
      return [];
    }

    const todosAnuncios = [];
    const arquivosCriados = [];

    for (let i = 0; i < this.config.palavrasChave.length; i++) {
      const palavraChave = this.config.palavrasChave[i];
      
      const anuncios = await this.buscarPorPalavraChave(palavraChave);
      
      if (anuncios.length > 0) {
        const arquivo = this.salvarAnuncios(anuncios, palavraChave);
        arquivosCriados.push(arquivo);
        todosAnuncios.push(...anuncios.map(a => ({ ...a, palavraChaveOrigem: palavraChave })));
      }

      if (i < this.config.palavrasChave.length - 1) {
        console.log('Aguardando 15 segundos (rate limit)...');
        await this.aguardar(15000);
      }
    }

    console.log('\n=== RESUMO DA MINERACAO ===');
    console.log(`Total de anuncios: ${todosAnuncios.length}`);
    console.log(`Arquivos criados: ${arquivosCriados.length}`);
    
    return todosAnuncios;
  }
}

async function main() {
  const minerador = new MineradorOfertas();
  const anuncios = await minerador.minerar();
  
  if (anuncios.length > 0) {
    console.log('\nProximo passo: node relatorio-ofertas.js');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MineradorOfertas;
