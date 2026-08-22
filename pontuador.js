/**
 * Pontuador de Anúncios
 * 
 * Calcula a nota de viabilidade de cada anúncio (0-100)
 * baseado em:
 * - Tempo rodando (40%)
 * - Impressões/engajamento (30%)
 * - Qualidade do criativo (20%)
 * - Potencial de replicação (10%)
 */

const Classificador = require('./classificador');

class Pontuador {
  constructor(config = {}) {
    this.classificador = new Classificador();
    
    this.pesos = config.pesos || {
      tempo: 40,
      impressoes: 30,
      criativo: 20,
      replicabilidade: 10
    };
  }

  calcular(ad) {
    const classificacao = this.classificador.classificar(ad);
    
    const tempo = this.pontuarTempo(ad);
    const impressoes = this.pontuarImpressoes(ad);
    const criativo = this.pontuarCriativo(ad, classificacao);
    const replicabilidade = this.pontuarReplicabilidade(classificacao);
    
    const notaFinal = Math.round(
      (tempo.nota * this.pesos.tempo +
       impressoes.nota * this.pesos.impressoes +
       criativo.nota * this.pesos.criativo +
       replicabilidade.nota * this.pesos.replicabilidade) / 100
    );

    return {
      notaFinal: Math.min(100, Math.max(0, notaFinal)),
      detalhes: {
        tempo,
        impressoes,
        criativo,
        replicabilidade
      },
      classificacao,
      analise: this.gerarAnalise(notaFinal, tempo, impressoes, criativo)
    };
  }

  pontuarTempo(ad) {
    let diasAtivos = 0;
    
    if (ad.first_seen && ad.last_seen) {
      const primeiroVisto = new Date(ad.first_seen * 1000);
      const ultimoVisto = new Date(ad.last_seen * 1000);
      diasAtivos = Math.floor((ultimoVisto - primeiroVisto) / (1000 * 60 * 60 * 24));
    } else if (ad.created_at) {
      const criadoEm = new Date(ad.created_at * 1000);
      const agora = new Date();
      diasAtivos = Math.floor((agora - criadoEm) / (1000 * 60 * 60 * 24));
    }

    const nota = Math.min(100, (diasAtivos / 180) * 100);
    
    let classificacao = '';
    if (diasAtivos >= 180) classificacao = 'VENCEDOR COMPROVADO';
    else if (diasAtivos >= 90) classificacao = 'MUITO BOM';
    else if (diasAtivos >= 60) classificacao = 'BOM';
    else if (diasAtivos >= 30) classificacao = 'RAZOAVEL';
    else classificacao = 'NOVO';

    return {
      nota: Math.round(nota),
      diasAtivos,
      classificacao
    };
  }

  pontuarImpressoes(ad) {
    let impressoes = 0;
    
    if (ad.impression) {
      impressoes = this.parseImpressoes(ad.impression);
    } else if (ad.view_count) {
      impressoes = ad.view_count;
    } else if (ad.like_count) {
      impressoes = ad.like_count * 100;
    }

    const nota = Math.min(100, (impressoes / 1000000) * 100);
    
    let faixa = '';
    if (impressoes >= 1000000) faixa = 'ALTA';
    else if (impressoes >= 100000) faixa = 'MEDIA';
    else if (impressoes >= 10000) faixa = 'BAIXA';
    else faixa = 'MUITO_BAIXA';

    return {
      nota: Math.round(nota),
      impressoes,
      faixa
    };
  }

  parseImpressoes(str) {
    if (typeof str === 'number') return str;
    
    const strLower = str.toLowerCase();
    
    if (strLower.includes('m') || strLower.includes('milhão')) {
      const num = parseFloat(str.replace(/[^0-9.,]/g, ''));
      return num * 1000000;
    }
    if (strLower.includes('k') || strLower.includes('mil')) {
      const num = parseFloat(str.replace(/[^0-9.,]/g, ''));
      return num * 1000;
    }
    
    return parseInt(str.replace(/[^0-9]/g, '')) || 0;
  }

  pontuarCriativo(ad, classificacao) {
    let nota = 50;
    
    if (classificacao.preco) nota += 15;
    if (classificacao.tentativas.length > 1) nota += 10;
    if (classificacao.formato === 'video') nota += 15;
    else if (classificacao.formato === 'imagem') nota += 10;
    
    if (classificacao.gancho === 'emoji') nota += 5;
    if (classificacao.gancho === 'cta') nota += 5;
    
    const temEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(ad.title || '');
    if (temEmoji) nota += 5;

    return {
      nota: Math.min(100, nota),
      fatores: {
        temPreco: !!classificacao.preco,
        multiplosPrecos: classificacao.tentativas.length > 1,
        formato: classificacao.formato,
        gancho: classificacao.gancho
      }
    };
  }

  pontuarReplicabilidade(classificacao) {
    let nota = 70;
    
    if (classificacao.oferta === 'servico') nota += 15;
    if (classificacao.angulo === 'preco') nota += 10;
    if (classificacao.formato === 'texto') nota += 5;
    
    return {
      nota: Math.min(100, nota),
      facilidade: nota >= 80 ? 'FACIL' : nota >= 60 ? 'MEDIO' : 'DIFICIL'
    };
  }

  gerarAnalise(notaFinal, tempo, impressoes, criativo) {
    if (notaFinal >= 85) {
      return 'EXCELENTE - Oferta vencedora comprovada. Recomendo testar imediatamente.';
    }
    if (notaFinal >= 70) {
      return 'BOM - Oferta com potencial. Vale a pena analisar e adaptar.';
    }
    if (notaFinal >= 50) {
      return 'RAZOAVEL - Oferta mediana. Considerar apenas se uniqueness.';
    }
    return 'FRACO - Oferta com baixo potencial. Não recomendado.';
  }

  gerarResumo(pontuacao) {
    return `
PONTUACAO: ${pontuacao.notaFinal}/100
${pontuacao.analise}

DETALHES:
- Tempo: ${pontuacao.detalhes.tempo.nota}/100 (${pontuacao.detalhes.tempo.diasAtivos} dias - ${pontuacao.detalhes.tempo.classificacao})
- Impressoes: ${pontuacao.detalhes.impressoes.nota}/100 (${pontuacao.detalhes.impressoes.faixa})
- Criativo: ${pontuacao.detalhes.criativo.nota}/100
- Replicabilidade: ${pontuacao.detalhes.replicabilidade.nota}/100 (${pontuacao.detalhes.replicabilidade.facilidade})
    `.trim();
  }
}

module.exports = Pontuador;
