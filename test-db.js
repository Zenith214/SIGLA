const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DIRECT_URL || 'postgresql://postgres.wzmlfzlmmwclerbwqfha:K2UbwPfAioYrzVM2@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres',
});

client.connect()
  .then(() => {
    console.log('✅ Connected successfully to the database!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Database time:', res.rows[0].now);
    client.end();
  })
  .catch(err => {
    console.error('❌ Connection error:');
    console.error(err.message);
    client.end();
  });
