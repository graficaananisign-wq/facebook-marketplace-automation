/**
 * Teste com a API atualizada
 */

const MarketplaceAutomation = require('./marketplace-automation');

async function testeCompleto() {
  console.log('🧪 Teste com API atualizada...\n');
  
  const automation = new MarketplaceAutomation();
  
  try {
    // Teste de busca
    console.log('🔍 Testando busca por "iphone" em São Paulo...');
    const items = await automation.scrape([], {
      searchKeyword: 'iphone',
      location: 'São Paulo, Brazil',
      getListingDetails: true
    });
    
    console.log(`\n✅ SUCESSO! ${items.length} itens encontrados\n`);
    
    if (items.length > 0) {
      console.log('📦 Primeiros 3 resultados:\n');
      
      items.slice(0, 3).forEach((item, i) => {
        const titulo = item.marketplace_listing_title || item.custom_title || 'Sem título';
        const preco = item.listing_price?.formatted_amount_zeros_stripped || item.listing_price?.formatted_amount || 'N/A';
        const local = item.location_text?.text || 'N/A';
        const vendedor = item.marketplace_listing_seller?.name || 'N/A';
        
        console.log(`${i + 1}. ${titulo}`);
        console.log(`   💰 ${preco}`);
        console.log(`   📍 ${local}`);
        console.log(`   👤 ${vendedor}`);
        console.log('');
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return false;
  }
}

testeCompleto();
