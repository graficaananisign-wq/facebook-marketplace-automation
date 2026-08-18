/**
 * Exemplo: Criar 10 anúncios de uma vez
 * 
 * Execute: node exemplo-lote.js
 */

const AdGenerator = require('./ad-generator');

const generator = new AdGenerator();

async function exemploLote() {
  console.log('\n🎯 EXEMPLO: CRIAR 10 ANÚNCIOS EM LOTE\n');
  
  // Produto base
  const produtoBase = {
    name: 'iPhone 13 Pro Max 256GB',
    brand: 'Apple',
    category: 'electronics',
    price: 4500,
    location: 'São Paulo, SP',
    features: ['Bateria 95%', 'Sem riscos', 'Caixa original']
  };
  
  console.log('📱 Produto base:', produtoBase.name);
  console.log('💰 Preço base: R$', produtoBase.price);
  
  // Gerar 10 variações
  console.log('\n🔄 Gerando 10 variações...');
  const variacoes = generator.generateVariations(produtoBase, 10);
  
  console.log('\n📋 Variações geradas:');
  variacoes.forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.name} - R$${v.price}`);
  });
  
  // Criar anúncios
  console.log('\n🚀 Criando 10 anúncios...');
  const resultados = await generator.createBatch(variacoes);
  
  // Resumo
  console.log('\n✅ RESULTADO:');
  console.log(`   Total: ${resultados.length}`);
  console.log(`   Sucesso: ${resultados.filter(r => r.success).length}`);
  console.log(`   Erros: ${resultados.filter(r => !r.success).length}`);
  
  // Mostrar primeiros 3
  console.log('\n📝 PRIMEIROS 3 ANÚNCIOS:');
  resultados.slice(0, 3).forEach((r, i) => {
    if (r.success) {
      console.log(`\n--- Anúncio ${i + 1} ---`);
      console.log(`Título: ${r.ad.title}`);
      console.log(`Preço: R$${r.ad.price}`);
    }
  });
}

exemploLote().catch(console.error);
