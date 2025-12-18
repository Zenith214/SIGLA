const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

async function safeCreateYearDataTable() {
  let client;
  try {
    client = await pool.connect();
    
    console.log('🔍 Checking existing database structure...');
    
    // Step 1: Check if table already exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'barangay_year_data'
      );
    `;
    
    const tableExists = await client.query(tableExistsQuery);
    const exists = tableExists.rows[0].exists;
    
    if (exists) {
      console.log('✅ Table barangay_year_data already exists');
      
      // Check if it has data
      const countQuery = 'SELECT COUNT(*) as count FROM barangay_year_data';
      const countResult = await client.query(countQuery);
      const recordCount = parseInt(countResult.rows[0].count);
      
      console.log(`📊 Found ${recordCount} existing records`);
      
      if (recordCount > 0) {
        console.log('⚠️  Table already has data. Skipping creation to preserve existing data.');
        return;
      }
    } else {
      console.log('🔧 Creating barangay_year_data table...');
      
      // Step 2: Create the table safely (only if it doesn't exist)
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS barangay_year_data (
          id SERIAL PRIMARY KEY,
          barangay_id INTEGER NOT NULL,
          year VARCHAR(10) NOT NULL,
          seal_status VARCHAR(10) DEFAULT 'no' CHECK (seal_status IN ('yes', 'no')),
          survey_status VARCHAR(50),
          survey_count INTEGER DEFAULT 0 CHECK (survey_count >= 0),
          completion_rate DECIMAL(5,2) CHECK (completion_rate >= 0 AND completion_rate <= 100),
          target_achieved INTEGER DEFAULT 0 CHECK (target_achieved >= 0),
          target_percentage INTEGER DEFAULT 0 CHECK (target_percentage >= 0 AND target_percentage <= 100),
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          
          CONSTRAINT fk_barangay_year_data_barangay 
            FOREIGN KEY (barangay_id) REFERENCES barangay(barangay_id) ON DELETE CASCADE,
          CONSTRAINT unique_barangay_year 
            UNIQUE (barangay_id, year)
        );
      `;
      
      await client.query(createTableQuery);
      console.log('✅ Table created successfully with data validation constraints');
    }
    
    // Step 3: Create indexes safely (only if they don't exist)
    console.log('🔧 Creating indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_barangay_year_data_year ON barangay_year_data(year);',
      'CREATE INDEX IF NOT EXISTS idx_barangay_year_data_barangay_id ON barangay_year_data(barangay_id);',
      'CREATE INDEX IF NOT EXISTS idx_barangay_year_data_seal_status ON barangay_year_data(seal_status);',
      'CREATE INDEX IF NOT EXISTS idx_barangay_year_data_survey_status ON barangay_year_data(survey_status);'
    ];
    
    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Indexes created successfully');
    
    // Step 4: Safely populate with current data (only if table is empty)
    const countQuery = 'SELECT COUNT(*) as count FROM barangay_year_data';
    const countResult = await client.query(countQuery);
    const recordCount = parseInt(countResult.rows[0].count);
    
    if (recordCount === 0) {
      console.log('📊 Populating with current data...');
      await populateYearData(client);
    } else {
      console.log(`📊 Table already has ${recordCount} records. Skipping population to preserve data.`);
    }
    
    console.log('🎉 Safe migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during safe migration:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function populateYearData(client) {
  try {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];
    
    console.log(`📅 Processing years: ${years.join(', ')}`);
    
    for (const year of years) {
      console.log(`📅 Processing year ${year}...`);
      
      // Get all active barangays with their current data
      const barangaysQuery = `
        SELECT 
          b.barangay_id,
          b.barangay_name,
          b.seal,
          COALESCE(COUNT(sr.response_id), 0) as survey_count,
          COALESCE(AVG(CASE WHEN sr.status = 'completed' THEN 1 ELSE 0 END) * 100, 0) as completion_rate,
          COALESCE(st.achieved, 0) as target_achieved,
          COALESCE(st.percentage, 0) as target_percentage
        FROM barangay b
        LEFT JOIN survey_response sr ON b.barangay_id = sr.barangay_id 
          AND EXTRACT(YEAR FROM sr.created_at) = $1
        LEFT JOIN survey_target st ON b.barangay_id = st.barangay_id
        WHERE b.is_active = true
        GROUP BY b.barangay_id, b.barangay_name, b.seal, st.achieved, st.percentage
        ORDER BY b.barangay_name
      `;
      
      const barangays = await client.query(barangaysQuery, [year]);
      
      for (const barangay of barangays.rows) {
        const surveyCount = parseInt(barangay.survey_count) || 0;
        const completionRate = parseFloat(barangay.completion_rate) || 0;
        
        // Determine survey status based on data
        let surveyStatus = "No data";
        if (surveyCount > 0) {
          if (completionRate >= 100) {
            surveyStatus = "Completed";
          } else if (completionRate > 0) {
            surveyStatus = "In Progress";
          } else {
            surveyStatus = "Pending";
          }
        }
        
        // For current year, use actual seal status
        // For past years, be conservative and set to 'no' unless manually updated
        let sealStatus = 'no';
        if (year === currentYear) {
          sealStatus = barangay.seal || 'no';
        }
        
        // Insert record safely (ignore if already exists)
        const insertQuery = `
          INSERT INTO barangay_year_data 
            (barangay_id, year, seal_status, survey_status, survey_count, completion_rate, target_achieved, target_percentage, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          ON CONFLICT (barangay_id, year) DO NOTHING
        `;
        
        await client.query(insertQuery, [
          barangay.barangay_id,
          year.toString(),
          sealStatus,
          surveyStatus,
          surveyCount,
          Math.round(completionRate * 100) / 100, // Round to 2 decimal places
          barangay.target_achieved || 0,
          barangay.target_percentage || 0
        ]);
      }
      
      console.log(`✅ Year ${year} data populated (${barangays.rows.length} barangays)`);
    }
    
  } catch (error) {
    console.error('❌ Error populating year data:', error);
    throw error;
  }
}

// Backup function to create a backup before making changes
async function createBackup() {
  let client;
  try {
    client = await pool.connect();
    
    console.log('💾 Creating backup of existing data...');
    
    // Create backup tables with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const backupQueries = [
      `CREATE TABLE IF NOT EXISTS barangay_backup_${timestamp} AS SELECT * FROM barangay;`,
      `CREATE TABLE IF NOT EXISTS survey_target_backup_${timestamp} AS SELECT * FROM survey_target;`,
      `CREATE TABLE IF NOT EXISTS survey_response_backup_${timestamp} AS SELECT * FROM survey_response;`
    ];
    
    for (const query of backupQueries) {
      await client.query(query);
    }
    
    console.log(`✅ Backup created with timestamp: ${timestamp}`);
    return timestamp;
    
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Run the script
if (require.main === module) {
  console.log('🚀 Starting safe year data table creation...');
  console.log('⚠️  This script will NOT delete any existing data');
  
  createBackup()
    .then((backupTimestamp) => {
      console.log(`💾 Backup completed: ${backupTimestamp}`);
      return safeCreateYearDataTable();
    })
    .then(() => {
      console.log('✅ Safe migration completed successfully!');
      console.log('📋 Summary:');
      console.log('   - Existing data preserved');
      console.log('   - New table created (if needed)');
      console.log('   - Indexes added for performance');
      console.log('   - Year data populated (if empty)');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Safe migration failed:', error);
      console.log('💾 Your original data is safe in the backup tables');
      process.exit(1);
    });
}

module.exports = { safeCreateYearDataTable, createBackup };