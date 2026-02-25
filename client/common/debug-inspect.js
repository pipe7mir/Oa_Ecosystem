
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.resolve(__dirname, 'db-inspect-log.txt');

const supabaseUrl = 'https://xcdzvzcevqwmuoklawrx.supabase.co';
const supabaseKey = 'sb_publishable_9odMDxiaSSkOE-wk-eErHg_Vou5jSgp';

const supabase = createClient(supabaseUrl, supabaseKey);

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

async function inspectTables() {
  fs.writeFileSync(logFile, '--- Inspecting Tables ---\n');

  // Inspect 'announcements'
  log('\n--- Announcements Sample ---');
  const { data: ann, error: errAnn } = await supabase.from('announcements').select('*').limit(1);
  if (errAnn) log('Error: ' + JSON.stringify(errAnn));
  else log('Data: ' + JSON.stringify(ann, null, 2));

  // Inspect 'requests'
  log('\n--- Requests Sample ---');
  const { data: req, error: errReq } = await supabase.from('requests').select('*').limit(1);
  if (errReq) log('Error: ' + JSON.stringify(errReq));
  else log('Data: ' + JSON.stringify(req, null, 2));
}

inspectTables();
