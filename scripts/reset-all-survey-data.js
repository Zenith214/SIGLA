/**
 * Reset All Survey Data
 * 
 * This script completely wipes all survey-related data from the database:
 * - Survey responses (all answers)
 * - Questionnaires (interview slots)
 * - Spots
 * - Visits
 * - Assignments
 * - Questionnaire counters
 * 
 * WARNING: This is irreversible! Use only for testing or fresh starts.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAllSurveyData() {
  console.log('🗑️  RESETTING ALL SURVEY DATA...\n');
  console.log('⚠️  WARNING: This will delete ALL survey data from ALL cycles and barangays!');
  console.log('⚠️  This action is IRREVERSIBLE!\n');

  try {
    // Step 1: Delete all survey answers
    console.log('1️⃣  Deleting all survey answers...');
    const { error: answersError, count: answersCount } = await supabase
      .from('survey_answer')
      .delete()
      .neq('answer_id', 0);

    if (answersError) {
      console.error('❌ Error deleting answers:', answersError);
    } else {
      console.log(`   ✅ Deleted ${answersCount || 0} survey answers`);
    }

    // Step 2: Delete all survey sections (must be before responses due to FK)
    console.log('2️⃣  Deleting all survey sections...');
    const { error: sectionsError, count: sectionsCount } = await supabase
      .from('survey_section')
      .delete()
      .neq('section_id', 0);

    if (sectionsError) {
      console.error('❌ Error deleting sections:', sectionsError);
    } else {
      console.log(`   ✅ Deleted ${sectionsCount || 0} survey sections`);
    }

    // Step 3: Delete all survey responses
    console.log('3️⃣  Deleting all survey responses...');
    const { error: responsesError, count: responsesCount } = await supabase
      .from('survey_response')
      .delete()
      .neq('response_id', 0);

    if (responsesError) {
      console.error('❌ Error deleting responses:', responsesError);
    } else {
      console.log(`   ✅ Deleted ${responsesCount || 0} survey responses`);
    }

    // Step 4: Delete all visits
    console.log('4️⃣  Deleting all visits...');
    const { error: visitsError, count: visitsCount } = await supabase
      .from('visits')
      .delete()
      .neq('visit_id', 0);

    if (visitsError) {
      console.error('❌ Error deleting visits:', visitsError);
    } else {
      console.log(`   ✅ Deleted ${visitsCount || 0} visits`);
    }

    // Step 5: Delete all questionnaires
    console.log('5️⃣  Deleting all questionnaires...');
    const { error: questionnairesError, count: questionnairesCount } = await supabase
      .from('questionnaires')
      .delete()
      .neq('questionnaire_id', '');

    if (questionnairesError) {
      console.error('❌ Error deleting questionnaires:', questionnairesError);
    } else {
      console.log(`   ✅ Deleted ${questionnairesCount || 0} questionnaires`);
    }

    // Step 6: Delete all spots
    console.log('6️⃣  Deleting all spots...');
    const { error: spotsError, count: spotsCount } = await supabase
      .from('spots')
      .delete()
      .neq('spot_id', 0);

    if (spotsError) {
      console.error('❌ Error deleting spots:', spotsError);
    } else {
      console.log(`   ✅ Deleted ${spotsCount || 0} spots`);
    }

    // Step 7: Delete all assignments
    console.log('7️⃣  Deleting all assignments...');
    const { error: assignmentsError, count: assignmentsCount } = await supabase
      .from('assignment')
      .delete()
      .neq('assignment_id', 0);

    if (assignmentsError) {
      console.error('❌ Error deleting assignments:', assignmentsError);
    } else {
      console.log(`   ✅ Deleted ${assignmentsCount || 0} assignments`);
    }

    // Step 8: Reset questionnaire counters (using raw SQL due to RLS)
    console.log('8️⃣  Resetting questionnaire counters...');
    let counterCount = 0;
    try {
      // Use the DATABASE_URL to connect directly
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      
      const result = await pool.query('DELETE FROM questionnaire_counter');
      counterCount = result.rowCount;
      await pool.end();
      console.log(`   ✅ Reset ${counterCount} questionnaire counters`);
    } catch (counterError) {
      console.error('❌ Error resetting counters:', counterError.message);
    }

    console.log('\n✅ ALL SURVEY DATA HAS BEEN DELETED!');
    console.log('\n📊 Summary:');
    console.log(`   - Survey Answers: ${answersCount || 0} deleted`);
    console.log(`   - Survey Sections: ${sectionsCount || 0} deleted`);
    console.log(`   - Survey Responses: ${responsesCount || 0} deleted`);
    console.log(`   - Visits: ${visitsCount || 0} deleted`);
    console.log(`   - Questionnaires: ${questionnairesCount || 0} deleted`);
    console.log(`   - Spots: ${spotsCount || 0} deleted`);
    console.log(`   - Assignments: ${assignmentsCount || 0} deleted`);
    console.log(`   - Counters: ${counterCount} reset`);
    console.log('\n🎯 Database is now clean and ready for fresh data!');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the reset
resetAllSurveyData();
