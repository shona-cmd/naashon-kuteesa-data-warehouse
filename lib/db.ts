import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

export const sql = neon(databaseUrl);

export async function getPool() {
  // For operations that need a pooled connection
  const { Pool } = await import('@neondatabase/serverless');
  return new Pool({ connectionString: databaseUrl, ssl: 'require' });
}

