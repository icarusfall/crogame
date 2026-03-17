import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('railway.app') || databaseUrl.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : undefined,
});

async function migrate() {
  console.log('Running database migration...');

  const schema = readFileSync(
    join(__dirname, '..', 'src', 'store', 'schema.sql'),
    'utf-8',
  );

  await pool.query(schema);
  console.log('Migration complete: game_sessions table and indexes created');

  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
