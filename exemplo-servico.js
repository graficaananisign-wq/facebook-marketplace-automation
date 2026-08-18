/**
 * Exemplo de uso do gerador de anúncios para SERVIÇOS
 * 
 * Execute: node exemplo-servico.js
 * 
 * Site: https://sitefenixdigital.online
 */

const AdGenerator = require('./ad-generator');

// Criar generator com WhatsApp
const generator = new AdGenerator({
  whatsapp: '91981305395'
});

// ============================================
// EXEMPLO 1: Criação de Sites Profissionais
// ============================================
const servicoSite = {
  name: 'Criação de Sites Profissionais',
  category: 'services',
  price: '599',
  deliveryTime: 'até 2 dias',
  website: 'sitefenixdigital.online',
  whatsapp: '91981305395',
  includes: [
    'Site profissional responsivo',
    'Design moderno e elegante',
    'Configuração de domínio e hospedagem',
    'Certificado SSL (HTTPS)',
    'Otimizado para Google (SEO)',
    'Formulário de contato',
    'Redes sociais integradas'
  ],
  features: [
    'Portfólio com +50 sites entregues',
    'Suporte pós-entrega por 30 dias',
    '100% online - Atendimento worldwide',
    'Pagamento facilitado',
    'Revisão gratuita'
  ]
};

// ============================================
// EXEMPLO 2: Landing Page
// ============================================
const servicoLanding = {
  name: 'Landing Page de Alta Conversão',
  category: 'services',
  price: '399',
  deliveryTime: 'até 2 dias',
  website: 'sitefenixdigital.online',
  whatsapp: '91981305395',
  includes: [
    'Landing page otimizada para conversão',
    'Design persuasivo',
    'Formulário de captura de leads',
    'Integração com WhatsApp',
    'Google Analytics configurado',
    'A/B testing pronto',
    'Velocidade otimizada'
  ],
  features: [
    'Especialista em conversão',
    'Cases de sucesso comprovados',
    'Suporte via WhatsApp',
    'Garantia de resultado',
    'Atualização gratuita por 15 dias'
  ]
};

// ============================================
// EXEMPLO 3: Loja Virtual
// ============================================
const servicoLoja = {
  name: 'Loja Virtual Completa',
  category: 'services',
  price: '1299',
  deliveryTime: 'até 2 dias',
  website: 'sitefenixdigital.online',
  whatsapp: '91981305395',
  includes: [
    'Loja virtual com até 100 produtos',
    'Sistema de pagamento integrado',
    'Cálculo de frete automático',
    'Painel administrativo completo',
    'Certificado SSL (HTTPS)',
    'Layout responsivo',
    'Integração com redes sociais'
  ],
  features: [
    'Especialista em e-commerce',
    'Integração com gateways de pagamento',
    'Suporte técnico por 60 dias',
    'Treinamento incluído',
    'Relatórios de vendas'
  ]
};

// ============================================
// GERAR ANÚNCIOS
// ============================================
console.log('\n' + '='.repeat(60));
console.log('🌐 EXEMPLOS DE ANÚNCIOS - SERVIÇOS DE CRIAÇÃO DE SITES');
console.log('   Site: https://sitefenixdigital.online');
console.log('='.repeat(60));

// Exemplo 1
console.log('\n\n' + '-'.repeat(60));
console.log('📝 EXEMPLO 1: Site Profissional');
console.log('-'.repeat(60));
const title1 = generator.generateTitle(servicoSite);
const desc1 = generator.generateDescription(servicoSite);
console.log('\nTÍTULO:', title1);
console.log('\nDESCRIÇÃO:\n', desc1);

// Exemplo 2
console.log('\n\n' + '-'.repeat(60));
console.log('📝 EXEMPLO 2: Landing Page');
console.log('-'.repeat(60));
const title2 = generator.generateTitle(servicoLanding);
const desc2 = generator.generateDescription(servicoLanding);
console.log('\nTÍTULO:', title2);
console.log('\nDESCRIÇÃO:\n', desc2);

// Exemplo 3
console.log('\n\n' + '-'.repeat(60));
console.log('📝 EXEMPLO 3: Loja Virtual');
console.log('-'.repeat(60));
const title3 = generator.generateTitle(servicoLoja);
const desc3 = generator.generateDescription(servicoLoja);
console.log('\nTÍTULO:', title3);
console.log('\nDESCRIÇÃO:\n', desc3);

console.log('\n\n' + '='.repeat(60));
console.log('✅ TODOS OS EXEMPLOS GERADOS!');
console.log('='.repeat(60));
console.log('\n🚀 Para criar seu próprio anúncio, execute:');
console.log('   node criar-servico.js');
console.log('\n🌐 Visite: https://sitefenixdigital.online');
console.log('='.repeat(60));
