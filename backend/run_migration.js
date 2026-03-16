const mysql = require('mysql2/promise');
require('dotenv').config();

// Use same config as your backend
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
};

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database for migration...');
    connection = await mysql.createConnection(dbConfig);
    
    // Create study_materials table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS study_materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        lesson_id INT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        file_url VARCHAR(1000) NOT NULL,
        file_type VARCHAR(10) NOT NULL,
        file_size BIGINT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'General',
        is_completed BOOLEAN DEFAULT FALSE,
        download_count INT DEFAULT 0,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_materials (user_id),
        INDEX idx_course_materials (course_id),
        INDEX idx_category (category),
        INDEX idx_upload_date (upload_date)
      )
    `;
    
    console.log('Creating study_materials table...');
    await connection.execute(createTableSQL);
    
    // Insert sample data
    const insertSQL = `
      INSERT IGNORE INTO study_materials (user_id, course_id, lesson_id, title, description, file_url, file_type, file_size, category) VALUES
      (1, 1, 1, 'Python Basics Cheat Sheet', 
      'Comprehensive reference guide covering Python syntax, data types, and basic operations', 
      '/materials/python-basics-cheatsheet.pdf', 'PDF', 2048576, 'Reference'),
      
      (1, 1, 2, 'Python Loops Exercises', 
      'Practice problems and solutions for mastering Python loops and iterations', 
      '/materials/python-loops-exercises.zip', 'ZIP', 3145728, 'Exercises'),
      
      (1, 2, 1, 'JavaScript Fundamentals', 
      'Core concepts and syntax of JavaScript programming language', 
      '/materials/js-fundamentals.pdf', 'PDF', 1782576, 'Reference'),
      
      (1, 2, 2, 'DOM Manipulation Guide', 
      'Complete guide to working with the Document Object Model', 
      '/materials/dom-manipulation.pdf', 'PDF', 2097152, 'Tutorial'),
      
      (1, 3, 1, 'React Components Tutorial', 
      'Understanding React component patterns and best practices', 
      '/materials/react-components.pdf', 'PDF', 2560000, 'Tutorial'),
      
      (2, 1, NULL, 'Python Study Guide', 
      'Comprehensive study guide for Python programming course', 
      '/materials/python-study-guide.pdf', 'PDF', 4194304, 'Study Guide'),
      
      (2, 2, NULL, 'JavaScript Reference', 
      'Quick reference for JavaScript syntax and common patterns', 
      '/materials/js-reference.pdf', 'PDF', 1048576, 'Reference')
    `;
    
    console.log('Inserting sample data...');
    await connection.execute(insertSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('- Created study_materials table');
    console.log('- Added sample study materials');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

runMigration();
