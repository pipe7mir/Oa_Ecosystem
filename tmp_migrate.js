const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to DB');
    
    console.log('🔄 Checking billboards table...');
    await client.query('ALTER TABLE billboards ALTER COLUMN media_url TYPE varchar(1000);');
    console.log('✅ Updated media_url length to 1000');
    
    await client.query('ALTER TABLE billboards ALTER COLUMN media_type TYPE varchar(50);');
    console.log('✅ Validated media_type column');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
