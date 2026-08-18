/**
 * Facebook Marketplace - Publicar Anúncios
 * 
 * Uso: node publicar.js [número do anúncio]
 * 
 * Abre Chrome e copia o anúncio para área de transferência.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Pasta de anúncios
const anunciosDir = path.join(__dirname, 'anuncios');

// ============================================
// FUNÇÕES
// ============================================

function getAdFiles() {
  if (!fs.existsSync(anunciosDir)) {
    return [];
  }
  
  return fs.readdirSync(anunciosDir)
    .filter(f => f.startsWith('anuncio-') && f.endsWith('.txt'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });
}

function readAd(filename) {
  const content = fs.readFileSync(path.join(anunciosDir, filename), 'utf8');
  
  // Extrair título e descrição
  const titleMatch = content.match(/TÍTULO:\n(.+?)(?=\n\n)/s);
  const descMatch = content.match(/DESCRIÇÃO:\n(.+?)(?=\n\nPREÇO:)/s);
  const priceMatch = content.match(/PREÇO: R$(\d+)/);
  
  return {
    title: titleMatch ? titleMatch[1].trim() : '',
    description: descMatch ? descMatch[1].trim() : '',
    price: priceMatch ? priceMatch[1] : ''
  };
}

function copyToClipboard(text) {
  // Usar PowerShell para copiar para área de transferência
  const psCommand = `Set-Clipboard -Value "${text.replace(/"/g, '`"').replace(/\n/g, '`n')}"`;
  exec(`powershell -Command "${psCommand}"`);
}

function openChrome(url) {
  exec(`start chrome "${url}"`);
}

// ============================================
// PUBLICAR
// ============================================

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('📤 PUBLICAR ANÚNCIOS - FACEBOOK MARKETPLACE');
  console.log('='.repeat(60));
  
  // Listar anúncios disponíveis
  const adFiles = getAdFiles();
  
  if (adFiles.length === 0) {
    console.log('\n❌ Nenhum anúncio encontrado!');
    console.log('\n💡 Execute primeiro: node workflow.js');
    process.exit(1);
  }
  
  console.log('\n📁 Anúncios disponíveis:');
  adFiles.forEach((f, i) => {
    const ad = readAd(f);
    console.log(`   ${i + 1}. ${f}`);
    console.log(`      📝 ${ad.title}`);
  });
  
  // Perguntar qual anúncio publicar
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const choice = await new Promise((resolve) => {
    rl.question('\n Qual anúncio deseja publicar? (número): ', (answer) => {
      resolve(parseInt(answer) || 1);
    });
  });
  
  const selectedIndex = choice - 1;
  
  if (selectedIndex < 0 || selectedIndex >= adFiles.length) {
    console.log('\n❌ Opção inválida!');
    rl.close();
    process.exit(1);
  }
  
  const selectedFile = adFiles[selectedIndex];
  const ad = readAd(selectedFile);
  
  console.log('\n📋 Preparando anúncio:');
  console.log(`   📝 ${ad.title}`);
  console.log(`   💰 R$${ad.price}`);
  
  // Copiar título para clipboard
  console.log('\n📋 Copiando TÍTULO para área de transferência...');
  copyToClipboard(ad.title);
  
  console.log('\n✅ TÍTULO COPIADO!');
  console.log('\n🌐 Abrindo Chrome no Facebook Marketplace...');
  
  // Abrir Chrome
  openChrome('https://www.facebook.com/marketplace/create');
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 INSTRUÇÕES:');
  console.log('='.repeat(60));
  console.log('\n1. Cole o TÍTULO: Ctrl+V');
  console.log('\n2. Agora vou copiar a DESCRIÇÃO...');
  
  // Aguardar 2 segundos para o Chrome abrir
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Copiar descrição para clipboard
  console.log('\n📋 Copiando DESCRIÇÃO para área de transferência...');
  copyToClipboard(ad.description);
  
  console.log('\n✅ DESCRIÇÃO COPIADA!');
  console.log('\n3. Cole a DESCRIÇÃO: Ctrl+V');
  console.log(`4. Preço: R$${ad.price}`);
  console.log('5. Adicione fotos');
  console.log('6. Publique!');
  console.log('\n7. Para próximo anúncio, execute:');
  console.log('   node publicar.js');
  console.log('='.repeat(60));
  
  rl.close();
}

// Executar
main().catch(console.error);
