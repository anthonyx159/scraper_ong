import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WePropeOpportunitiesScraper } from '@scrapers/wepropel';
import { GoogleSheetsService } from '@services/google-sheets';
import { ScraperService } from '@services/scraper';
import { Opportunity } from '@types/index';

describe('Scraper Service', () => {
  let scraperService: ScraperService;

  beforeEach(() => {
    scraperService = new ScraperService();
  });

  it('should initialize service', () => {
    expect(scraperService).toBeDefined();
  });
});

describe('Google Sheets Service', () => {
  let googleSheetsService: GoogleSheetsService;

  beforeEach(() => {
    googleSheetsService = new GoogleSheetsService();
  });

  it('should format opportunities for sheets', () => {
    const mockOpportunity: Opportunity = {
      id: 'test-1',
      title: 'Test Opportunity',
      description: 'Test description',
      organization: 'Test Org',
      category: 'Tech',
      location: 'Remote',
      link: 'https://example.com',
      scrapedAt: new Date('2026-04-30'),
    };

    const formatted = googleSheetsService.formatForSheets([mockOpportunity]);

    expect(formatted).toHaveLength(1);
    expect(formatted[0]['Título']).toBe('Test Opportunity');
    expect(formatted[0]['Organización']).toBe('Test Org');
    expect(formatted[0]['Categoría']).toBe('Tech');
  });

  it('should handle multiple opportunities', () => {
    const opportunities: Opportunity[] = [
      {
        id: 'opp-1',
        title: 'Opportunity 1',
        description: 'Desc 1',
        organization: 'Org 1',
        category: 'Category 1',
        location: 'Location 1',
        link: 'https://example1.com',
        scrapedAt: new Date(),
      },
      {
        id: 'opp-2',
        title: 'Opportunity 2',
        description: 'Desc 2',
        organization: 'Org 2',
        category: 'Category 2',
        location: 'Location 2',
        link: 'https://example2.com',
        scrapedAt: new Date(),
      },
    ];

    const formatted = googleSheetsService.formatForSheets(opportunities);

    expect(formatted).toHaveLength(2);
    expect(formatted[0]['Título']).toBe('Opportunity 1');
    expect(formatted[1]['Título']).toBe('Opportunity 2');
  });

  it('should handle empty opportunities array', () => {
    const formatted = googleSheetsService.formatForSheets([]);
    expect(formatted).toEqual([]);
  });
});

describe('WePrope Scraper', () => {
  let scraper: WePropeOpportunitiesScraper;

  beforeEach(() => {
    scraper = new WePropeOpportunitiesScraper();
  });

  afterEach(async () => {
    await scraper.cleanup();
  });

  it('should initialize browser', async () => {
    await scraper.initBrowser();
    // Add assertions based on browser state
    expect(scraper).toBeDefined();
  });

  // Integration tests should be optional and skip in CI
  it.skip('should scrape opportunities', async () => {
    const result = await scraper.scrape();

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.scrapedCount).toBeGreaterThanOrEqual(0);
    expect(result.duration).toBeGreaterThan(0);
  });
});

describe('Opportunity Type', () => {
  it('should create valid opportunity', () => {
    const opportunity: Opportunity = {
      id: 'test-1',
      title: 'Test Title',
      description: 'Test Description',
      organization: 'Test Org',
      category: 'Test Category',
      location: 'Test Location',
      deadline: new Date('2026-05-30'),
      link: 'https://example.com',
      scrapedAt: new Date(),
    };

    expect(opportunity.id).toBeDefined();
    expect(opportunity.title).toBeDefined();
    expect(opportunity.link).toMatch(/^https?:\/\//);
  });
});
