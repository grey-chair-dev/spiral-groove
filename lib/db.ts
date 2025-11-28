import { neon } from '@neondatabase/serverless';

// Create a single connection pool for Neon
// Check for Vercel-prefixed variable first, then fallback to DATABASE_URL
const databaseUrl = process.env.LCT_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or LCT_DATABASE_URL environment variable is not set');
}

const sql = neon(databaseUrl);

export { sql };
