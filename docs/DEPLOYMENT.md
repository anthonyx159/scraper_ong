# Guía de Deployment y Escalabilidad

## 🚀 Deployment en Producción

### Opción 1: Heroku

```bash
# Crear archivo Procfile
echo "web: npm start" > Procfile

# Deploying
heroku create scraper-ong
heroku config:set NODE_ENV=production
heroku config:set LOG_LEVEL=info
# Copiar las demás variables de .env a Heroku

git push heroku main
```

### Opción 2: Railway

```bash
# Conectar repositorio a Railway
# Agregar variables de entorno en el dashboard
# Railway automáticamente detecta Node.js y hace deploy
```

### Opción 3: AWS Lambda + CloudWatch Events

```typescript
// src/handlers/lambda.ts
import { Handler } from 'aws-lambda';
import { ScraperService } from '@services/scraper.js';

const scraperService = new ScraperService();

export const handler: Handler = async () => {
  const result = await scraperService.executeScrapingWorkflow();
  return {
    statusCode: result.success ? 200 : 500,
    body: JSON.stringify(result),
  };
};
```

### Opción 4: Docker + VPS (DigitalOcean, Linode)

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```bash
# Build y push a DockerHub
docker build -t tu-usuario/scraper-ong:latest .
docker push tu-usuario/scraper-ong:latest

# En tu servidor
docker run -d \
  --name scraper \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GOOGLE_SHEETS_SCRIPT_URL=$SCRIPT_URL \
  tu-usuario/scraper-ong:latest
```

## 📅 Scheduling (Ejecutar Automáticamente)

### Opción 1: Cron en Linux

```bash
# Editar crontab
crontab -e

# Ejecutar scraper cada día a las 8 AM
0 8 * * * cd /path/to/scraper_ong && npm run scrape >> logs/scrape.log 2>&1

# Ejecutar cada 6 horas
0 */6 * * * curl http://localhost:3000/api/scrape
```

### Opción 2: Bull Queue (Redis)

```typescript
// src/queues/scraper-queue.ts
import Bull from 'bull';
import { ScraperService } from '@services/scraper.js';
import { logger } from '@config/logger.js';

const scraperQueue = new Bull('scraper', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
});

const scraperService = new ScraperService();

scraperQueue.process(async () => {
  logger.info('Processing scraper job from queue');
  return await scraperService.executeScrapingWorkflow();
});

// Programar jobs
scraperQueue.add({}, {
  repeat: {
    cron: '0 8 * * *', // 8 AM cada día
  }
});

export default scraperQueue;
```

### Opción 3: GitHub Actions

```yaml
# .github/workflows/schedule-scraper.yml
name: Scheduled Scraper

on:
  schedule:
    - cron: '0 8 * * *'  # 8 AM UTC diariamente

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm run build
      
      - run: npm run scrape
        env:
          GOOGLE_SHEETS_SCRIPT_URL: ${{ secrets.GOOGLE_SHEETS_SCRIPT_URL }}
          GOOGLE_SHEETS_API_KEY: ${{ secrets.GOOGLE_SHEETS_API_KEY }}
```

## 📊 Monitoreo

### Integración con Sentry

```typescript
// src/config/sentry.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export default Sentry;
```

```typescript
// En src/index.ts
import Sentry from '@config/sentry.js';

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Health Checks

```typescript
// Agregar a src/app.ts
app.get('/health/detailed', async (c) => {
  try {
    // Verificar conectividad
    const googleSheetsUp = await checkGoogleSheetsConnection();
    
    return c.json({
      status: 'healthy',
      services: {
        googleSheets: googleSheetsUp ? 'up' : 'down',
        server: 'up'
      },
      uptime: process.uptime()
    });
  } catch (error) {
    return c.json(
      { status: 'unhealthy', error: String(error) },
      500
    );
  }
});
```

## 🔄 CI/CD

### GitHub Actions con Tests

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

## 🛡️ Buenas Prácticas de Seguridad

1. **Secrets Management**
```bash
# Usar GitHub Secrets para producción
gh secret set GOOGLE_SHEETS_API_KEY --body "your-key"
```

2. **Rate Limiting**
```typescript
// Agregar middleware a src/app.ts
import rateLimit from 'hono-rate-limit';

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requests por ventana
}));
```

3. **Input Validation**
```typescript
// Validar antes de procesar
const result = envSchema.safeParse(process.env);
if (!result.success) {
  throw new Error('Invalid environment variables');
}
```

4. **Logging de Auditoría**
```typescript
// Registrar todas las scraping requests
logger.info('Scraping initiated', {
  timestamp: new Date().toISOString(),
  source: 'api' | 'cli' | 'scheduled',
  userId: c.get('user')?.id
});
```

## 📈 Escalabilidad: Próximos Pasos

### Phase 1: Base Actual ✅
- Single scraper
- Google Sheets
- HTTP API simple

### Phase 2: Mejoras Próximas (1-2 meses)
- [ ] Database (PostgreSQL)
- [ ] Job queue (Bull/Redis)
- [ ] Caching layer
- [ ] Monitoring (Sentry)
- [ ] Multiple scrapers

### Phase 3: Enterprise (3-6 meses)
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] Advanced analytics
- [ ] API versioning
- [ ] GraphQL endpoint

### Phase 4: Advanced (6+ meses)
- [ ] ML-based deduplication
- [ ] Real-time notifications
- [ ] Custom dashboards
- [ ] Multi-tenant support
- [ ] Webhook integrations

## 📚 Recursos Útiles

- [Hono Documentation](https://hono.dev)
- [Playwright Docs](https://playwright.dev)
- [Google Apps Script](https://developers.google.com/apps-script)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [The Twelve-Factor App](https://12factor.net)

---

**Última actualización**: Abril 2026
