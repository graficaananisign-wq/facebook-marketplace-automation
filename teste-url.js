/**
 * Teste com URL correta
 */

const { ApifyClient } = require('apify-client');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json'));
const client = new ApifyClient({ token: config.token });

async function testeCompleto() {
  console.log('🧪 Teste completo com URL válida...\n');
  
  try {
    const input = {
      startUrls: [
        { url: 'https://www.facebook.com/marketplace/saopaulo/category/electronics' }
      ],
      resultsLimit: 10
    };

    console.log('🔍 Buscando eletrônicos em São Paulo...');
    const run = await client.actor(config.actor).call(input);
    
    console.log(`✅ Run concluído: ${run.id}`);
    
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    console.log(`\n📦 ${items.length} itens encontrados:\n`);
    
    items.slice(0, 3).forEach((item, i) => {
      console.log(`${i + 1}. ${item.title || item.marketplace_listing_title || 'Sem título'}`);
      console.log(`   💰 ${item.price || item.listing_price || 'N/A'}`);
      console.log(`   📍 ${item.location || 'N/A'}`);
      console.log('');
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return false;
  }
}

testeCompleto();
