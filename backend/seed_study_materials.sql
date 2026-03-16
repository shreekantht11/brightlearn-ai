-- Study Materials Database Schema for BrightLearn AI

-- Create study_materials table
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES videos(id) ON DELETE SET NULL,
  INDEX idx_user_materials (user_id),
  INDEX idx_course_materials (course_id),
  INDEX idx_lesson_materials (lesson_id),
  INDEX idx_category (category),
  INDEX idx_upload_date (upload_date),
  FULLTEXT idx_search (title, description)
);

-- Insert sample study materials for demo users
INSERT IGNORE INTO study_materials (user_id, course_id, lesson_id, title, description, file_url, file_type, file_size, category) VALUES
-- User 1 - Python Course materials
(1, 1, 1, 'Python Basics Cheat Sheet', 
'Comprehensive reference guide covering Python syntax, data types, and basic operations', 
'/materials/python-basics-cheatsheet.pdf', 'PDF', 2048576, 'Reference'),

(1, 1, 2, 'Python Loops Exercises', 
'Practice problems and solutions for mastering Python loops and iterations', 
'/materials/python-loops-exercises.zip', 'ZIP', 3145728, 'Exercises'),

(1, 1, 3, 'Functions Practice Set', 
'Hands-on exercises to improve your understanding of Python functions', 
'/materials/python-functions.pdf', 'PDF', 1536000, 'Practice'),

(1, 1, NULL, 'Python Complete Course Notes', 
'Detailed notes covering all topics from the Python for Beginners course', 
'/materials/python-complete-notes.pdf', 'PDF', 5242880, 'Notes'),

-- User 1 - JavaScript Course materials
(1, 2, 1, 'JavaScript Fundamentals', 
'Core concepts and syntax of JavaScript programming language', 
'/materials/js-fundamentals.pdf', 'PDF', 1782576, 'Reference'),

(1, 2, 2, 'DOM Manipulation Guide', 
'Complete guide to working with the Document Object Model', 
'/materials/dom-manipulation.pdf', 'PDF', 2097152, 'Tutorial'),

(1, 2, 3, 'React Components Tutorial', 
'Understanding React component patterns and best practices', 
'/materials/react-components.pdf', 'PDF', 2560000, 'Tutorial'),

-- User 2 - Study materials
(2, 1, NULL, 'Python Study Guide', 
'Comprehensive study guide for Python programming course', 
'/materials/python-study-guide.pdf', 'PDF', 4194304, 'Study Guide'),

(2, 2, NULL, 'JavaScript Reference', 
'Quick reference for JavaScript syntax and common patterns', 
'/materials/js-reference.pdf', 'PDF', 1048576, 'Reference'),

(2, 1, 2, 'Loop Examples and Solutions', 
'Detailed examples and solutions for Python loop problems', 
'/materials/python-loop-examples.pdf', 'PDF', 1310720, 'Examples'),

-- Additional sample materials for variety
(1, 1, 4, 'Data Structures in Python', 
'Introduction to lists, tuples, dictionaries, and sets in Python', 
'/materials/python-data-structures.pdf', 'PDF', 2621440, 'Tutorial'),

(1, 2, NULL, 'JavaScript Best Practices', 
'Industry best practices and coding standards for JavaScript', 
'/materials/js-best-practices.pdf', 'PDF', 1835008, 'Best Practices'),

(2, 2, 1, 'JavaScript Variables and Scope', 
'Detailed explanation of variable declarations and scope in JavaScript', 
'/materials/js-variables-scope.pdf', 'PDF', 917504, 'Tutorial');

-- Update timestamps
UPDATE study_materials SET updated_at = CURRENT_TIMESTAMP;
