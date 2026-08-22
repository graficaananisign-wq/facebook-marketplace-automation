/**
 * Relatório de Ofertas Vencedoras
 * 
 * Lê os anúncios minerados, classifica, pontua
 * e gera um relatório com o Top 10.
 * 
 * Uso: node relatorio-ofertas.js
 */

const fs = require('fs');
const path = require('path');
const Pontuador = require('./pontuador');
const Classificador = require('./classificador');

class RelatorioOfertas {
  constructor() {
    this.pontuador = new Pontuador();
    this.classificador = new Classificador();
    this.pastaMinerados = path.join(__dirname, 'data', 'minerados');
    this.pastaRelatorios = path.join(__dirname, 'data', 'relatorios');
    this.criarPasta();
  }

  criarPasta() {
    if (!fs.existsSync(this.pastaRelatorios)) {
      fs.mkdirSync(this.pastaRelatorios, { recursive: true });
    }
  }

  /**
   * Carrega todos os anúncios minerados
   */
  carregarAnuncios() {
    if (!fs.existsSync(this.pastaMinerados)) {
      console.log('Nenhuma pasta de dados encontrada.');
      console.log('Execute primeiro: node minerador-ofertas.js');
      return [];
    }

    const arquivos = fs.readdirSync(this.pastaMinerados)
      .filter(f => f.endsWith('.json'));

    if (arquivos.length === 0) {
      console.log('Nenhum arquivo de dados encontrado.');
      console.log('Execute primeiro: node minerador-ofertas.js');
      return [];
    }

    let todosAnuncios = [];

    for (const arquivo of arquivos) {
      const caminho = path.join(this.pastaMinerados, arquivo);
      const dados = JSON.parse(fs.readFileSync(caminho, 'utf8'));
      
      if (dados.anuncios && Array.isArray(dados.anuncios)) {
        todosAnuncios.push(...dados.anuncios);
      }
    }

    console.log(`Carregados ${todosAnuncios.length} anúncios de ${arquivos.length} arquivo(s)`);
    return todosAnuncios;
  }

  /**
   * Processa e pontua todos os anúncios
   */
  processarAnuncios(anuncios) {
    console.log('\nProcessando e pontuando anúncios...');

    const processados = anuncios.map((ad, index) => {
      const pontuacao = this.pontuador.calcular(ad);
      return {
        id: ad.id || `ad-${index}`,
        titulo: ad.title || 'Sem título',
        texto: ad.body || ad.text || '',
        link: ad.ad_creative_link_url || ad.url || '',
        imagem: ad.ad_creative_image_url || ad.image_url || '',
        palavraChaveOrigem: ad.palavraChaveOrigem || '',
        ...pontuacao
      };
    });

    processados.sort((a, b) => b.notaFinal - a.notaFinal);
    
    console.log(`Processados e ordenados: ${processados.length} anúncios`);
    return processados;
  }

  /**
   * Gera o relatório Top 10
   */
  gerarRelatorio(processados) {
    const top10 = processados.slice(0, 10);

    let relatorio = '';
    relatorio += '============================================\n';
    relatorio += '    TOP 10 OFERTAS VENCEDORAS\n';
    relatorio += '============================================\n\n';
    relatorio += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    relatorio += `Total analisado: ${processados.length} anúncios\n\n`;

    if (top10.length === 0) {
      relatorio += 'Nenhum anúncio encontrado para análise.\n';
      return relatorio;
    }

    top10.forEach((item, index) => {
      relatorio += `\n#${index + 1} - NOTA: ${item.notaFinal}/100\n`;
      relatorio += `${'─'.repeat(50)}\n`;
      relatorio += `Título: ${item.titulo}\n`;
      relatorio += `Link: ${item.link}\n`;
      relatorio += `Palavra-chave: ${item.palavraChaveOrigem}\n\n`;
      
      relatorio += `⏱️  Tempo: ${item.detalhes.tempo.diasAtivos} dias (${item.detalhes.tempo.classificacao})\n`;
      relatorio += `📊 Impressões: ${item.detalhes.impressoes.faixa}\n`;
      relatorio += `🎨 Criativo: ${item.detalhes.criativo.nota}/100\n`;
      relatorio += `🔄 Replicabilidade: ${item.detalhes.replicabilidade.facilidade}\n\n`;
      
      relatorio += `📋 Classificação:\n`;
      relatorio += `   Oferta: ${item.classificacao.oferta}\n`;
      relatorio += `   Ângulo: ${item.classificacao.angulo}\n`;
      relatorio += `   Gancho: ${item.classificacao.gancho}\n`;
      relatorio += `   Formato: ${item.classificacao.formato}\n`;
      if (item.classificacao.preco) {
        relatorio += `   Preço: R$${item.classificacao.preco}\n`;
      }
      
      relatorio += `\n💡 Sugestão: ${item.analise}\n`;
    });

    relatorio += '\n============================================\n';
    relatorio += '             ESTATÍSTICAS\n';
    relatorio += '============================================\n\n';

    const mediaNotas = Math.round(processados.reduce((a, b) => a + b.notaFinal, 0) / processados.length);
    relatorio += `Nota média: ${mediaNotas}/100\n`;
    
    const contagemOfertas = {};
    processados.forEach(p => {
      contagemOfertas[p.classificacao.oferta] = (contagemOfertas[p.classificacao.oferta] || 0) + 1;
    });
    relatorio += `\nTipos de oferta:\n`;
    Object.entries(contagemOfertas).forEach(([tipo, count]) => {
      relatorio += `  ${tipo}: ${count}\n`;
    });

    const contagemAngulos = {};
    processados.forEach(p => {
      contagemAngulos[p.classificacao.angulo] = (contagemAngulos[p.classificacao.angulo] || 0) + 1;
    });
    relatorio += `\nÂngulos mais usados:\n`;
    Object.entries(contagemAngulos).forEach(([angulo, count]) => {
      relatorio += `  ${angulo}: ${count}\n`;
    });

    return relatorio;
  }

  /**
   * Salva o relatório em arquivo
   */
  salvarRelatorio(conteudo) {
    const timestamp = Date.now();
    const nomeArquivo = `relatorio-ofertas-${timestamp}.txt`;
    const caminho = path.join(this.pastaRelatorios, nomeArquivo);
    
    fs.writeFileSync(caminho, conteudo);
    console.log(`\nRelatório salvo: ${caminho}`);
    return caminho;
  }

  /**
   * Salva dados processados em JSON
   */
  salvarDadosProcessados(processados) {
    const timestamp = Date.now();
    const nomeArquivo = `processados-${timestamp}.json`;
    const caminho = path.join(this.pastaRelatorios, nomeArquivo);
    
    fs.writeFileSync(caminho, JSON.stringify(processados, null, 2));
    return caminho;
  }

  /**
   * Executa geração do relatório
   */
  executar() {
    console.log('\n=== RELATÓRIO DE OFERTAS VENCEDORAS ===\n');

    const anuncios = this.carregarAnuncios();
    
    if (anuncios.length === 0) {
      return;
    }

    const processados = this.processarAnuncios(anuncios);
    const relatorio = this.gerarRelatorio(processados);
    
    console.log(relatorio);
    
    this.salvarRelatorio(relatorio);
    this.salvarDadosProcessados(processados);

    console.log('\nPróximos passos:');
    console.log('1. Revise o relatório em data/relatorios/');
    console.log('2. Copie as melhores ofertas');
    console.log('3. Adapte para seus anúncios');
    console.log('4. Execute: node workflow.js');
  }
}

const relatorio = new RelatorioOfertas();
relatorio.executar();

module.exports = RelatorioOfertas;
