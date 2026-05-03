import axios from 'axios';
import { GoogleSheetsPayload, Opportunity } from '@types/index.js';
import { logger } from '@config/logger.js';
import config from '@config/index.js';

/**
 * Service to handle Google Sheets integration via Apps Script
 */
export class GoogleSheetsService {
  /**
   * Send opportunities to Google Sheets via Apps Script webhook
   */
  async uploadOpportunities(opportunities: Opportunity[]): Promise<boolean> {
    try {
      const payload: GoogleSheetsPayload = {
        data: opportunities,
        totalCount: opportunities.length,
        scrapedAt: new Date(),
        apiKey: config.GOOGLE_SHEETS_API_KEY,
      };

      logger.info(
        `Sending ${opportunities.length} opportunities to Google Sheets`,
        config.GOOGLE_SHEETS_SCRIPT_URL
      );

      const response = await axios.post(
        config.GOOGLE_SHEETS_SCRIPT_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      logger.info('Successfully uploaded to Google Sheets:', response.data);
      return true;
    } catch (error) {
      logger.error('Failed to upload to Google Sheets:', error);
      return false;
    }
  }

  /**
   * Format opportunities for Google Sheets
   */
  formatForSheets(opportunities: Opportunity[]): any[] {
    return opportunities.map((opp) => ({
      'ID': opp.id,
      'Título': opp.title,
      'Descripción': opp.description,
      'Organización': opp.organization,
      'Categoría': opp.category,
      'Ubicación': opp.location,
      'Fecha Límite': opp.deadline?.toISOString() || '',
      'Enlace': opp.link,
      'Fecha de Scraping': opp.scrapedAt.toISOString(),
    }));
  }
}
