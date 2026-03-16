-- Notes and Folders Database Schema for BrightLearn AI

-- Create note_folders table
CREATE TABLE IF NOT EXISTS note_folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_folders (user_id)
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  lesson_id INT NULL,
  title VARCHAR(500) NOT NULL,
  content LONGTEXT,
  tags JSON,
  attachments JSON,
  folder_id INT NULL,
  is_starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES videos(id) ON DELETE SET NULL,
  FOREIGN KEY (folder_id) REFERENCES note_folders(id) ON DELETE SET NULL,
  INDEX idx_user_notes (user_id),
  INDEX idx_course_notes (course_id),
  INDEX idx_lesson_notes (lesson_id),
  INDEX idx_folder_notes (folder_id),
  INDEX idx_created_at (created_at),
  INDEX idx_updated_at (updated_at),
  FULLTEXT idx_search (title, content)
);

-- Insert sample folders for demo users
INSERT IGNORE INTO note_folders (user_id, name, color) VALUES
(1, 'Python Course', '#3B82F6'),
(1, 'JavaScript Course', '#10B981'),
(1, 'General', '#6B7280'),
(2, 'Study Notes', '#8B5CF6'),
(2, 'Important', '#EF4444');

-- Insert sample notes for demo users
INSERT IGNORE INTO notes (user_id, course_id, lesson_id, title, content, tags, folder_id, is_starred) VALUES
-- User 1 - Python Course notes
(1, 1, 1, 'Python Loops Introduction', 
'Python provides two main types of loops:\n\n1. **For Loops** - Used for iterating over a sequence\n2. **While Loops** - Used for iterating as long as a condition is true\n\n## For Loop Example\n```python\nfor i in range(5):\n    print(f"Count: {i}")\n```\n\n## While Loop Example\n```python\ncount = 0\nwhile count < 5:\n    print(f"Count: {count}")\n    count += 1\n```', 
'["#python", "#loops", "#basics"]', 1, TRUE),

(1, 1, 2, 'Functions in Python', 
'Functions are reusable blocks of code that perform specific tasks.\n\n### Key Concepts:\n- Function definition using `def`\n- Parameters and arguments\n- Return values\n- Default parameters\n- *args and **kwargs\n\n### Example:\n```python\ndef greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nresult = greet("Alice")\nprint(result)  # Output: Hello, Alice!\n```', 
'["#python", "#functions", "#intermediate"]', 1, FALSE),

-- User 1 - JavaScript Course notes
(1, 2, 1, 'JavaScript Variables and Data Types', 
'JavaScript has several ways to declare variables:\n\n- `var` - Function scoped (legacy)\n- `let` - Block scoped, reassignable\n- `const` - Block scoped, constant\n\n### Data Types:\n- Primitive: String, Number, Boolean, Undefined, Null, Symbol, BigInt\n- Reference: Object, Array, Function\n\n### Example:\n```javascript\nconst name = "John";\nlet age = 25;\nvar isStudent = true;\n\nconst person = {\n  name: name,\n  age: age,\n  isStudent: isStudent\n};\n```', 
'["#javascript", "#variables", "#datatypes"]', 2, TRUE),

-- User 2 - General notes
(2, 1, NULL, 'Study Tips for Programming', 
'Effective programming study strategies:\n\n1. **Practice Daily** - Even 30 minutes helps\n2. **Build Projects** - Apply what you learn\n3. **Read Documentation** - Learn from official sources\n4. **Join Communities** - Learn from others\n5. **Take Breaks** - Avoid burnout\n\n### Resources:\n- MDN Web Docs\n- Stack Overflow\n- GitHub repositories\n- Online courses\n\nRemember: Consistency is key to learning programming!', 
'["#study", "#tips", "#general"]', 1, TRUE),

(2, 2, NULL, 'Important Code Snippets', 
'Collection of useful code snippets:\n\n### Array Methods\n```javascript\n// Filter even numbers\nconst numbers = [1, 2, 3, 4, 5];\nconst even = numbers.filter(n => n % 2 === 0);\n\n// Map to squares\nconst squares = numbers.map(n => n * n);\n```\n\n### Python List Comprehension\n```python\n# Squares of numbers 1-10\nsquares = [x**2 for x in range(1, 11)]\n\n# Filter even numbers\neven_numbers = [x for x in range(1, 21) if x % 2 == 0]\n```', 
'["#snippets", "#javascript", "#python", "#important"]', 2, TRUE);

-- Update timestamps
UPDATE note_folders SET updated_at = CURRENT_TIMESTAMP;
UPDATE notes SET updated_at = CURRENT_TIMESTAMP;
