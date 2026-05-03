import { logger } from '@config/logger.js';

/**
 * Utility functions for common scraping tasks
 */

/**
 * Retry an async function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms`, error);
      await delay(delayMs);
    }
  }

  throw new Error('Retry limit exceeded');
}

/**
 * Delay execution for given milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string | undefined): Date | undefined {
  if (!dateString) return undefined;

  const date = new Date(dateString);
  return isValidDate(date) ? date : undefined;
}

/**
 * Check if date is valid
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Sanitize text by removing extra whitespace
 */
export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Batch array into chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Deduplicate array of objects by a property
 */
export function deduplicateByProperty<T>(array: T[], property: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const key = item[property];
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Measure execution time of async function
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  const result = await fn();
  const duration = Date.now() - startTime;
  return { result, duration };
}

/**
 * Wait for condition to be true
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  checkInterval: number = 100
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = await Promise.resolve(condition());
      if (result) {
        return true;
      }
    } catch (error) {
      logger.debug('Condition check failed:', error);
    }

    await delay(checkInterval);
  }

  return false;
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T = unknown>(json: string, fallback: T): T | unknown {
  try {
    return JSON.parse(json);
  } catch (error) {
    logger.warn('Failed to parse JSON:', error);
    return fallback;
  }
}
