import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  CLIENT_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  LOG_LEVEL: z.string().default('info')
});

export const env = envSchema.parse(process.env);
