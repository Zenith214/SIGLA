// Clear all ML-related cache
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearCache() {
  console.log('🗑️ Clearing all ML cache...');
  
  const { data, error } = await supabase
    .from('ml_cache')
    .delete()
    .neq('id', 0) // Delete all
    .select();
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log(`✅ Cleared ${data?.length || 0} cache entries`);
  }
  
  process.exit(0);
}

clearCache();
