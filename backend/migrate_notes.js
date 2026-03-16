require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration from environment
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'brightlearn_lms',
  multipleStatements: true
};

async function migrateNotes() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`User: ${dbConfig.user}`);
    
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, 'seed_notes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executing migration...');
    await connection.execute(migrationSQL);
    
    console.log('✅ Notes migration completed successfully!');
    console.log('Created tables:');
    console.log('- note_folders');
    console.log('- notes');
    console.log('Added sample data for testing');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Please check:');
    console.log('1. MySQL server is running');
    console.log('2. Database credentials in .env file are correct');
    console.log('3. Database exists');
    console.log('\nTo create database manually:');
    console.log(`CREATE DATABASE ${dbConfig.database};`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run migration
migrateNotes();
