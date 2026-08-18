/**
 * Facebook Marketplace - Gerador de Anúncios
 * 
 * Uso: node criar-anuncio.js
 * 
 * Ferramenta interativa para gerar anúncios otimizados
 * e abrir o Facebook Marketplace com dados pré-preenchidos.
 */

const AdGenerator = require('./ad-generator');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const generator = new AdGenerator();

// Perguntas interativas
const questions = [
  {
    name: 'category',
    question: '📦 Categoria do produto:\n  1 - Eletrônicos\n  2 - Veículos\n  3 - Móveis\n  4 - Imóveis\n  5 - Outro\n  → Opção: ',
    options: ['1', '2', '3', '4', '5'],
    default: '1'
  },
  {
    name: 'name',
    question: '📝 Nome/descrição curta do produto: ',
    required: true
  },
  {
    name: 'brand',
    question: '🏷️ Marca (opcional): ',
    required: false
  },
  {
    name: 'model',
    question: '📋 Modelo (opcional): ',
    required: false
  },
  {
    name: 'year',
    question: '📅 Ano (se aplicável): ',
    required: false
  },
  {
    name: 'condition',
    question: '✨ Condição:\n  1 - Novo na caixa\n  2 - Semi-novo\n  3 - Usado - Como novo\n  4 - Usado - Bom estado\n  5 - Com defeito\n  → Opção: ',
    options: ['1', '2', '3', '4', '5'],
    default: '2'
  },
  {
    name: 'price',
    question: '💰 Preço (R$): ',
    required: true,
    type: 'number'
  },
  {
    name: 'location',
    question: '📍 Localização (ex: São Paulo, SP): ',
    required: true
  },
  {
    name: 'features',
    question: '⭐ Características (separadas por vírgula): ',
    required: false
  },
  {
    name: 'urgent',
    question: '🔥 Anúncio urgente? (s/n): ',
    options: ['s', 'n'],
    default: 'n'
  }
];

// Mapear categorias
const categoryMap = {
  '1': 'electronics',
  '2': 'vehicles',
  '3': 'furniture',
  '4': 'realEstate',
  '5': 'other'
};

// Mapear condições
const conditionMap = {
  '1': 'Novo na caixa',
  '2': 'Semi-novo',
  '3': 'Usado - Como novo',
  '4': 'Usado - Bom estado',
  '5': 'Com defeito'
};

async function askQuestion(q, index = 0) {
  return new Promise((resolve) => {
    const defaultVal = q.default || '';
    
    rl.question(q.question, (answer) => {
      // Usar valor padrão se vazio
      if (!answer && defaultVal) {
        resolve(defaultVal);
        return;
      }
      
      // Validar opções
      if (q.options && !q.options.includes(answer)) {
        console.log('❌ Opção inválida. Tente novamente.');
        askQuestion(q, index).then(resolve);
        return;
      }
      
      // Validar obrigatório
      if (q.required && !answer) {
        console.log('❌ Este campo é obrigatório. Tente novamente.');
        askQuestion(q, index).then(resolve);
        return;
      }
      
      resolve(answer || defaultVal);
    });
  });
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 FACEBOOK MARKETPLACE - GERADOR DE ANÚNCIOS');
  console.log('='.repeat(60));
  console.log('\n📋 Vamos criar seu anúncio otimizado!\n');
  
  const answers = {};
  
  // Coletar respostas
  for (const q of questions) {
    const answer = await askQuestion(q);
    answers[q.name] = answer;
  }
  
  // Processar respostas
  const productData = {
    name: answers.name,
    brand: answers.brand || undefined,
    model: answers.model || undefined,
    year: answers.year || undefined,
    condition: conditionMap[answers.condition] || 'Semi-novo',
    price: parseFloat(answers.price) || 0,
    location: answers.location,
    category: categoryMap[answers.category] || 'electronics',
    features: answers.features ? answers.features.split(',').map(f => f.trim()) : [],
    urgent: answers.urgent === 's',
    searchTerm: answers.name
  };
  
  console.log('\n⏳ Gerando anúncio...\n');
  
  try {
    // Gerar anúncio
    const result = await generator.createAndPublish(productData);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ANÚNCIO CRIADO COM SUCESSO!');
    console.log('='.repeat(60));
    
    console.log('\n📝 RESUMO DO ANÚNCIO:');
    console.log('─'.repeat(60));
    console.log(`TÍTULO: ${result.ad.title}`);
    console.log(`PREÇO: R$${result.ad.price}`);
    console.log(`PREÇO SUGERIDO: R$${result.ad.suggestedPrice}`);
    console.log('─'.repeat(60));
    
    console.log('\n📄 DESCRIÇÃO:');
    console.log(result.ad.description);
    console.log('─'.repeat(60));
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    result.instructions.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Erro ao gerar anúncio:', error.message);
  }
  
  rl.close();
}

// Executar
main();
