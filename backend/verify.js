const mysql2 = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

const sslCaPath = process.env.DB_SSL_CA_PATH?.replace(/^"|"$/g, '');

(async () => {
  const c = await mysql2.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { ca: fs.readFileSync(sslCaPath) }
  });
  const [[s]] = await c.query('SELECT COUNT(*) as n FROM subjects');
  const [[v]] = await c.query('SELECT COUNT(*) as n FROM videos');
  const [[t]] = await c.query('SELECT COUNT(*) as n FROM practice_tests');
  const [[q]] = await c.query('SELECT COUNT(*) as n FROM practice_questions');
  console.log('✅ Aiven DB Verification:');
  console.log('  Subjects:  ', s.n);
  console.log('  Videos:    ', v.n);
  console.log('  Tests:     ', t.n);
  console.log('  Questions: ', q.n);
  await c.end();
})().catch(e => console.error('Error:', e.message));
