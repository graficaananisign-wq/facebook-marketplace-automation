/**
 * Facebook Marketplace - Workflow Semi-Automatizado
 * 
 * Uso: node workflow.js
 * 
 * Gera vários anúncios de uma vez e facilita a publicação.
 */

const AdGenerator = require('./ad-generator');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Carregar configuração
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config-servicos.json'), 'utf8'));

// Criar generator
const generator = new AdGenerator({
  whatsapp: config.empresa.whatsapp
});

// Criar pasta de anúncios
const anunciosDir = path.join(__dirname, 'anuncios');
if (!fs.existsSync(anunciosDir)) {
  fs.mkdirSync(anunciosDir);
}

// ============================================
// FUNÇÕES
// ============================================

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateVariation(servico, variationIndex) {
  const { titulos, urgencia } = config.variacoes;
  
  // Criar dados do serviço
  const serviceData = {
    name: servico.nome,
    category: 'services',
    price: servico.preco,
    deliveryTime: servico.prazo,
    website: config.empresa.site,
    whatsapp: config.empresa.whatsapp,
    includes: servico.inclui,
    features: servico.diferenciais
  };
  
  // Gerar título com variação
  let title = getRandomItem(titulos)
    .replace('{servico}', servico.nome)
    .replace('{preco}', servico.preco)
    .replace('{prazo}', servico.prazo);
  
  // Adicionar urgência (50% de chance)
  if (Math.random() > 0.5) {
    title = getRandomItem(urgencia) + ' ' + title;
  }
  
  // Limitar a 100 caracteres
  if (title.length > 100) {
    title = title.substring(0, 97) + '...';
  }
  
  // Gerar descrição
  const description = generator.generateDescription(serviceData);
  
  return {
    id: `${servico.id}-${variationIndex + 1}`,
    title,
    description,
    price: servico.preco,
    service: servico.nome
  };
}

function saveAd(ad, index) {
  const filename = path.join(anunciosDir, `anuncio-${index + 1}.txt`);
  const content = `TÍTULO:\n${ad.title}\n\nDESCRIÇÃO:\n${ad.description}\n\nPREÇO: R$${ad.price}`;
  fs.writeFileSync(filename, content);
  return filename;
}

function copyToClipboard(text) {
  // Usar PowerShell para copiar para área de transferência
  const command = `powershell -Command "${text.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" | Set-Clipboard`;
  exec(command);
}

// ============================================
// WORKFLOW PRINCIPAL
// ============================================

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 WORKFLOW SEMI-AUTOMATIZADO - FACEBOOK MARKETPLACE');
  console.log('='.repeat(60));
  console.log(`\n🌐 Empresa: ${config.empresa.nome}`);
  console.log(`📱 WhatsApp: ${config.empresa.whatsapp}`);
  console.log(`🔗 Site: ${config.empresa.site}\n`);
  
  // Perguntar quantos anúncios criar
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const count = await new Promise((resolve) => {
    rl.question(' Quantos anúncios deseja criar? (padrão: 5): ', (answer) => {
      resolve(parseInt(answer) || 5);
    });
  });
  
  console.log(`\n📦 Gerando ${count} anúncios...\n`);
  
  // Gerar anúncios
  const ads = [];
  const services = config.servicos;
  
  for (let i = 0; i < count; i++) {
    const servico = services[i % services.length];
    const ad = generateVariation(servico, Math.floor(i / services.length));
    const filename = saveAd(ad, i);
    ads.push({ ...ad, filename });
    
    console.log(`✅ Anúncio ${i + 1}/${count}: ${ad.service}`);
    console.log(`   📁 Salvo em: ${filename}`);
  }
  
  // Criar script de publicação
  const scriptContent = ads.map((ad, i) => {
    return `
# Anúncio ${i + 1}: ${ad.service}
# Título: ${ad.title}
# Arquivo: ${ad.filename}
# 
# INSTRUÇÕES:
# 1. Abra: https://www.facebook.com/marketplace/create
# 2. Cole o título: ${ad.title}
# 3. Abra o arquivo: ${ad.filename}
# 4. Copie a descrição
# 5. Cole no Facebook
# 6. Adicione preço: R$${ad.price}
# 7. Adicione fotos
# 8. Publique!
`;
  }).join('\n');
  
  fs.writeFileSync(path.join(__dirname, 'publicar-anuncios.txt'), scriptContent);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ TODOS OS ANÚNCIOS GERADOS!');
  console.log('='.repeat(60));
  
  console.log('\n📁 Arquivos criados:');
  ads.forEach((ad, i) => {
    console.log(`   ${i + 1}. ${ad.filename}`);
  });
  
  console.log('\n📋 Script de publicação: publicar-anuncios.txt');
  
  // Perguntar se quer abrir o primeiro anúncio
  const openFirst = await new Promise((resolve) => {
    rl.question('\n🚀 Abrir Chrome para publicar o primeiro anúncio? (s/n): ', (answer) => {
      resolve(answer.toLowerCase() === 's');
    });
  });
  
  if (openFirst) {
    // Copiar primeiro anúncio para clipboard
    const firstAd = ads[0];
    console.log('\n📋 Copiando primeiro anúncio para área de transferência...');
    
    // Copiar título
    exec(`echo "${firstAd.title}" | Set-Clipboard`);
    
    console.log(`\n✅ Título copiado: ${firstAd.title}`);
    console.log('\n🌐 Abrindo Chrome no Facebook Marketplace...');
    
    // Abrir Chrome
    exec('start chrome https://www.facebook.com/marketplace/create');
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 INSTRUÇÕES:');
    console.log('='.repeat(60));
    console.log('\n1. Cole o TÍTULO: Ctrl+V');
    console.log(`2. Abra o arquivo: ${firstAd.filename}`);
    console.log('3. Copie a DESCRIÇÃO');
    console.log('4. Cole no Facebook: Ctrl+V');
    console.log(`5. Preço: R$${firstAd.price}`);
    console.log('6. Adicione fotos');
    console.log('7. Publique!');
    console.log('\n8. Execute novamente para o próximo anúncio:');
    console.log('   node workflow.js');
    console.log('='.repeat(60));
  }
  
  rl.close();
}

// Executar
main().catch(console.error);
