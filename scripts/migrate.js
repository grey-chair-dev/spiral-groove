#!/usr/bin/env node

/**
 * Simple migration runner that executes SQL files in the ./migrations directory.
 * Tracks executed migrations in the schema_migrations table.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

const projectRoot = path.join(__dirname, '..');
const migrationsDir = path.join(projectRoot, 'migrations');

dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const connectionString = process.env.LCT_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Missing LCT_DATABASE_URL or DATABASE_URL environment variable.');
  process.exit(1);
}

async function getClient() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      run_on TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function loadMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir);
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

async function getAppliedMigrations(client) {
  const result = await client.query('SELECT name FROM schema_migrations ORDER BY name ASC');
  return result.rows.map((row) => row.name);
}

async function applyMigration(client, fileName) {
  const filePath = path.join(migrationsDir, fileName);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`🔄 Running migration ${fileName}`);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [fileName]);
    await client.query('COMMIT');
    console.log(`✅ Migration ${fileName} applied`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Failed to run migration ${fileName}:`, error.message);
    throw error;
  }
}

async function printStatus(pending, applied) {
  console.log('Applied migrations:');
  applied.forEach((name) => console.log(`  ✔ ${name}`));
  if (!applied.length) {
    console.log('  (none)');
  }

  console.log('\nPending migrations:');
  pending.forEach((name) => console.log(`  • ${name}`));
  if (!pending.length) {
    console.log('  (none)');
  }
}

async function run() {
  const command = process.argv[2] || 'up';
  const client = await getClient();

  try {
    await ensureMigrationsTable(client);
    const files = loadMigrationFiles();
    const applied = await getAppliedMigrations(client);
    const pending = files.filter((file) => !applied.includes(file));

    if (command === 'status') {
      await printStatus(pending, applied);
      return;
    }

    if (!pending.length) {
      console.log('✅ Database is up to date.');
      return;
    }

    for (const file of pending) {
      await applyMigration(client, file);
    }
    console.log('🎉 All pending migrations applied.');
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error('❌ Migration runner failed:', error);
  process.exit(1);
});


