/**
 * Domain types for scraped opportunities
 */

export interface Opportunity {
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

export interface ScraperResult {
  success: boolean;
  data?: Opportunity[];
  error?: string;
  scrapedCount: number;
  duration: number;
}

export interface GoogleSheetsPayload {
  data: Opportunity[];
  totalCount: number;
  scrapedAt: Date;
  apiKey: string;
}
