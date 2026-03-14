USE brightlearn_lms;

-- Insert a practice test for Python for Beginners (subject_id = 1)
INSERT IGNORE INTO practice_tests (id, subject_id, title, description) VALUES
(1, 1, 'Python Basics Quiz', 'Test your knowledge on Python variables, data types, and basic operators.');

-- Insert questions for the practice test
INSERT IGNORE INTO practice_questions (id, test_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(1, 1, 'Which of the following is a valid variable name in Python?', '1variable', '_variable', 'var-name', 'variable 1', 'B'),
(2, 1, 'What is the output of print(2 ** 3)?', '5', '6', '8', '9', 'C'),
(3, 1, 'Which data type is mutable in Python?', 'Tuple', 'String', 'Integer', 'List', 'D'),
(4, 1, 'How do you insert a comment in Python code?', '// This is a comment', '# This is a comment', '/* This is a comment */', '<!-- This is a comment -->', 'B'),
(5, 1, 'What is the correct file extension for Python files?', '.pt', '.pyth', '.pyt', '.py', 'D');

-- Insert a practice test for Web Development (subject_id = 2)
INSERT IGNORE INTO practice_tests (id, subject_id, title, description) VALUES
(2, 2, 'HTML & CSS Fundamentals', 'A quick quiz to check your understanding of basic HTML tags and CSS properties.');

-- Insert questions for the second practice test
INSERT IGNORE INTO practice_questions (id, test_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(6, 2, 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Text Markup Language', 'Hyper Tabular Markup Language', 'None of these', 'A'),
(7, 2, 'Which HTML tag is used to define an internal style sheet?', '<css>', '<style>', '<script>', '<link>', 'B'),
(8, 2, 'Which CSS property controls the text size?', 'font-size', 'text-style', 'text-size', 'font-style', 'A');
