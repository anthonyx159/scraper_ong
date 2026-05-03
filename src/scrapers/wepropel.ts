import { chromium, firefox, webkit, Browser, Page } from 'playwright';
import { BaseScraper } from './base.js';
import { Opportunity, ScraperResult } from '@types/index.js';
import { logger } from '@config/logger.js';
import config from '@config/index.js';

/**
 * Web scraper for https://www.wepropel.org/oportunidades
 */
export class WePropeOpportunitiesScraper extends BaseScraper {
  private startTime: number = 0;

  async initBrowser(): Promise<void> {
    try {
      const browserMap = {
        chromium,
        firefox,
        webkit,
      };

      const selectedBrowser = browserMap[config.PLAYWRIGHT_BROWSER];

      this.browser = await selectedBrowser.launch({
        headless: config.PLAYWRIGHT_HEADLESS,
      });

      this.context = await this.browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      });

      this.page = await this.context.newPage();
      logger.info('Browser initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async scrape(): Promise<ScraperResult> {
    this.startTime = Date.now();

    try {
      await this.initBrowser();

      const navigated = await this.navigateToUrl(config.SCRAPE_TARGET_URL);
      if (!navigated) {
        throw new Error('Failed to navigate to target URL');
      }

      // Wait for the page to render and then look for content markers
      await this.page?.waitForLoadState('domcontentloaded');

      const cardSelector = '[id="w-node-_0bcb0ece-4de8-3e9a-24c8-762dbc33f6c3-6b028775"]';

      const cardVisible = await this.page
        ?.waitForSelector(cardSelector, {
          timeout: config.PLAYWRIGHT_TIMEOUT,
        })
        .then(() => true)
        .catch(() => false);


      if (!cardVisible) {
        const pageTitle = await this.page?.title();
        const pageUrl = this.page?.url();
        throw new Error(
          `Content markers not found. title="${pageTitle}" url="${pageUrl}"`
        );
      }
      const opportunities = await this.extractOpportunities();

      logger.info(`Successfully scraped ${opportunities.length} opportunities`);

      return {
        success: true,
        data: opportunities,
        scrapedCount: opportunities.length,
        duration: Date.now() - this.startTime,
      };
    } catch (error) {
      logger.error('Scraping failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        scrapedCount: 0,
        duration: Date.now() - this.startTime,
      };
    } finally {
      // await this.cleanup();
    }
  }

  private async extractOpportunities(): Promise<Opportunity[]> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const opportunities: Opportunity[] = [];

    // Select all opportunity elements
    const opportunityElements = await this.page.$$('[id="w-node-_0bcb0ece-4de8-3e9a-24c8-762dbc33f6c3-6b028775"]');

    logger.info(`Found ${opportunityElements.length} opportunity elements`);

    for (let i = 0; i < opportunityElements.length; i++) {
      try {
        const element = opportunityElements[i];

        const opportunity = await element.evaluate((el): Opportunity | null => {
          const titleEl = el.querySelector('[fs-list-field="name"]');
          const descriptionEl = el.querySelector('[fs-list-field="content"]');
          const organizationEl = el.querySelector('[data-test="opportunity-organization"]');
          const categoryEl = el.querySelector('[data-test="opportunity-category"]');
          const locationEl = el.querySelector('.base_countries .text-style-1line');
          const deadlineEl = el.querySelector('[fs-list-field="date"]');
          const linkEl = el.querySelector('.button');

          if (!titleEl || !linkEl) {
            return null;
          }

          return {
            id: `wepropel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: titleEl.textContent?.trim() || '',
            description: descriptionEl?.textContent?.trim() || '',
            organization: organizationEl?.textContent?.trim() || '',
            category: categoryEl?.textContent?.trim() || '',
            location: locationEl?.textContent?.trim() || '',
            deadline: deadlineEl?.textContent ? new Date(deadlineEl.textContent) : undefined,
            link: linkEl.href || '',
            scrapedAt: new Date(),
          };
        });

        if (opportunity) {
          opportunities.push(opportunity);
        }
      } catch (error) {
        logger.warn(`Failed to extract opportunity at index ${i}:`, error);
      }
    }

    return opportunities;
  }
}
