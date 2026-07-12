import 'dotenv/config'; // Crucial: Loads your .env variables before Prisma boots
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
});