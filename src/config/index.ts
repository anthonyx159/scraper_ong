import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from './logger.js';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  GOOGLE_SHEETS_SCRIPT_URL: z.string().url(),
  GOOGLE_SHEETS_API_KEY: z.string().min(1),
  PLAYWRIGHT_HEADLESS: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  PLAYWRIGHT_TIMEOUT: z.coerce.number().default(30000),
  PLAYWRIGHT_BROWSER: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
  SCRAPE_TARGET_URL: z.string().url(),
  MAX_RETRIES: z.coerce.number().default(3),
  RETRY_DELAY: z.coerce.number().default(1000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig;

try {
  config = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error('Invalid environment variables:');
    error.errors.forEach((err) => {
      logger.error(`  ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

export default config;
