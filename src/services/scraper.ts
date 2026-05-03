import { WePropeOpportunitiesScraper } from '@scrapers/wepropel.js';
import { GoogleSheetsService } from './google-sheets.js';
import { ScraperResult } from '@types/index.js';
import { logger } from '@config/logger.js';

/**
 * Orchestrates scraping and data persistence
 */
export class ScraperService {
  private googleSheetsService: GoogleSheetsService;

  constructor() {
    this.googleSheetsService = new GoogleSheetsService();
  }

  /**
   * Execute complete scraping workflow
   */
  async executeScrapingWorkflow(): Promise<ScraperResult> {
    const startTime = Date.now();

    try {
      logger.info('Starting scraping workflow...');

      // Run the scraper
      const scraper = new WePropeOpportunitiesScraper();
      const scraperResult = await scraper.scrape();

      if (!scraperResult.success || !scraperResult.data) {
        logger.error('Scraper failed:', scraperResult.error);
        return scraperResult;
      }

      // Upload to Google Sheets
      const uploadSuccess = await this.googleSheetsService.uploadOpportunities(
        scraperResult.data
      );

      if (!uploadSuccess) {
        logger.warn('Failed to upload to Google Sheets, but scraping was successful');
      }

      const totalDuration = Date.now() - startTime;
      logger.info(`Workflow completed in ${totalDuration}ms`);

      return {
        ...scraperResult,
        duration: totalDuration,
      };
    } catch (error) {
      logger.error('Scraping workflow failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        scrapedCount: 0,
        duration: Date.now() - startTime,
      };
    }
  }
}
