import { Page, Browser, BrowserContext } from 'playwright';
import { logger } from '@config/logger.js';
import config from '@config/index.js';

/**
 * Base scraper class with common Playwright functionality
 */
export abstract class BaseScraper {
  protected page?: Page;
  protected browser?: Browser;
  protected context?: BrowserContext;

  /**
   * Initialize browser context
   */
  abstract initBrowser(): Promise<void>;

  /**
   * Close browser resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      logger.info('Browser resources cleaned up');
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  /**
   * Navigate to URL with retry logic
   */
  async navigateToUrl(url: string, retries = config.MAX_RETRIES): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      try {
        if (!this.page) {
          throw new Error('Page not initialized');
        }
        await this.page.goto(url, {
          waitUntil: 'networkidle',
          timeout: config.PLAYWRIGHT_TIMEOUT,
        });
        logger.info(`Successfully navigated to ${url}`);
        return true;
      } catch (error) {
        logger.warn(`Navigation attempt ${i + 1} failed for ${url}`, error);
        if (i < retries - 1) {
          await this.delay(config.RETRY_DELAY);
        }
      }
    }
    return false;
  }

  /**
   * Delay execution
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Main scraping method to be implemented by subclasses
   */
  abstract scrape(): Promise<any>;
}
