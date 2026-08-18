# Facebook Marketplace Automation

Automação completa do Facebook Marketplace usando Apify — monitorar concorrentes, encontrar ofertas, análise de mercado e criar anúncios otimizados.

## 🚀 Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Monitor de Concorrentes** | Rastreia preços e anúncios de concorrentes em tempo real |
| **Alerta de Preços Baixos** | Notifica quando surgir produto abaixo do mercado |
| **Análise de Mercado** | Coleta dados de preços, tendências e demanda |
| **Gerador de Anúncios** | Gera conteúdo otimizado e abre Marketplace para publicar |
| **Criação em Lote** | Cria 10+ anúncios com variações automáticas |

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) v16+
- Conta [Apify](https://console.apify.com/sign-up) (gratuita)
- Token da API Apify

## 🛠️ Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/facebook-marketplace-automation.git

# Entre na pasta
cd facebook-marketplace-automation

# Instale as dependências
npm install

# Configure seu token Apify
# Copie config.example.json para config.json e adicione seu token
cp config.example.json config.json
```

## ⚙️ Configuração

Edite o arquivo `config.json` com seu token Apify:

```json
{
  "apify": {
    "token": "SEU_TOKEN_AQUI"
  },
  "actor": "curious_coder/facebook-marketplace",
  "defaultLocation": "São Paulo, Brazil",
  "priceAlerts": {
    "enabled": true,
    "threshold": 0.2
  }
}
```

## 🎯 Uso

### Monitor de Concorrentes

```bash
node marketplace-automation.js monitor "iPhone 13" "São Paulo, Brazil"
```

### Alerta de Preços Baixos

```bash
node marketplace-automation.js ofertas "MacBook" "São Paulo, Brazil" 3000
```

### Análise de Mercado

```bash
node marketplace-automation.js analise "PlayStation 5" "São Paulo, Brazil"
```

### Criar Anúncio Único

```bash
node criar-anuncio.js
```

### Criar 10+ Anúncios em Lote

```bash
node criar-anuncio-em-lote.js
```

## 📁 Estrutura do Projeto

```
facebook-marketplace-automation/
├── marketplace-automation.js    # Módulo principal
├── ad-generator.js              # Gerador de anúncios
├── criar-anuncio.js             # Interface para anúncio único
├── criar-anuncio-em-lote.js     # Interface para anúncios em lote
├── config.json                  # Configuração (não committar!)
├── config.example.json          # Template de configuração
├── package.json                 # Dependências
└── data/                        # Anúncios gerados (não committar!)
```

## 💰 Custo

- **Apify Free Tier**: ~1.000 listagens/mês
- **Plano pago**: A partir de $49/mês para mais volume
- **Custo por listing**: ~$0.005

## ⚠️ Aviso Importante

Este projeto usa scraping para acessar dados públicos do Facebook Marketplace. O scraping pode violar os Termos de Serviço do Facebook. Use por sua conta e risco.

## 📄 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma Issue ou Pull Request.

## 📧 Contato

Problemas? Abra uma [Issue](https://github.com/SEU-USUARIO/facebook-marketplace-automation/issues).
