// migrate.js — run with: node migrate.js
// Creates all tables AND seeds initial data in Aiven's defaultdb

const mysql2 = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const sslCaPath = process.env.DB_SSL_CA_PATH?.replace(/^"|"$/g, '');

// Strip "USE brightlearn_lms;" and "CREATE DATABASE..." lines
// since Aiven uses defaultdb and we're already connected to it
function cleanSql(sql) {
  return sql
    .split('\n')
    .filter(line => {
      const trimmed = line.trim().toUpperCase();
      return !trimmed.startsWith('USE ') && !trimmed.startsWith('CREATE DATABASE');
    })
    .join('\n');
}

async function run() {
  console.log('Connecting to Aiven MySQL...');
  console.log(`  Host:     ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log(`  SSL:      ${process.env.DB_SSL}\n`);

  const connection = await mysql2.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' && sslCaPath
      ? { ca: fs.readFileSync(sslCaPath) }
      : undefined,
    multipleStatements: true,
  });

  console.log('✅ Connected!\n');

  // 1. Schema
  console.log('📦 Running schema (migrate_aiven.sql)...');
  const schema = fs.readFileSync(path.join(__dirname, 'migrate_aiven.sql'), 'utf8');
  await connection.query(schema);
  console.log('   ✅ Schema applied\n');

  // 2. Seed subjects/sections/videos
  console.log('🌱 Seeding subjects, sections & videos (seed.sql)...');
  const seed = cleanSql(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'));
  await connection.query(seed);
  console.log('   ✅ Seed data inserted\n');

  // 3. Seed practice tests
  console.log('🧪 Seeding practice tests (seed_practice.sql)...');
  const seedPractice = cleanSql(fs.readFileSync(path.join(__dirname, 'seed_practice.sql'), 'utf8'));
  await connection.query(seedPractice);
  console.log('   ✅ Practice seed data inserted\n');

  // Verify
  const [tables] = await connection.query('SHOW TABLES');
  console.log('📋 Tables in defaultdb:');
  tables.forEach(r => console.log('  •', Object.values(r)[0]));

  const [[{ subjects }]] = await connection.query('SELECT COUNT(*) as subjects FROM subjects');
  const [[{ videos }]] = await connection.query('SELECT COUNT(*) as videos FROM videos');
  const [[{ tests }]] = await connection.query('SELECT COUNT(*) as tests FROM practice_tests');
  const [[{ questions }]] = await connection.query('SELECT COUNT(*) as questions FROM practice_questions');

  console.log('\n📊 Data summary:');
  console.log(`  • Subjects: ${subjects}`);
  console.log(`  • Videos:   ${videos}`);
  console.log(`  • Tests:    ${tests}`);
  console.log(`  • Questions:${questions}`);

  console.log('\n🎉 All done! Your Aiven database is ready.\n');
  await connection.end();
}

run().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
