# Buenas Prácticas del Proyecto

## Arquitectura

### Principios SOLID

#### Single Responsibility Principle
Cada clase tiene una única responsabilidad:
- `BaseScraper`: Lógica base de scraping
- `WePropeOpportunitiesScraper`: Scraping específico del sitio
- `GoogleSheetsService`: Integración con Google Sheets
- `ScraperService`: Orquestación del flujo

```typescript
// ✅ Bien: Cada servicio tiene una responsabilidad
export class GoogleSheetsService {
  async uploadOpportunities(opportunities: Opportunity[]): Promise<boolean> {
    // Solo maneja Google Sheets
  }
}

// ❌ Mal: Demasiadas responsabilidades
export class SuperService {
  async scrapeAndUpload() {
    // Scraping + Upload + Logging + Cache
  }
}
```

#### Open/Closed Principle
Las clases están abiertas para extensión, cerradas para modificación:

```typescript
// Agregar nuevo scraper sin modificar código existente
export class LinkedInScraper extends BaseScraper {
  async scrape() {
    // Implementación específica
  }
}
```

#### Dependency Inversion
Depender de abstracciones, no de implementaciones concretas:

```typescript
// ✅ Bien: Depender de interfaz
interface IDataStore {
  save(data: Opportunity[]): Promise<boolean>;
}

export class GoogleSheetsService implements IDataStore {
  async save(data: Opportunity[]): Promise<boolean> {}
}

export class DatabaseService implements IDataStore {
  async save(data: Opportunity[]): Promise<boolean> {}
}
```

## Patrones de Diseño

### Strategy Pattern
Seleccionar algoritmos en tiempo de ejecución:

```typescript
// services/scraper.ts
export class ScraperService {
  private scraper: BaseScraper;

  constructor(scraperType: 'wepropel' | 'linkedIn' = 'wepropel') {
    this.scraper = scraperType === 'wepropel'
      ? new WePropeOpportunitiesScraper()
      : new LinkedInScraper();
  }

  async execute(): Promise<ScraperResult> {
    return this.scraper.scrape();
  }
}
```

### Factory Pattern
Crear instancias de forma centralizada:

```typescript
// factories/scraper-factory.ts
export class ScraperFactory {
  static create(type: 'wepropel' | 'linkedin' | 'twitter'): BaseScraper {
    switch (type) {
      case 'wepropel':
        return new WePropeOpportunitiesScraper();
      case 'linkedin':
        return new LinkedInScraper();
      case 'twitter':
        return new TwitterScraper();
      default:
        throw new Error(`Unknown scraper type: ${type}`);
    }
  }
}
```

### Observer Pattern
Notificar cambios a múltiples observadores:

```typescript
// Ejemplo: Notificar a Slack, Email, etc.
export interface IScrapeObserver {
  onScrapingComplete(result: ScraperResult): Promise<void>;
  onScrapingError(error: Error): Promise<void>;
}

export class ScraperService {
  private observers: IScrapeObserver[] = [];

  subscribe(observer: IScrapeObserver): void {
    this.observers.push(observer);
  }

  private async notifyObservers(result: ScraperResult): Promise<void> {
    await Promise.all(
      this.observers.map(observer => observer.onScrapingComplete(result))
    );
  }
}
```

## Convenciones de Código

### Nombrado

```typescript
// ✅ Bueno: Nombres descriptivos
interface ScrapeOptions {
  headless: boolean;
  timeout: number;
  maxRetries: number;
}

async function navigateToUrl(url: string): Promise<void> {}

// ❌ Malo: Nombres ambiguos
interface Options {
  h: boolean;
  t: number;
}

async function go(u: string): Promise<void> {}
```

### Tipos

```typescript
// ✅ Siempre tipado
async function scrape(): Promise<ScraperResult> {
  return {
    success: true,
    data: [],
    scrapedCount: 0,
    duration: 0,
  };
}

// ❌ Evitar any
async function scrape(): Promise<any> {}
```

### Errores

```typescript
// ✅ Manejo específico de errores
try {
  await navigateToUrl(url);
} catch (error) {
  if (error instanceof TimeoutError) {
    logger.warn('Navigation timeout, retrying...');
    await retry();
  } else if (error instanceof NetworkError) {
    logger.error('Network error:', error);
    throw error;
  }
}

// ❌ Capturar todo genéricamente
try {
  await navigateToUrl(url);
} catch (error) {
  console.log('Error');
}
```

## Performance

### Memoization

```typescript
// Cachear resultados caros
const cache = new Map<string, Opportunity[]>();

async function getOpportunities(url: string): Promise<Opportunity[]> {
  if (cache.has(url)) {
    logger.info('Returning cached result');
    return cache.get(url)!;
  }

  const result = await scraper.scrape();
  cache.set(url, result);
  return result;
}
```

### Batching

```typescript
// Procesar en lotes en lugar de uno a uno
async function uploadInBatches(
  opportunities: Opportunity[],
  batchSize: number = 50
): Promise<boolean> {
  for (let i = 0; i < opportunities.length; i += batchSize) {
    const batch = opportunities.slice(i, i + batchSize);
    await googleSheetsService.uploadOpportunities(batch);
  }
  return true;
}
```

### Parallel Processing

```typescript
// ✅ Procesar en paralelo cuando sea seguro
const results = await Promise.all([
  scraperService.execute(),
  validateData(),
  prepareForUpload(),
]);

// ❌ Evitar esperas secuenciales innecesarias
const result1 = await scrape();
const result2 = await validate(); // ← Espera a scrape innecesariamente
```

## Testing

### Unit Tests

```typescript
// Testear funciones aisladas
describe('GoogleSheetsService', () => {
  it('should format opportunities correctly', () => {
    const opp: Opportunity = { /* ... */ };
    const formatted = service.formatForSheets([opp]);
    expect(formatted[0]['Título']).toBe(opp.title);
  });
});
```

### Integration Tests

```typescript
// Testear componentes juntos
describe('Scraper Workflow', () => {
  it('should scrape and upload successfully', async () => {
    const result = await scraperService.executeScrapingWorkflow();
    expect(result.success).toBe(true);
  });
});
```

### Mocking

```typescript
// Mockear dependencias externas
vi.mock('@services/google-sheets', () => ({
  GoogleSheetsService: vi.fn().mockImplementation(() => ({
    uploadOpportunities: vi.fn().mockResolvedValue(true),
  })),
}));
```

## Logging

### Niveles Apropiados

```typescript
// ✅ DEBUG: Info detallada para desarrollo
logger.debug('Browser initialized', { headless: true });

// ✅ INFO: Eventos importantes
logger.info('Scraping started for', { url, count: 100 });

// ✅ WARN: Algo inesperado pero recoverable
logger.warn('Navigation timeout, retrying attempt 2/3');

// ✅ ERROR: Errores que afectan la funcionalidad
logger.error('Failed to upload to Google Sheets', { error });

// ❌ Evitar
logger.info('test log');
logger.log('something');
```

### Contexto

```typescript
// ✅ Incluir contexto relevante
logger.info('Scraping completed', {
  scrapedCount: opportunities.length,
  duration: Date.now() - startTime,
  url: config.SCRAPE_TARGET_URL,
});

// ❌ Logs sin contexto
logger.info('Done');
```

## Variables de Entorno

```typescript
// ✅ Validar y documentar
export const config = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production']),
  GOOGLE_SHEETS_SCRIPT_URL: z.string().url(),
}).parse(process.env);

// ❌ Acceso directo sin validación
const port = parseInt(process.env.PORT);
```

## Documentación

### JSDoc Comments

```typescript
/**
 * Scrape opportunities from WePrope website
 * @param options - Scraping options
 * @returns Promise containing scraping result
 * @throws {NetworkError} If unable to connect to website
 * @example
 * const scraper = new WePropeOpportunitiesScraper();
 * const result = await scraper.scrape();
 */
async function scrape(options?: ScrapeOptions): Promise<ScraperResult> {
  // Implementation
}
```

### Inline Comments

```typescript
// ✅ Explicar el "por qué", no el "qué"
// Retry con backoff exponencial para manejar rate limiting
await delay(Math.pow(2, retryCount) * 1000);

// ❌ Explicar lo obvio
// Incrementar contador
retryCount++;
```

## Escalabilidad Futura

### Estructurar para Extensión

```typescript
// Preparado para agregar nuevos scrapers
export abstract class BaseScraper {
  abstract initBrowser(): Promise<void>;
  abstract scrape(): Promise<Opportunity[]>;
  
  // Métodos comunes reutilizables
  protected async navigateToUrl(url: string): Promise<void> {}
  protected async extractData(selector: string): Promise<string> {}
}
```

### Inyección de Dependencias

```typescript
// Facilita testing y cambiar implementaciones
export class ScraperService {
  constructor(
    private scraper: BaseScraper,
    private storage: IDataStore,
    private logger: Logger
  ) {}
}
```

---

**Recordatorio**: El mejor código es el que es fácil de entender, mantener y extender. Estas prácticas ayudan a lograr eso.
