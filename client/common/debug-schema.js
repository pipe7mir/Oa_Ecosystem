
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.resolve(__dirname, 'db-schema-log.txt');

const supabaseUrl = 'https://xcdzvzcevqwmuoklawrx.supabase.co';
const supabaseKey = 'sb_publishable_9odMDxiaSSkOE-wk-eErHg_Vou5jSgp';

const supabase = createClient(supabaseUrl, supabaseKey);

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

async function listTables() {
  fs.writeFileSync(logFile, '--- Listing Tables ---\n');

  // Try to use a stored procedure if available, or just guess common names if info schema is locked
  // Unfortunately, Supabase JS client doesn't give direct access to information_schema via standard query builder easily without RLS on it.
  // But we can try the RPC approach if 'get_schema' exists, or just try to select from likely tables.

  // Attempt 1: Check known candidates
  const candidates = ['eventos', 'events', 'calendar', 'calendar_events', 'schedule', 'actividades', 'activities', 'requests', 'peticiones'];

  for (const table of candidates) {
    const { error } = await supabase.from(table).select('count').limit(1);
    if (!error) {
      log(`✅ Table exists: ${table}`);
    } else if (error.code === 'PGRST205') {
      // Table not found
      // log(`❌ Table not found: ${table}`);
    } else {
      log(`⚠️ Table ${table} exists but error: ${error.message}`);
    }
  }
}

listTables();
