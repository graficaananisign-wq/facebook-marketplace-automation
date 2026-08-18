/**
 * Teste rápido - Verificar se o token e o Actor funcionam
 */

const { ApifyClient } = require('apify-client');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json'));
const client = new ApifyClient({ token: config.token });

async function testeRapido() {
  console.log('🧪 Testando conexão com Apify...\n');
  console.log(`📌 Actor: ${config.actor}`);
  console.log(`🔑 Token: ${config.token.substring(0, 20)}...`);
  
  try {
    // Teste simples com poucos resultados
    const input = {
      startUrls: [{ url: 'https://www.facebook.com/marketplace/saopaulo/search/?query=iphone' }],
      resultsLimit: 5
    };

    console.log('\n🚀 Executando teste...');
    const run = await client.actor(config.actor).call(input);
    
    console.log(`✅ Run ID: ${run.id}`);
    console.log(`📊 Status: ${run.status}`);
    
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    console.log(`\n✅ SUCESSO! ${items.length} itens coletados\n`);
    
    if (items.length > 0) {
      console.log('📦 Primeiro resultado:');
      console.log(JSON.stringify(items[0], null, 2).substring(0, 500));
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.log('\n💡 Token inválido. Verifique em:');
      console.log('   https://console.apify.com/settings/integrations');
    }
    
    if (error.message.includes('not found')) {
      console.log('\n💡 Actor não encontrado. Verifique se o nome está correto:');
      console.log(`   ${config.actor}`);
    }
    
    return false;
  }
}

testeRapido();
