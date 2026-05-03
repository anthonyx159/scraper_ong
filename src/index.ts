import { serve } from '@hono/node-server';
import app from './app.js';
import config from '@config/index.js';
import { logger } from '@config/logger.js';

const port = config.PORT;

logger.info(`Starting server on port ${port} in ${config.NODE_ENV} mode`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info(`Server is running at http://localhost:${info.port}`);
  }
);
