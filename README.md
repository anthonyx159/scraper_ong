# Scraper ONG - Web Scraping with Node.js, Hono, and Playwright

Un proyecto completo de web scraping escalable para extraer oportunidades de [WePrope](https://www.wepropel.org/oportunidades) y guardarlas automáticamente en Google Sheets.

## 🎯 Características

- **Framework Web**: Hono.js para HTTP server rápido y moderno
- **Web Scraping**: Playwright para scraping de sitios dinámicos
- **Google Sheets Integration**: Guardar datos automáticamente en Google Sheets via Apps Script
- **TypeScript**: Type-safe development
- **Logging**: Pino logger para debugging y monitoreo
- **Arquitectura Escalable**: Estructura modular y extensible
- **Buenas Prácticas**: ESLint, Prettier, validación de env variables

## 📋 Requisitos

- Node.js >= 18.x
- npm o yarn
- Cuenta de Google (para Google Sheets API)

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd scraper_ong

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

## ⚙️ Configuración

### Variables de Entorno

```env
# Server
PORT=3000
NODE_ENV=development

# Google Sheets
GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/d/{SCRIPT_ID}/usercontent/execute
GOOGLE_SHEETS_API_KEY=your_api_key

# Playwright
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
PLAYWRIGHT_BROWSER=chromium

# Scraping
SCRAPE_TARGET_URL=https://www.wepropel.org/oportunidades
MAX_RETRIES=3
RETRY_DELAY=1000

# Logging
LOG_LEVEL=info
```

### Setup de Google Sheets

1. Crear un Google Sheet en tu cuenta
2. Abrir el editor de Apps Script (Extensions → Apps Script)
3. Crear un deployment como "New" y seleccionar "Web app"
4. Compartir el link de ejecución en `.env` como `GOOGLE_SHEETS_SCRIPT_URL`

**Ejemplo de Apps Script:**

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Header row
    if (sheet.getLastRow() === 0) {
      const headers = Object.keys(data.opportunities[0]);
      sheet.appendRow(headers);
    }
    
    // Add data rows
    data.opportunities.forEach(opp => {
      sheet.appendRow(Object.values(opp));
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 📖 Uso

### Modo Servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm run build
npm start
```

**Endpoints disponibles:**

```bash
# Health check
curl http://localhost:3000/health

# Trigger scraping
curl -X POST http://localhost:3000/api/scrape

# Manual scrape
curl -X POST http://localhost:3000/api/scrape/manual

# Status
curl http://localhost:3000/api/status
```

### Modo CLI

```bash
# Ejecutar scraping una vez
npm run scrape
```

## 🏗️ Estructura del Proyecto

```
src/
├── config/          # Configuración (env, logger)
├── scrapers/        # Lógica de scraping
│   ├── base.ts      # Clase base para scrapers
│   ├── wepropel.ts  # Scraper específico
│   └── runner.ts    # CLI runner
├── services/        # Servicios (Google Sheets, orchestration)
│   ├── scraper.ts   # Orquestador
│   └── google-sheets.ts
├── types/           # Tipos TypeScript
├── app.ts           # App Hono
└── index.ts         # Entry point

scripts/             # Scripts auxiliares
tests/               # Tests (vitest)
```

## 🔧 Desarrollo

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format

# Testing
npm run test
```

## 📊 Arquitectura

### Flujo Principal

1. **Request** → HTTP endpoint o CLI
2. **Scraper Service** → Orquesta el proceso
3. **WePrope Scraper** → Extrae datos usando Playwright
4. **Google Sheets Service** → Envía datos a Google Sheets
5. **Response** → Retorna resultado

### Datos Extraídos

```typescript
interface Opportunity {
  id: string;
  title: string;
  description: string;
  organization: string;
  category: string;
  location: string;
  deadline?: Date;
  link: string;
  scrapedAt: Date;
}
```

## 🔐 Seguridad

- Variables de entorno para credenciales sensibles
- Validación de env vars con Zod
- User-Agent personalizado para Playwright
- Manejo robusto de errores
- Logging detallado para auditoría

## 📈 Escalabilidad

Para escalar este proyecto:

1. **Base de Datos**: Reemplazar Google Sheets con PostgreSQL/MongoDB
2. **Job Scheduling**: Usar Bull/BullMQ para colas
3. **Caching**: Redis para datos en caché
4. **Monitoring**: Integrar Sentry, DataDog, etc.
5. **Multiple Scrapers**: Crear nuevas clases extendiendo `BaseScraper`
6. **Rate Limiting**: Implementar limiter en endpoints

### Ejemplo: Agregar nuevo scraper

```typescript
// src/scrapers/newsite.ts
import { BaseScraper } from './base.js';

export class NewSiteScraper extends BaseScraper {
  async initBrowser(): Promise<void> {
    // Tu implementación
  }

  async scrape() {
    // Tu lógica
  }
}
```

## 🐛 Troubleshooting

### Playwright no instala browsers
```bash
npx playwright install
```

### Google Sheets retorna 401
- Verificar `GOOGLE_SHEETS_API_KEY`
- Verificar que el deployment está públicamente compartido
- Revisar permisos del Google Sheet

### Timeout en scraping
- Aumentar `PLAYWRIGHT_TIMEOUT` en .env
- Verificar conexión a internet
- Revisar que el sitio está accesible

## 📝 Logging

El proyecto usa Pino para logging:

```
DEBUG: Información detallada
INFO:  Eventos importantes
WARN:  Advertencias
ERROR: Errores críticos
```

En desarrollo: salida formateada con colores
En producción: JSON para parsear en agregadores

## 📄 Licencia

MIT

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

**Última actualización**: Abril 2026
