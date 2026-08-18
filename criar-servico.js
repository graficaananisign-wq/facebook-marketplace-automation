/**
 * Facebook Marketplace - Criador de Anúncios de Serviços
 * 
 * Uso: node criar-servico.js
 * 
 * Cria anúncios profissionais para serviços de criação de sites.
 */

const AdGenerator = require('./ad-generator');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Perguntas para o serviço
const questions = [
  {
    name: 'name',
    question: '📝 Nome do serviço (ex: Criação de Sites Profissionais): ',
    default: 'Criação de Sites Profissionais'
  },
  {
    name: 'price',
    question: '💰 Preço a partir de (R$): ',
    default: '599'
  },
  {
    name: 'deliveryTime',
    question: '⏳ Prazo de entrega (ex: 5-7 dias úteis): ',
    default: 'até 2 dias'
  },
  {
    name: 'website',
    question: '🌐 Seu site (ex: sitefenixdigital.online): ',
    default: 'sitefenixdigital.online'
  },
  {
    name: 'whatsapp',
    question: '📱 WhatsApp para contato (ex: 91981305395): ',
    default: '91981305395'
  }
];

// Itens inclusos no serviço (padrão)
const defaultIncludes = [
  'Site profissional responsivo',
  'Design moderno e elegante',
  'Configuração de domínio e hospedagem',
  'Certificado SSL (HTTPS)',
  'Otimizado para Google (SEO)',
  'Formulário de contato',
  'Redes sociais integradas'
];

// Diferenciais (padrão)
const defaultFeatures = [
  'Portfólio com +50 sites entregues',
  'Suporte pós-entrega por 30 dias',
  '100% online - Atendimento worldwide',
  'Pagamento facilitado',
  'Revisão gratuita'
];

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🌐 FACEBOOK MARKETPLACE - CRIADOR DE ANÚNCIOS DE SERVIÇOS');
  console.log('='.repeat(60));
  console.log('\n📋 Vamos criar seu anúncio de serviço!\n');
  
  const answers = {};
  
  // Coletar respostas
  for (const q of questions) {
    const answer = await askQuestion(`${q.question} (${q.default}): `);
    answers[q.name] = answer || q.default;
  }
  
  // Perguntar sobre itens inclusos
  console.log('\n📦 Itens inclusos no serviço:');
  console.log('   (Padrão: site responsivo, design, domínio, SSL, SEO, formulário, redes sociais)');
  const customIncludes = await askQuestion('   Adicionar mais itens? (separados por vírgula, ou Enter para usar padrão): ');
  
  const includes = customIncludes 
    ? customIncludes.split(',').map(i => i.trim())
    : defaultIncludes;
  
  // Perguntar sobre diferenciais
  console.log('\n🎯 Seus diferenciais:');
  console.log('   (Padrão: portfólio, suporte, 100% online, pagamento facilitado, revisão)');
  const customFeatures = await askQuestion('   Adicionar mais diferenciais? (separados por vírgula, ou Enter para usar padrão): ');
  
  const features = customFeatures 
    ? customFeatures.split(',').map(f => f.trim())
    : defaultFeatures;
  
  // Criar generator com WhatsApp
  const generator = new AdGenerator({
    whatsapp: answers.whatsapp
  });
  
  // Dados do serviço
  const serviceData = {
    name: answers.name,
    category: 'services',
    price: answers.price,
    deliveryTime: answers.deliveryTime,
    website: answers.website,
    whatsapp: answers.whatsapp,
    includes: includes,
    features: features
  };
  
  console.log('\n⏳ Gerando anúncio...\n');
  
  try {
    // Gerar anúncio
    const title = generator.generateTitle(serviceData);
    const description = generator.generateDescription(serviceData);
    
    // Mostrar resultado
    console.log('='.repeat(60));
    console.log('✅ ANÚNCIO GERADO COM SUCESSO!');
    console.log('='.repeat(60));
    
    console.log('\n📝 TÍTULO:');
    console.log(title);
    
    console.log('\n📄 DESCRIÇÃO:');
    console.log(description);
    
    console.log('\n' + '='.repeat(60));
    
    // Salvar em arquivo
    const fs = require('fs');
    const timestamp = Date.now();
    const filename = `anuncio-servico-${timestamp}.txt`;
    
    const content = `TÍTULO:\n${title}\n\nDESCRIÇÃO:\n${description}`;
    fs.writeFileSync(filename, content);
    
    console.log(`\n💾 Salvo em: ${filename}`);
    
    // Perguntar se quer abrir o Marketplace
    const openMarketplace = await askQuestion('\n🚀 Abrir Facebook Marketplace? (s/n): ');
    
    if (openMarketplace.toLowerCase() === 's') {
      console.log('\nAbrindo Facebook Marketplace...');
      
      const { exec } = require('child_process');
      exec('start https://www.facebook.com/marketplace/create');
      
      console.log('\n✅ Marketplace aberto!');
      console.log('\n📋 INSTRUÇÕES:');
      console.log('   1. Cole o TÍTULO no campo apropriado');
      console.log('   2. Cole a DESCRIÇÃO no campo descrição');
      console.log(`   3. Defina o preço: R$${answers.price}`);
      console.log('   4. Adicione fotos do seu portfólio');
      console.log('   5. Publique!');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 PRONTO! Seu anúncio está pronto para publicar!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Erro ao gerar anúncio:', error.message);
  }
  
  rl.close();
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };
