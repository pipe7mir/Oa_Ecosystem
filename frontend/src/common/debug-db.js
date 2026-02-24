
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.resolve(__dirname, 'db-log.txt');

const supabaseUrl = 'https://xcdzvzcevqwmuoklawrx.supabase.co';
const supabaseKey = 'sb_publishable_9odMDxiaSSkOE-wk-eErHg_Vou5jSgp';

const supabase = createClient(supabaseUrl, supabaseKey);

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

async function checkConnection() {
  fs.writeFileSync(logFile, '--- Starting DB Check ---\n');
  log('🔍 Testing Supabase Connection (Hardcoded Creds)...');

  try {
    // 1. Check Anuncios
    log('\n--- Checking table: anuncios ---');
    const { data: anuncios, error: errorAnuncios } = await supabase
      .from('anuncios')
      .select('count')
      .limit(1);

    if (errorAnuncios) {
      log('❌ Error fetching anuncios: ' + JSON.stringify(errorAnuncios, null, 2));
    } else {
      log('✅ Connection to "anuncios" successful.');
      log('Data sample: ' + JSON.stringify(anuncios));
    }

    // 2. Check Eventos
    log('\n--- Checking table: eventos ---');
    const { data: eventos, error: errorEventos } = await supabase
      .from('eventos')
      .select('count')
      .limit(1);

    if (errorEventos) {
      log('❌ Error fetching eventos: ' + JSON.stringify(errorEventos, null, 2));
    } else {
      log('✅ Connection to "eventos" successful.');
      log('Data sample: ' + JSON.stringify(eventos));
    }

  } catch (err) {
    log('❌ Unexpected error: ' + err.toString());
  }
}

checkConnection();
