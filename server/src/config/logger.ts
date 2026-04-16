import { createLogger, format, transports } from 'winston';

import { env } from './env.js';

export const logger = createLogger({
  level: env.LOG_LEVEL,
  format: format.combine(format.timestamp(), format.simple()),
  transports: [new transports.Console()]
});
