/**
 * Exemplo rápido de uso do gerador de anúncios
 * 
 * Execute: node exemplo-anuncio.js
 */

const AdGenerator = require('./ad-generator');

// Criar generator com WhatsApp (adicione seu número)
const generator = new AdGenerator({
  whatsapp: '91981305395' // Seu número com DDD
});

// Exemplo 1: iPhone
const iphone = {
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

// Exemplo 2: Carro
const carro = {
  name: 'Honda Civic 2022',
  brand: 'Honda',
  model: 'Civic Touring',
  year: '2022',
  condition: 'Semi-novo',
  price: 135000,
  location: 'Rio de Janeiro, RJ',
  category: 'vehicles',
  mileage: '25.000 km',
  transmission: 'CVT',
  fuel: 'Flex',
  color: 'Prata',
  features: [
    'IPVA 2024 pago',
    'Revisões em dia pela concessionária',
    'Documentação ok',
    'Aceito financiamento'
  ],
  trade: 'Sim, com complemento',
  searchTerm: 'Honda Civic 2022'
};

// Exemplo 3: Sofá
const sofa = {
  name: 'Sofá 3 lugares',
  condition: 'Semi-novo',
  price: 800,
  location: 'Campinas, SP',
  category: 'furniture',
  dimensions: '2,20m x 0,90m x 0,80m',
  color: 'Cinza',
  material: 'Tecido',
  features: [
    'Semi-novo',
    'Sem manchas',
    'Muito confortável'
  ],
  delivery: 'Retirada no local',
  searchTerm: 'Sofá 3 lugares'
};

async function runExamples() {
  console.log('\n🎯 EXEMPLOS DE ANÚNCIOS\n');
  
  // Gerar exemplo do iPhone
  console.log('\n📱 EXEMPLO 1: iPhone');
  console.log('─'.repeat(50));
  const ad1 = await generator.generateAd(iphone);
  
  console.log('\n\n🚗 EXEMPLO 2: Carro');
  console.log('─'.repeat(50));
  const ad2 = await generator.generateAd(carro);
  
  console.log('\n\n🪑 EXEMPLO 3: Sofá');
  console.log('─'.repeat(50));
  const ad3 = await generator.generateAd(sofa);
  
  console.log('\n\n✅ Todos os exemplos gerados!');
  console.log('📁 Arquivos salvos na pasta data/');
}

runExamples();
