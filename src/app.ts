import { Hono } from 'hono';
import config from '@config/index.js';
import { logger } from '@config/logger.js';
import { ScraperService } from '@services/scraper.js';

const app = new Hono();
const scraperService = new ScraperService();

// Middleware
app.use(async (c, next) => {
  logger.info(`${c.req.method} ${c.req.path}`);
  await next();
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: "Aqui empieza el scraping"    
  });
});

// Scraping endpoint
app.post('/api/scrape', async (c) => {
  try {
    logger.info('Scraping request received');
    const result = await scraperService.executeScrapingWorkflow();

    return c.json(
      {
        ...result,
        message: result.success ? 'Scraping completed successfully' : 'Scraping failed',
      },
      result.success ? 200 : 500
    );
  } catch (error) {
    logger.error('Error handling scrape request:', error);
    return c.json(
      {
        success: false,
        error: 'Internal server error',
      },
      500
    );
  }
});

// Manual trigger endpoint
app.post('/api/scrape/manual', async (c) => {
  try {
    const result = await scraperService.executeScrapingWorkflow();
    return c.json(result);
  } catch (error) {
    logger.error('Error in manual scrape:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// Status endpoint
app.get('/api/status', (c) => {
  return c.json({
    service: 'scraper-ong',
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default app;
