# Ejemplos de Uso

Este documento muestra cómo usar el proyecto en diferentes escenarios.

## 🚀 Iniciando el Servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev
# Server running on http://localhost:3000

# Modo producción
npm run build
npm start
```

## 🌐 Ejemplos de API

### Health Check

```bash
curl http://localhost:3000/health
```

Respuesta:
```json
{
  "status": "ok",
  "timestamp": "2026-04-30T10:30:00.000Z"
}
```

### Trigger Scraping

```bash
curl -X POST http://localhost:3000/api/scrape
```

Respuesta exitosa:
```json
{
  "success": true,
  "data": [
    {
      "id": "wepropel-1234567890-abc123",
      "title": "Oportunidad de Desarrollador",
      "description": "Descripción de la oportunidad...",
      "organization": "WePrope",
      "category": "Empleo",
      "location": "Remote",
      "deadline": "2026-05-30T00:00:00.000Z",
      "link": "https://www.wepropel.org/oportunidades/123",
      "scrapedAt": "2026-04-30T10:30:00.000Z"
    }
  ],
  "scrapedCount": 1,
  "duration": 5432,
  "message": "Scraping completed successfully"
}
```

Respuesta con error:
```json
{
  "success": false,
  "error": "Failed to navigate to target URL",
  "scrapedCount": 0,
  "duration": 2000,
  "message": "Scraping failed"
}
```

### Status del Servicio

```bash
curl http://localhost:3000/api/status
```

Respuesta:
```json
{
  "service": "scraper-ong",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2026-04-30T10:30:00.000Z"
}
```

## 💻 Ejemplos CLI

### Scraping Una Vez

```bash
npm run scrape
```

Output:
```
[info] Starting scraper CLI...
[info] Browser initialized successfully
[info] Successfully navigated to https://www.wepropel.org/oportunidades
[info] Found 15 opportunity elements
[info] Successfully scraped 15 opportunities
[info] Sending 15 opportunities to Google Sheets
[info] Successfully uploaded to Google Sheets: { success: true }
[info] Workflow completed in 8234ms
✓ Scraping completed successfully
  - Opportunities scraped: 15
  - Duration: 8234ms
```

## 📦 Ejemplos de Integración

### Desde Node.js

```typescript
import { ScraperService } from './services/scraper.js';

const scraperService = new ScraperService();

async function main() {
  const result = await scraperService.executeScrapingWorkflow();
  
  if (result.success) {
    console.log(`Scraped ${result.scrapedCount} opportunities`);
    result.data?.forEach(opp => {
      console.log(`- ${opp.title} (${opp.organization})`);
    });
  } else {
    console.error('Scraping failed:', result.error);
  }
}

main().catch(console.error);
```

### Desde JavaScript (fetch)

```javascript
async function scrapeOpportunities() {
  try {
    const response = await fetch('http://localhost:3000/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log(`Scraped ${result.scrapedCount} opportunities`);
      result.data.forEach(opp => {
        console.log(`${opp.title} - ${opp.organization}`);
      });
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

scrapeOpportunities();
```

### Desde Python

```python
import requests
import json

def scrape_opportunities():
    try:
        response = requests.post('http://localhost:3000/api/scrape')
        result = response.json()

        if result['success']:
            print(f"Scraped {result['scrapedCount']} opportunities")
            for opp in result['data']:
                print(f"- {opp['title']} ({opp['organization']})")
        else:
            print(f"Error: {result['error']}")

    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

scrape_opportunities()
```

### Con cURL en Script Bash

```bash
#!/bin/bash

SCRAPER_URL="http://localhost:3000/api/scrape"

echo "Iniciando scraping..."

RESPONSE=$(curl -s -X POST "$SCRAPER_URL")

SUCCESS=$(echo "$RESPONSE" | jq '.success')
COUNT=$(echo "$RESPONSE" | jq '.scrapedCount')
DURATION=$(echo "$RESPONSE" | jq '.duration')

if [ "$SUCCESS" = "true" ]; then
    echo "✓ Scraping exitoso"
    echo "  Oportunidades extraídas: $COUNT"
    echo "  Tiempo: ${DURATION}ms"
else
    ERROR=$(echo "$RESPONSE" | jq '.error')
    echo "✗ Error: $ERROR"
fi
```

## ⏰ Ejemplos de Scheduling

### Cron (Linux/Mac)

```bash
# Ejecutar cada día a las 8 AM
0 8 * * * cd /path/to/scraper_ong && npm run scrape >> logs/scrape.log 2>&1

# Cada 6 horas
0 */6 * * * curl -X POST http://localhost:3000/api/scrape

# Todos los días a las 8 AM y 8 PM
0 8,20 * * * npm run scrape
```

### Script Node.js con Schedule

```typescript
// src/scheduler.ts
import schedule from 'node-schedule';
import { ScraperService } from '@services/scraper.js';
import { logger } from '@config/logger.js';

const scraperService = new ScraperService();

// Ejecutar cada día a las 8 AM
schedule.scheduleJob('0 8 * * *', async () => {
  logger.info('Running scheduled scraping job');
  const result = await scraperService.executeScrapingWorkflow();
  
  if (result.success) {
    logger.info(`Scheduled scraping completed: ${result.scrapedCount} opportunities`);
  } else {
    logger.error(`Scheduled scraping failed: ${result.error}`);
  }
});

logger.info('Scheduler started');
```

## 🔧 Debugging

### Con Logs Detallados

```bash
# Terminal 1: Cambiar en .env
LOG_LEVEL=debug
PLAYWRIGHT_HEADLESS=false

npm run dev
```

```bash
# Terminal 2: Hacer request
curl -X POST http://localhost:3000/api/scrape
```

### Inspeccionar HTML Extraído

```typescript
// Agregar en src/scrapers/wepropel.ts
logger.debug('Page content length:', (await this.page?.content())?.length);
logger.debug('Found opportunities:', await this.page?.$$eval(
  '[data-test="opportunity-item"]',
  els => els.length
));
```

### Captura de Pantalla

```typescript
// En src/scrapers/wepropel.ts
async scrape() {
  // ...
  await this.page?.screenshot({ 
    path: `debug-${Date.now()}.png` 
  });
  // ...
}
```

## 📊 Monitoreo

### Ver Logs en Vivo

```bash
npm run dev 2>&1 | grep -i "scraping\|error\|success"
```

### Contar Oportunidades Extraídas

```bash
# Enviar múltiples requests
for i in {1..5}; do
  echo "Run $i:"
  curl -s -X POST http://localhost:3000/api/scrape | jq '.scrapedCount'
  sleep 2
done
```

## ❌ Troubleshooting

### Playwright no encuentra elementos

```typescript
// Verificar selectores
const elements = await page?.$$('[data-test="opportunity-item"]');
console.log(`Found ${elements?.length} elements`);

// Esperar a que aparezcan
await page?.waitForSelector('[data-test="opportunity-item"]', {
  timeout: 60000, // 60 segundos
});
```

### Google Sheets no recibe datos

```typescript
// Verificar URL y headers
logger.info('Sending to:', config.GOOGLE_SHEETS_SCRIPT_URL);
logger.info('API Key present:', !!config.GOOGLE_SHEETS_API_KEY);
```

### Timeout en scraping

```bash
# Aumentar en .env
PLAYWRIGHT_TIMEOUT=60000  # 60 segundos
```

---

Para más información, revisa:
- [README.md](./README.md) - Setup y configuración
- [docs/GOOGLE_SHEETS_SETUP.md](./docs/GOOGLE_SHEETS_SETUP.md) - Google Sheets
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment en producción
