import { ScraperService } from '@services/scraper.js';
import { logger } from '@config/logger.js';

const scraperService = new ScraperService();

async function main(): Promise<void> {
  try {
    logger.info('Starting scraper CLI...');
    const result = await scraperService.executeScrapingWorkflow();

    if (result.success) {
      logger.info(`✓ Scraping completed successfully`);
      logger.info(`  - Opportunities scraped: ${result.scrapedCount}`);
      logger.info(`  - Duration: ${result.duration}ms`);
    } else {
      logger.error(`✗ Scraping failed: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    logger.error('Unexpected error:', error);
    process.exit(1);
  }
}

main();
