#!/usr/bin/env node
/**
 * Database Migration Runner
 * Tracks and runs SQL migrations
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { supabaseAdmin } from '../src/lib/supabase';

interface Migration {
  name: string;
  path: string;
  executed_at?: string;
}

async function ensureMigrationsTable() {
  const { error } = await supabaseAdmin.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `
  });

  if (error) {
    // Try alternative approach
    await supabaseAdmin.from('migrations').select('id').limit(1);
  }
}

async function getExecutedMigrations(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('migrations')
    .select('name')
    .order('executed_at', { ascending: true });

  if (error) {
    console.warn('⚠️  Could not fetch migrations table. Creating it...');
    return [];
  }

  return data?.map(m => m.name) || [];
}

async function recordMigration(name: string): Promise<void> {
  await supabaseAdmin
    .from('migrations')
    .insert({ name });
}

async function runMigration(migration: Migration): Promise<boolean> {
  try {
    console.log(`⏳ Running: ${migration.name}`);
    
    const sql = readFileSync(migration.path, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        return false;
      }
    }

    await recordMigration(migration.name);
    console.log(`   ✅ Completed: ${migration.name}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function migrate(options: { rollback?: boolean; fresh?: boolean } = {}) {
  console.log('\n🔄 Database Migration Runner\n');

  try {
    await ensureMigrationsTable();

    const migrationsDir = join(process.cwd(), 'database');
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .filter(f => !f.includes('rollback'))
      .sort();

    const executed = await getExecutedMigrations();
    const pending = files.filter(f => !executed.includes(f));

    if (pending.length === 0) {
      console.log('✅ No pending migrations.\n');
      return;
    }

    console.log(`📋 Found ${pending.length} pending migration(s):\n`);
    pending.forEach(f => console.log(`   - ${f}`));
    console.log('');

    for (const file of pending) {
      const migration: Migration = {
        name: file,
        path: join(migrationsDir, file)
      };

      const success = await runMigration(migration);
      if (!success) {
        console.error('\n💥 Migration failed. Stopping.\n');
        process.exit(1);
      }
    }

    console.log('\n🎉 All migrations completed successfully!\n');
  } catch (error) {
    console.error('💥 Migration runner failed:', error);
    process.exit(1);
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  rollback: args.includes('--rollback'),
  fresh: args.includes('--fresh')
};

migrate(options);
