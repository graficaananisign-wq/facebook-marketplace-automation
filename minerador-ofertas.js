#!/usr/bin/env node
// Facebook Ads Library Miner - Facebook Marketplace Automation
// Minera anúncios de criação de sites, landing pages, funis, etc.

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuração do Playwright MCP
const MCP_SCRIPT = String.raw`C:\Users\Neto Farias\AppData\Roaming\npm\node_modules\@playwright\mcp\cli.js`;
const MCP_ARGS = ['--browser=chrome', String.raw`--user-data-dir=C:\Users\Neto Farias\.config\opencode\playwright-profile`, String.raw`--config=C:\Users\Neto Farias\.config\opencode\playwright-mcp-config.json`];

// Palavras-chave para serviços digitais
const KEYWORDS = [
  { keyword: 'criação de sites profissionais', category: 'site', maxPrice: 2000 },
  { keyword: 'landing page profissional', category: 'landing_page', maxPrice: 1500 },
  { keyword: 'desenvolvimento de sites', category: 'site', maxPrice: 3000 },
  { keyword: 'criar site agora', category: 'site', maxPrice: 1000 },
  { keyword: 'site profissional barato', category: 'site', maxPrice: 800 },
  { keyword: 'página de vendas', category: 'landing_page', maxPrice: 1200 },
  { keyword: 'funil de vendas completo', category: 'funil', maxPrice: 2000 },
  { keyword: 'loja virtual pronta', category: 'loja', maxPrice: 3000 },
  { keyword: 'site institucional', category: 'site', maxPrice: 2500 },
  { keyword: 'criação de landing page', category: 'landing_page', maxPrice: 1000 },
];

const MONTHS = { 'jan':0,'fev':1,'mar':2,'abr':3,'mai':4,'jun':5,'jul':6,'ago':7,'set':8,'out':9,'nov':10,'dez':11 };

let msgId = 0, buf = '';
const pending = new Map();

function onData(d) {
  buf += d.toString();
  const lines = buf.split('\n');
  buf = lines.pop() || '';
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const s = line.startsWith('data: ') ? line.slice(6) : line;
      const m = JSON.parse(s);
      if (m.id !== undefined && pending.has(m.id)) {
        pending.get(m.id)(m);
        pending.delete(m.id);
      }
    } catch (e) {}
  }
}

function send(method, params, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const t = setTimeout(() => { pending.delete(id); reject(new Error('Timeout: ' + method)); }, timeout);
    pending.set(id, msg => { clearTimeout(t); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); });
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
}

function tool(name, args = {}) { return send('tools/call', { name, arguments: args }); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseResult(text) {
  const m = text.match(/### Result\n([\s\S]*?)\n### Ran Playwright/);
  if (m) { try { return JSON.parse(m[1]); } catch(e) {} }
  return null;
}

// Função de extração - roda dentro do browser
const EXTRACT_ADS = `() => {
  const ads = [];
  const MONTHS = {jan:0,fev:1,mar:2,abr:3,mai:4,jun:5,jul:6,ago:7,set:8,out:9,nov:10,dez:11};
  
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  const dateNodes = [];
  while (node = walker.nextNode()) {
    if (node.textContent.includes('iniciada em')) {
      dateNodes.push(node);
    }
  }
  
  for (const dateNode of dateNodes) {
    const ad = {};
    
    let card = dateNode.parentElement;
    for (let i = 0; i < 5; i++) {
      if (card.parentElement) card = card.parentElement;
    }
    
    const innerText = card.innerText || '';
    const libMatch = innerText.match(/Identifica[\\s\\S]*?o[\\s\\S]*?biblioteca[\\s\\S]*?:\\s*(\\d+)/);
    if (libMatch) ad.libraryId = libMatch[1];
    
    const imgs = card.querySelectorAll('img[alt]');
    for (const img of imgs) {
      if (img.alt && img.alt.length > 2 && img.alt.length < 60 && 
          !img.alt.includes('API.') && !img.alt.includes('facebook.com')) {
        ad.advertiser = img.alt;
        break;
      }
    }
    
    const links = card.querySelectorAll('a[href*="l.php"]');
    for (const link of links) {
      const match = link.href.match(/u=([^&]+)/);
      if (match) {
        try { ad.landingPage = decodeURIComponent(match[1]); } catch(e) {}
        break;
      }
    }
    
    const dateMatch = innerText.match(/(\\d+)\\s+de\\s+(\\w+)\\s+de\\s+(\\d+)/);
    if (dateMatch) {
      ad.startDate = dateMatch[0];
      const month = MONTHS[dateMatch[2].toLowerCase()];
      if (month !== undefined) {
        ad.daysRunning = Math.floor((Date.now() - new Date(parseInt(dateMatch[3]), month, parseInt(dateMatch[1]))) / 86400000);
      }
    }
    
    const patIdx = innerText.indexOf('Patrocinado');
    if (patIdx > -1) {
      let textAfter = innerText.substring(patIdx + 11).trim();
      textAfter = textAfter.replace(/\\n(Shop Now|Learn More|Saiba mais|Ver detalhes|Comprar agora|Enviar mensagem)[\\s\\S]*$/i, '');
      textAfter = textAfter.replace(/\\n+/g, ' ').trim();
      if (textAfter.length > 20) ad.text = textAfter.substring(0, 500);
    }
    
    const priceMatch = (ad.text || innerText).match(/R\\$\\s*([\\d.,]+)/);
    ad.price = priceMatch ? priceMatch[1] : null;
    
    const t = (ad.text || '').toLowerCase();
    ad.hasGuarantee = t.includes('garantia');
    ad.hasAccess = t.includes('acesso') || t.includes('vitalicio') || t.includes('vitalício');
    ad.hasPDF = t.includes('pdf') || t.includes('ebook');
    ad.hasCourse = t.includes('curso') || t.includes('aula');
    ad.hasDelivery = t.includes('entrega') || t.includes('pronto') || t.includes('rápido');
    ad.hasOnline = t.includes('online') || t.includes('digital');
    
    let score = 20;
    if (ad.daysRunning >= 90) score += 30;
    else if (ad.daysRunning >= 60) score += 25;
    else if (ad.daysRunning >= 30) score += 20;
    else if (ad.daysRunning >= 14) score += 10;
    
    if (ad.price) score += 15;
    if (ad.hasGuarantee) score += 10;
    if (ad.hasDelivery) score += 10;
    if (ad.hasOnline) score += 5;
    if (ad.hasPDF) score += 5;
    if (ad.hasAccess) score += 5;
    
    ad.score = Math.min(score, 100);
    
    if (ad.advertiser || ad.startDate) ads.push(ad);
  }
  
  return ads;
}`;

let proc;
async function main() {
  console.log('=== Facebook Ads Library Miner - Serviços Digitais ===\n');

  proc = spawn('node', [MCP_SCRIPT, ...MCP_ARGS], { stdio: ['pipe', 'pipe', 'pipe'] });
  proc.stdout.on('data', onData);
  proc.stderr.on('data', () => {});
  await sleep(3000);

  await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'marketplace-miner', version: '1.0.0' }
  });
  proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');
  console.log('MCP Ready!\n');

  const allResults = [];

  for (const { keyword, category, maxPrice } of KEYWORDS) {
    console.log('--- "' + keyword + '" [' + category + '] ---');
    try {
      const url = 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=' + encodeURIComponent(keyword) + '&search_type=keyword_unordered&media_type=all';
      await tool('browser_navigate', { url });
      await sleep(8000);

      const evalResult = await tool('browser_evaluate', { function: EXTRACT_ADS });
      let ads = parseResult(evalResult.content[0].text) || [];
      
      const snap = await tool('browser_snapshot', {});
      const snapText = JSON.stringify(snap);
      let totalCount = 0;
      const countMatch = snapText.match(/~?(\d[\d.,]+)\s*resultados?/i);
      if (countMatch) totalCount = parseInt(countMatch[1].replace(/[.,]/g, ''));
      
      const seen = new Set();
      ads = ads.filter(a => {
        const key = a.libraryId || (a.advertiser + a.startDate);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      ads = ads.filter(a => a.score >= 50);
      ads.sort((a, b) => b.score - a.score);
      
      console.log('  Total: ' + totalCount + ' | Qualificados: ' + ads.length);
      ads.slice(0, 5).forEach(function(ad, i) {
        console.log('  #' + (i+1) + ' [' + ad.score + '] ' + (ad.daysRunning||'?') + 'd | ' + (ad.advertiser||'?').substring(0,25) + ' | R$' + (ad.price||'?'));
      });
      
      allResults.push({ keyword, category, maxPrice, totalCount, ads, scrapedAt: new Date().toISOString() });
    } catch (err) {
      console.error('  Erro: ' + err.message);
      allResults.push({ keyword, category, maxPrice, totalCount: 0, ads: [], error: err.message });
    }
    await sleep(2000);
  }

  // Salvar resultados
  const today = new Date().toISOString().split('T')[0];
  const outputDir = path.join(__dirname, 'data', 'minerados');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(outputDir, 'ads-library-' + today + '.json'), JSON.stringify(allResults, null, 2));

  let csv = 'keyword,category,max_price,total_ads,library_id,advertiser,start_date,days_running,price,score,has_guarantee,has_delivery,landing_page,text\n';
  for (const r of allResults) {
    for (const ad of r.ads) {
      csv += '"' + r.keyword + '",' + r.category + ',' + r.maxPrice + ',' + r.totalCount + ',"' + (ad.libraryId||'') + '","' + (ad.advertiser||'').replace(/"/g,'""') + '","' + (ad.startDate||'") + ',' + (ad.daysRunning||0) + ',"' + (ad.price||'") + ',' + (ad.score||0) + ',' + (ad.hasGuarantee||false) + ',' + (ad.hasDelivery||false) + ',"' + (ad.landingPage||'').substring(0,200) + '","' + (ad.text||'').substring(0,300).replace(/"/g,'""') + '"\n';
    }
  }
  fs.writeFileSync(path.join(outputDir, 'radar-servicos-' + today + '.csv'), csv);

  console.log('\n=== RESUMO FINAL ===');
  let totalQualified = 0;
  for (const r of allResults) {
    const q = r.ads.filter(a => a.score >= 60);
    totalQualified += q.length;
    console.log('"' + r.keyword + '": ' + r.totalCount + ' total | ' + q.length + ' qualificados (60+)');
  }
  console.log('Total ofertas qualificadas: ' + totalQualified);
  console.log('Arquivos salvos em: ' + outputDir);

  await tool('browser_close', {}).catch(function() {});
  proc.kill();
  process.exit(0);
}

main().catch(function(err) { console.error('Fatal:', err); process.exit(1); });
setTimeout(function() { process.exit(1); }, 600000);
