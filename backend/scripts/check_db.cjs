require('dotenv').config();
const { URL } = require('url');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('Error de conexión: no se encontró la variable de entorno DATABASE_URL');
  process.exit(1);
}

(async () => {
  let parsed;
  try {
    parsed = new URL(dbUrl);
  } catch (e) {
    console.error('Error de conexión: DATABASE_URL no tiene un formato válido');
    process.exit(1);
  }

  const protocol = parsed.protocol.replace(':', '').toLowerCase();

  if (protocol === 'postgres' || protocol === 'postgresql') {
    const { Client } = require('pg');
    const client = new Client({ connectionString: dbUrl });
    try {
      await client.connect();
      await client.query('SELECT NOW()');
      console.log('Conexión exitosa');
      await client.end();
      process.exit(0);
    } catch (err) {
      console.error('Error de conexión:', err && err.message ? err.message : err);
      try { await client.end(); } catch (e) {}
      process.exit(1);
    }
  } else if (protocol === 'mysql') {
    const mysql = require('mysql2/promise');
    let conn;
    try {
      conn = await mysql.createConnection(dbUrl);
      await conn.execute('SELECT NOW()');
      console.log('Conexión exitosa');
      await conn.end();
      process.exit(0);
    } catch (err) {
      console.error('Error de conexión:', err && err.message ? err.message : err);
      try { if (conn) await conn.end(); } catch (e) {}
      process.exit(1);
    }
  } else {
    console.error('Error: esquema de base de datos no soportado:', protocol);
    process.exit(1);
  }
})();
