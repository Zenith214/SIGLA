/**
 * Database Unseeder
 * Removes all seeded data while preserving schema
 */

import 'dotenv/config';
import { supabaseAdmin } from '../src/lib/supabase';

async function unseed() {
  console.log('\n🧹 Starting Database Unseed...\n');

  try {
    // Step 1: Get seeded user IDs first
    console.log('Identifying seeded users...');
    const { data: seededUsers, error: getUsersError } = await supabaseAdmin
      .from('user')
      .select('id')
      .like('email', '%@sigla.com');
    
    if (getUsersError) {
      console.warn('⚠️  Warning getting seeded users:', getUsersError.message);
    }
    
    const seededUserIds = seededUsers?.map(u => u.id) || [];
    console.log(`Found ${seededUserIds.length} seeded users`);

    // Step 2: Remove assignments for seeded users
    if (seededUserIds.length > 0) {
      console.log('Removing assignments for seeded users...');
      const { error: assignmentTableError } = await supabaseAdmin
        .from('assignment')
        .delete()
        .in('user_id', seededUserIds);
      
      if (assignmentTableError && assignmentTableError.code !== 'PGRST116') {
        console.warn('⚠️  Warning removing assignments:', assignmentTableError.message);
      } else {
        console.log('✅ Assignments removed');
      }
    }

    // Step 3: Clear spot assignments (set assigned_fi_id to null)
    console.log('Clearing spot assignments...');
    const { error: spotAssignmentsError } = await supabaseAdmin
      .from('spots')
      .update({ assigned_fi_id: null, status: 'Pending' })
      .not('assigned_fi_id', 'is', null);
    
    if (spotAssignmentsError) {
      console.warn('⚠️  Warning clearing spot assignments:', spotAssignmentsError.message);
    } else {
      console.log('✅ Spot assignments cleared');
    }

    // Step 4: Remove questionnaires (they reference spots)
    console.log('Removing questionnaires...');
    const { error: questionnairesError } = await supabaseAdmin
      .from('questionnaires')
      .delete()
      .neq('questionnaire_id', ''); // Delete all questionnaires
    
    if (questionnairesError && questionnairesError.code !== 'PGRST116') {
      console.warn('⚠️  Warning removing questionnaires:', questionnairesError.message);
    } else {
      console.log('✅ Questionnaires removed');
    }

    // Step 5: Remove spots
    console.log('Removing spots...');
    const { error: spotsError } = await supabaseAdmin
      .from('spots')
      .delete()
      .neq('spot_id', 0); // Delete all spots
    
    if (spotsError) {
      console.warn('⚠️  Warning removing spots:', spotsError.message);
    } else {
      console.log('✅ Spots removed');
    }

    // Step 6: Remove seeded users (now that all references are gone)
    if (seededUserIds.length > 0) {
      console.log('Removing seeded users...');
      const { error: usersError } = await supabaseAdmin
        .from('user')
        .delete()
        .in('id', seededUserIds);
      
      if (usersError) {
        console.warn('⚠️  Warning removing users:', usersError.message);
      } else {
        console.log('✅ Seeded users removed');
      }
    }

    console.log('\n🎉 Database Unseed Complete!\n');
  } catch (error) {
    console.error('\n💥 Database Unseed Failed:', error);
    process.exit(1);
  }
}

unseed();
