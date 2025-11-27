const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function testRollback() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing CPAP Module Rollback Procedure...\n');
    
    // Step 1: Verify current state
    console.log('Step 1: Verifying current state...');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('cpaps', 'cpap_items')
    `;
    
    if (tables.length === 0) {
      console.log('❌ CPAP tables do not exist. Migration may not be applied.');
      process.exit(1);
    }
    
    console.log('✅ CPAP tables exist:', tables.map(t => t.table_name).join(', '));
    
    // Step 2: Check if there's any data
    const cpapCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM cpaps`;
    const itemCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM cpap_items`;
    
    console.log(`\nCurrent data:`);
    console.log(`   - CPAPs: ${cpapCount[0].count}`);
    console.log(`   - CPAP Items: ${itemCount[0].count}`);
    
    if (cpapCount[0].count > 0 || itemCount[0].count > 0) {
      console.log('\n⚠️  WARNING: There is existing CPAP data in the database!');
      console.log('   Rollback will DELETE all this data.');
      console.log('   In production, ensure you have a backup before proceeding.');
    }
    
    // Step 3: Read rollback SQL
    console.log('\nStep 2: Reading rollback SQL...');
    const rollbackPath = path.join(__dirname, '..', 'database', 'cpap-module-rollback.sql');
    const rollbackSQL = fs.readFileSync(rollbackPath, 'utf8');
    console.log('✅ Rollback SQL loaded');
    
    // Step 4: Validate rollback SQL structure
    console.log('\nStep 3: Validating rollback SQL structure...');
    const expectedStatements = [
      'DROP CONSTRAINT',
      'DROP INDEX',
      'DROP TABLE',
      'DROP TYPE',
      'ALTER TABLE'
    ];
    
    let allStatementsFound = true;
    expectedStatements.forEach(stmt => {
      if (!rollbackSQL.includes(stmt)) {
        console.log(`❌ Missing expected statement: ${stmt}`);
        allStatementsFound = false;
      }
    });
    
    if (allStatementsFound) {
      console.log('✅ All expected rollback statements found');
    } else {
      console.log('❌ Rollback SQL is incomplete');
      process.exit(1);
    }
    
    // Step 5: Test rollback in dry-run mode (just parse, don't execute)
    console.log('\nStep 4: Parsing rollback statements...');
    const statements = rollbackSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`✅ Found ${statements.length} rollback statements`);
    
    statements.forEach((stmt, i) => {
      const preview = stmt.substring(0, 60).replace(/\s+/g, ' ');
      console.log(`   ${i + 1}. ${preview}...`);
    });
    
    console.log('\n✅ Rollback procedure validation complete!');
    console.log('\n📋 Rollback Summary:');
    console.log('   - Rollback SQL file: database/cpap-module-rollback.sql');
    console.log('   - Statements to execute: ' + statements.length);
    console.log('   - Current CPAP records: ' + cpapCount[0].count);
    console.log('   - Current CPAP items: ' + itemCount[0].count);
    
    console.log('\n⚠️  To execute rollback in production:');
    console.log('   1. Create database backup');
    console.log('   2. Run: psql -h <host> -U <user> -d <database> -f database/cpap-module-rollback.sql');
    console.log('   3. Verify rollback with: node scripts/check-cpap-tables.js');
    console.log('   4. Regenerate Prisma client: npx prisma generate');
    
    console.log('\n🎉 Rollback test complete!\n');
    
  } catch (error) {
    console.error('\n❌ Rollback test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRollback();
