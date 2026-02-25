
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('🔍 Testing Supabase Connection...');
  console.log(`URL: ${supabaseUrl}`);

  try {
    // 1. Check Anuncios
    console.log('\nChecking table: anuncios');
    const { data: anuncios, error: errorAnuncios } = await supabase
      .from('anuncios')
      .select('count')
      .limit(1);

    if (errorAnuncios) {
      console.error('❌ Error fetching anuncios:', errorAnuncios.message);
    } else {
      console.log('✅ Connection to "anuncios" successful.');
    }

    // 2. Check Eventos
    console.log('\nChecking table: eventos');
    const { data: eventos, error: errorEventos } = await supabase
      .from('eventos')
      .select('count')
      .limit(1);

    if (errorEventos) {
      console.error('❌ Error fetching eventos:', errorEventos.message);
    } else {
      console.log('✅ Connection to "eventos" successful.');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkConnection();
