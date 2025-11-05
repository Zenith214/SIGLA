/**
 * Reset Questionnaire Counter
 * Use this script to reset the questionnaire counter to a specific number
 * WARNING: This should only be used for testing or administrative purposes
 */

const { Pool } = require('pg');
const readline = require('readline');

// Load environment variables from .env or .env.local
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetCounter() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to database\n');

    // Get current counter value
    const currentResult = await client.query(`
      SELECT current_number 
      FROM questionnaire_counter 
      WHERE counter_id = 1
    `);

    if (currentResult.rows.length === 0) {
      console.log('❌ Questionnaire counter table not found or not initialized');
      console.log('   Please run: node scripts/run-questionnaire-counter-migration.js');
      process.exit(1);
    }

    const currentNumber = currentResult.rows[0].current_number;
    console.log(`📊 Current questionnaire counter: ${currentNumber}\n`);

    // Ask for new value
    const newValueStr = await question('Enter new counter value (or press Enter to cancel): ');
    
    if (!newValueStr.trim()) {
      console.log('\n❌ Operation cancelled');
      process.exit(0);
    }

    const newValue = parseInt(newValueStr);
    
    if (isNaN(newValue) || newValue < 0) {
      console.log('\n❌ Invalid value. Please enter a non-negative integer.');
      process.exit(1);
    }

    // Confirm the action
    console.log(`\n⚠️  WARNING: You are about to reset the counter from ${currentNumber} to ${newValue}`);
    const confirm = await question('Type "RESET" to confirm: ');

    if (confirm.trim().toUpperCase() !== 'RESET') {
      console.log('\n❌ Operation cancelled');
      process.exit(0);
    }

    // Perform the reset
    await client.query(`
      UPDATE questionnaire_counter
      SET current_number = $1,
          updated_at = NOW()
      WHERE counter_id = 1
    `, [newValue]);

    console.log(`\n✅ Counter reset successfully!`);
    console.log(`   Old value: ${currentNumber}`);
    console.log(`   New value: ${newValue}`);
    console.log(`\n📝 Next generated questionnaire number will be: ${newValue + 1}\n`);

  } catch (error) {
    console.error('❌ Error resetting counter:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    rl.close();
  }
}

resetCounter();
