const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateSurveyCycleSchema() {
  console.log('Starting survey cycle schema migration...');
  console.log('');
  console.log('IMPORTANT: Please run the SQL migration first!');
  console.log('Execute the SQL file: database/survey-cycle-migration.sql in your Supabase SQL Editor');
  console.log('Then run this script to verify the migration.');
  console.log('');

  try {
    // Step 1: Verify the schema changes were applied
    console.log('Step 1: Verifying schema changes...');
    
    // Check if survey_cycle table has the new columns
    const { data: sampleCycle, error: cycleError } = await supabase
      .from('survey_cycle')
      .select('cycle_id, name, year, is_active')
      .limit(1)
      .single();

    if (cycleError && cycleError.code !== 'PGRST116') {
      console.error('Error accessing survey_cycle table:', cycleError);
      console.log('Please ensure you have run the SQL migration first.');
      return;
    }

    console.log('✓ Survey cycle table structure verified');

    // Step 2: Verify related tables have survey_cycle_id columns
    console.log('Step 2: Verifying related table columns...');
    
    try {
      const { error: responseError } = await supabase
        .from('survey_response')
        .select('survey_cycle_id')
        .limit(1);
      
      if (!responseError) {
        console.log('✓ survey_response.survey_cycle_id column exists');
      }
    } catch (e) {
      console.log('⚠ survey_response.survey_cycle_id column may not exist');
    }

    try {
      const { error: targetError } = await supabase
        .from('survey_target')
        .select('survey_cycle_id')
        .limit(1);
      
      if (!targetError) {
        console.log('✓ survey_target.survey_cycle_id column exists');
      }
    } catch (e) {
      console.log('⚠ survey_target.survey_cycle_id column may not exist');
    }

    try {
      const { error: assignmentError } = await supabase
        .from('assignment')
        .select('survey_cycle_id')
        .limit(1);
      
      if (!assignmentError) {
        console.log('✓ assignment.survey_cycle_id column exists');
      }
    } catch (e) {
      console.log('⚠ assignment.survey_cycle_id column may not exist');
    }

    // Step 5: Create a default survey cycle if none exists
    console.log('Step 5: Creating default survey cycle if needed...');

    const { count: existingCyclesCount } = await supabase
      .from('survey_cycle')
      .select('*', { count: 'exact', head: true });
    
    if (existingCyclesCount === 0) {
      const currentYear = new Date().getFullYear();
      const { error: insertError } = await supabase
        .from('survey_cycle')
        .insert({
          name: `Survey Cycle ${currentYear}`,
          year: currentYear,
          is_active: true,
          start_date: `${currentYear}-01-01`,
          end_date: `${currentYear}-12-31`
        });
      
      if (insertError) throw insertError;
      console.log(`Created default survey cycle for year ${currentYear}`);
    } else {
      // Update existing cycles to have proper names if they don't
      await supabase.rpc('execute_sql', {
        sql: "UPDATE survey_cycle SET name = CONCAT('Survey Cycle ', year::text) WHERE name IS NULL OR name = ''"
      });
    }

    // Step 6: Validate the migration
    console.log('Step 6: Validating migration...');

    const { data: activeCycles } = await supabase
      .from('survey_cycle')
      .select('*')
      .eq('is_active', true);

    if (activeCycles && activeCycles.length > 1) {
      console.warn('Warning: Multiple active cycles detected. Setting only the most recent as active...');
      
      // Deactivate all cycles
      await supabase
        .from('survey_cycle')
        .update({ is_active: false })
        .neq('cycle_id', 0); // Update all records

      // Activate the most recent cycle
      const { data: mostRecentCycle } = await supabase
        .from('survey_cycle')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (mostRecentCycle) {
        await supabase
          .from('survey_cycle')
          .update({ is_active: true })
          .eq('cycle_id', mostRecentCycle.cycle_id);
      }
    }

    console.log('Survey cycle schema migration completed successfully!');

    // Display summary
    const { count: totalCycles } = await supabase
      .from('survey_cycle')
      .select('*', { count: 'exact', head: true });
      
    const { data: activeCycle } = await supabase
      .from('survey_cycle')
      .select('*')
      .eq('is_active', true)
      .single();

    console.log(`\nMigration Summary:`);
    console.log(`- Total survey cycles: ${totalCycles}`);
    console.log(`- Active cycle: ${activeCycle ? `${activeCycle.name} (${activeCycle.year})` : 'None'}`);

  } catch (error) {
    console.error('Error during survey cycle schema migration:', error);
    throw error;
  } finally {
    // Supabase client doesn't need explicit disconnection
    console.log('Migration completed');
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateSurveyCycleSchema()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateSurveyCycleSchema };