const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFinancialFields() {
  try {
    console.log('🔍 Checking Financial section fields for Balasinon (barangay_id: 8, cycle: 17)...\n');
    
    // Get a sample of financial sections
    const sections = await prisma.surveySection.findMany({
      where: {
        section_key: 'financial',
        response: {
          barangay_id: 8,
          survey_cycle_id: 17,
          progress: 100
        }
      },
      select: {
        section_id: true,
        data: true,
        response: {
          select: {
            response_id: true,
            survey_number: true
          }
        }
      },
      take: 5
    });

    if (sections.length === 0) {
      console.log('❌ No financial sections found for this barangay/cycle');
      return;
    }

    console.log(`✅ Found ${sections.length} financial sections\n`);

    sections.forEach((section, index) => {
      console.log(`\n📋 Section ${index + 1} (Survey #${section.response.survey_number}):`);
      console.log('─'.repeat(60));
      
      if (!section.data) {
        console.log('  ⚠️  No data in this section');
        return;
      }

      const data = section.data;
      const keys = Object.keys(data);
      
      console.log(`  Total fields: ${keys.length}`);
      console.log('\n  All field names:');
      keys.forEach(key => {
        const value = data[key];
        const valuePreview = typeof value === 'string' 
          ? value.substring(0, 50) + (value.length > 50 ? '...' : '')
          : JSON.stringify(value).substring(0, 50);
        console.log(`    • ${key}: ${valuePreview}`);
      });

      // Look for corruption-related fields
      const corruptionFields = keys.filter(k => 
        k.toLowerCase().includes('corrupt') || 
        k.toLowerCase().includes('bribe') ||
        k.toLowerCase().includes('graft') ||
        k.toLowerCase().includes('integrity') ||
        k.toLowerCase().includes('transparency')
      );

      if (corruptionFields.length > 0) {
        console.log('\n  🎯 Corruption-related fields found:');
        corruptionFields.forEach(key => {
          console.log(`    ✓ ${key}: ${JSON.stringify(data[key])}`);
        });
      } else {
        console.log('\n  ⚠️  No obvious corruption-related fields found');
      }
    });

    console.log('\n\n' + '='.repeat(60));
    console.log('💡 SUMMARY');
    console.log('='.repeat(60));
    
    // Get all unique field names across all financial sections
    const allSections = await prisma.surveySection.findMany({
      where: {
        section_key: 'financial',
        response: {
          barangay_id: 8,
          survey_cycle_id: 17,
          progress: 100
        }
      },
      select: {
        data: true
      }
    });

    const allFieldNames = new Set();
    allSections.forEach(section => {
      if (section.data) {
        Object.keys(section.data).forEach(key => allFieldNames.add(key));
      }
    });

    console.log(`\nAll unique field names in Financial sections (${allFieldNames.size} total):`);
    Array.from(allFieldNames).sort().forEach(key => {
      console.log(`  • ${key}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFinancialFields();
