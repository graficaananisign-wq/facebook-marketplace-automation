/**
 * Classificador de Anúncios
 * 
 * Classifica cada anúncio minerado em:
 * - Tipo de oferta (serviço/produto/promoção)
 * - Ângulo (preço/qualidade/urgência/prova social)
 * - Gancho (primeira linha/CTA/emoji)
 * - Formato (texto/imagem/vídeo)
 */

class Classificador {
  constructor() {
    // Palavras-chave para classificação
    this.palavrasChave = {
      oferta: {
        servico: ['criação', 'desenvolvimento', 'criar', 'fazer', 'montar', 'configurar', 'landing page', 'site', 'web'],
        produto: ['vendo', 'produto', 'caixa', 'novo', 'usado', 'semi-novo', 'frete'],
        promocao: ['promoção', 'desconto', 'oferta', 'imperdível', 'limitado', 'especial', 'abaixo']
      },
      angulo: {
        preco: ['preço', 'valor', 'R$', 'barato', 'acessível', 'parcela', 'desconto', 'promoção'],
        qualidade: ['profissional', 'qualidade', 'premium', 'excelente', 'melhor', 'top', 'especialista'],
        urgencia: ['urgente', 'última', 'poucas', 'rápido', 'agora', 'hoje', 'limitado', 'expira'],
        prova_social: ['clientes', 'avaliação', 'recomendação', 'depoimento', 'satisfeito', 'experiência']
      },
      gancho: {
        primeira_linha: ['🔥', '⚡', '🎯', '💡', '✅', '🚀', '📱', '🌐', '💼', '⭐'],
        cta: ['chame', 'me chame', 'interessado', 'clique', 'acesse', 'saiba mais', 'garanta'],
        emoji: ['😊', '💪', '🏆', '📈', '💰', '🎯', '✨', '📸', '🎥', '🔗']
      }
    };

    // Padrões para detectar preço
    this.padroesPreco = [
      /R\$\s*(\d+[\.,]?\d*)/gi,
      /por\s*(?:apenas|apenas|somente)?\s*R?\$?\s*(\d+[\.,]?\d*)/gi,
      /(\d+[\.,]?\d*)\s*reais/gi,
      /parcela.*?(\d+[\.,]?\d*)/gi
    ];
  }

  /**
   * Classifica um anúncio
   * @param {Object} ad - Anúncio da Parse API
   * @returns {Object} - Classificação completa
   */
  classificar(ad) {
    const texto = `${ad.title || ''} ${ad.body || ''}`.toLowerCase();
    
    return {
      oferta: this.classificarOferta(texto),
      angulo: this.classificarAngulo(texto),
      gancho: this.classificarGancho(ad),
      formato: this.classificarFormato(ad),
      preco: this.extrairPreco(texto),
      tentativas: this.extrairTentativasPreco(texto)
    };
  }

  /**
   * Classifica o tipo de oferta
   */
  classificarOferta(texto) {
    const contagem = {
      servico: 0,
      produto: 0,
      promocao: 0
    };

    for (const [tipo, palavras] of Object.entries(this.palavrasChave.oferta)) {
      for (const palavra of palavras) {
        if (texto.includes(palavra.toLowerCase())) {
          contagem[tipo]++;
        }
      }
    }

    // Retornar o tipo com maior contagem
    const maxTipo = Object.entries(contagem).reduce((a, b) => a[1] > b[1] ? a : b);
    return maxTipo[1] > 0 ? maxTipo[0] : 'desconhecido';
  }

  /**
   * Classifica o ângulo do anúncio
   */
  classificarAngulo(texto) {
    const contagem = {
      preco: 0,
      qualidade: 0,
      urgencia: 0,
      prova_social: 0
    };

    for (const [angulo, palavras] of Object.entries(this.palavrasChave.angulo)) {
      for (const palavra of palavras) {
        if (texto.includes(palavra.toLowerCase())) {
          contagem[angulo]++;
        }
      }
    }

    const maxAngulo = Object.entries(contagem).reduce((a, b) => a[1] > b[1] ? a : b);
    return maxAngulo[1] > 0 ? maxAngulo[0] : 'desconhecido';
  }

  /**
   * Classifica o gancho do anúncio
   */
  classificarGancho(ad) {
    const primeiraLinha = (ad.title || '').split('\n')[0];
    const texto = `${primeiraLinha} ${ad.body || ''}`.toLowerCase();

    // Verificar emojis
    const temEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(primeiraLinha);
    
    // Verificar CTA
    const temCTA = this.palavrasChave.gancho.cta.some(p => texto.includes(p.toLowerCase()));

    if (temEmoji) return 'emoji';
    if (temCTA) return 'cta';
    return 'primeira_linha';
  }

  /**
   * Classifica o formato do anúncio
   */
  classificarFormato(ad) {
    // Parse API pode retornar informações de mídia
    if (ad.media_type === 'VIDEO' || ad.video_url) return 'video';
    if (ad.image_url || ad.media_type === 'IMAGE') return 'imagem';
    return 'texto';
  }

  /**
   * Extrai o preço do anúncio
   */
  extrairPreco(texto) {
    for (const padrao of this.padroesPreco) {
      const match = texto.match(padrao);
      if (match && match[1]) {
        const preco = parseFloat(match[1].replace(',', '.'));
        if (preco > 0 && preco < 100000) {
          return preco;
        }
      }
    }
    return null;
  }

  /**
   * Extrai todas as tentativas de preço mencionadas
   */
  extrairTentativasPreco(texto) {
    const tentativas = [];
    
    for (const padrao of this.padroesPreco) {
      const matches = texto.matchAll(new RegExp(padrao.source, padrao.flags));
      for (const match of matches) {
        if (match[1]) {
          const preco = parseFloat(match[1].replace(',', '.'));
          if (preco > 0 && preco < 100000) {
            tentativas.push(preco);
          }
        }
      }
    }
    
    return [...new Set(tentativas)]; // Remover duplicatas
  }

  /**
   * Gera resumo da classificação
   */
  gerarResumo(classificacao) {
    return `
📊 CLASSIFICAÇÃO:
• Oferta: ${classificacao.oferta}
• Ângulo: ${classificacao.angulo}
• Gancho: ${classificacao.gancho}
• Formato: ${classificacao.formato}
• Preço: ${classificacao.preco ? `R$${classificacao.preco}` : 'Não informado'}
• Tentativas de preço: ${classificacao.tentativas.length > 0 ? classificacao.tentativas.join(', ') : 'Nenhuma'}
    `.trim();
  }
}

module.exports = Classificador;
