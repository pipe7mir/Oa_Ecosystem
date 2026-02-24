
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.resolve(__dirname, 'db-log-2.txt');

const supabaseUrl = 'https://xcdzvzcevqwmuoklawrx.supabase.co';
const supabaseKey = 'sb_publishable_9odMDxiaSSkOE-wk-eErHg_Vou5jSgp';

const supabase = createClient(supabaseUrl, supabaseKey);

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

async function checkConnection() {
  fs.writeFileSync(logFile, '--- Starting DB Check Round 2 ---\n');
  log('🔍 Testing Supabase Connection (English Names)...');

  try {
    // 1. Check announcements
    log('\n--- Checking table: announcements ---');
    const { data: announcements, error: errorAnn } = await supabase
      .from('announcements')
      .select('count')
      .limit(1);

    if (errorAnn) {
      log('❌ Error: ' + JSON.stringify(errorAnn, null, 2));
    } else {
      log('✅ Connection to "announcements" successful.');
    }

    // 2. Check events
    log('\n--- Checking table: events ---');
    const { data: events, error: errorEvt } = await supabase
      .from('events')
      .select('count')
      .limit(1);

    if (errorEvt) {
      log('❌ Error: ' + JSON.stringify(errorEvt, null, 2));
    } else {
      log('✅ Connection to "events" successful.');
    }

  } catch (err) {
    log('❌ Unexpected error: ' + err.toString());
  }
}

checkConnection();
