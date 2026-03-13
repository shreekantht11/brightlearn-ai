USE brightlearn_lms;

-- Insert sample subjects
INSERT IGNORE INTO subjects (id, title, slug, description, is_published) VALUES
(1, 'Python for Beginners', 'python-beginners', 'Learn Python programming from scratch. Covers variables, loops, functions, and more.', TRUE),
(2, 'Web Development with HTML & CSS', 'html-css-web-dev', 'Build beautiful websites using modern HTML5 and CSS3 techniques.', TRUE),
(3, 'JavaScript Essentials', 'javascript-essentials', 'Master the core concepts of JavaScript — the language of the web.', TRUE),
(4, 'Data Science with Python', 'data-science-python', 'Explore data analysis, visualization, and machine learning using Python libraries.', TRUE),
(5, 'React JS – Build Modern UIs', 'react-modern-ui', 'Learn React, hooks, state management, and build real-world projects.', TRUE),
(6, 'Machine Learning Fundamentals', 'machine-learning-fundamentals', 'Understand supervised and unsupervised learning, model training, and evaluation.', TRUE);

-- Sections for Python
INSERT IGNORE INTO sections (id, subject_id, title, order_index) VALUES
(1, 1, 'Getting Started with Python', 1),
(2, 1, 'Control Flow & Functions', 2),
(3, 2, 'HTML Basics', 1),
(4, 2, 'CSS Styling & Layout', 2),
(5, 3, 'JavaScript Fundamentals', 1),
(6, 3, 'DOM & Events', 2),
(7, 4, 'Data Analysis with Pandas', 1),
(8, 4, 'Visualization with Matplotlib', 2),
(9, 5, 'React Basics', 1),
(10, 5, 'Hooks & State Management', 2),
(11, 6, 'Intro to Machine Learning', 1),
(12, 6, 'Model Training & Evaluation', 2);

-- Videos for Python for Beginners
INSERT IGNORE INTO videos (id, section_id, title, description, youtube_url, order_index, duration_seconds) VALUES
(1, 1, 'Installing Python & Setting Up', 'Learn how to install Python and set up your environment.', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 1, 600),
(2, 1, 'Variables and Data Types', 'Understand Python variables, strings, integers, floats and booleans.', 'https://www.youtube.com/watch?v=cQT33yu9pY8', 2, 720),
(3, 2, 'If Statements & Loops', 'Master conditional logic and looping in Python.', 'https://www.youtube.com/watch?v=DZwmZ8Usvnk', 1, 840),
(4, 2, 'Functions in Python', 'Write reusable code with Python functions.', 'https://www.youtube.com/watch?v=9Os0o3wzS_I', 2, 660),

-- Videos for HTML & CSS
(5, 3, 'HTML Structure & Tags', 'Learn the building blocks of every webpage.', 'https://www.youtube.com/watch?v=salY_Sm6mv4', 1, 720),
(6, 3, 'Forms & Semantic HTML', 'Build accessible forms and use semantic elements correctly.', 'https://www.youtube.com/watch?v=fNcJuPIZ2WE', 2, 800),
(7, 4, 'CSS Selectors & Box Model', 'Style your pages using selectors, margins, paddings and borders.', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 1, 900),
(8, 4, 'Flexbox & Grid Layout', 'Build responsive layouts with CSS Flexbox and Grid.', 'https://www.youtube.com/watch?v=JJSoEo8JSnc', 2, 1020),

-- Videos for JavaScript
(9, 5, 'Variables, Types & Operators', 'Understand let, const, var and basic operators.', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 1, 780),
(10, 5, 'Functions & Arrow Functions', 'Learn to write functions including modern arrow function syntax.', 'https://www.youtube.com/watch?v=h33Srr5J9nY', 2, 660),
(11, 6, 'DOM Manipulation Basics', 'Select and change HTML elements dynamically using JavaScript.', 'https://www.youtube.com/watch?v=0ik6X4DJKCc', 1, 960),
(12, 6, 'Events & Event Listeners', 'Respond to user interactions with event handlers.', 'https://www.youtube.com/watch?v=XF1_MlZ5l6M', 2, 720),

-- Videos for Data Science
(13, 7, 'Introduction to Pandas', 'Load, clean and explore data using the Pandas library.', 'https://www.youtube.com/watch?v=vmEHCJofslg', 1, 1200),
(14, 7, 'Data Cleaning Techniques', 'Handle missing values, duplicates and transformations.', 'https://www.youtube.com/watch?v=iYie42M1ZyU', 2, 900),
(15, 8, 'Matplotlib Charts', 'Visualize data with bar charts, line graphs, and scatter plots.', 'https://www.youtube.com/watch?v=OZOOLe2imFo', 1, 1080),
(16, 8, 'Seaborn for Statistics', 'Create beautiful statistical visualizations with Seaborn.', 'https://www.youtube.com/watch?v=6GUZXDef2U0', 2, 780),

-- Videos for React
(17, 9, 'What is React & JSX?', 'Understand components, JSX syntax and the virtual DOM.', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 1, 840),
(18, 9, 'Props & Component Tree', 'Pass data between components using props.', 'https://www.youtube.com/watch?v=m7OWXtbiXX8', 2, 720),
(19, 10, 'useState & useEffect Hooks', 'Manage local state and side effects in functional components.', 'https://www.youtube.com/watch?v=O6P86uwfdR0', 1, 960),
(20, 10, 'React Router & Navigation', 'Build multi-page apps with React Router DOM.', 'https://www.youtube.com/watch?v=Law7wfdg_ls', 2, 900),

-- Videos for ML
(21, 11, 'What is Machine Learning?', 'An overview of machine learning types and real-world applications.', 'https://www.youtube.com/watch?v=ukzFI9rgwfU', 1, 720),
(22, 11, 'Supervised vs Unsupervised', 'Understand the key differences and when to use each.', 'https://www.youtube.com/watch?v=1FZ0A1QCMWc', 2, 660),
(23, 12, 'Training a Linear Model', 'Build and train your first linear regression model using sklearn.', 'https://www.youtube.com/watch?v=nk2CQITm_eo', 1, 1020),
(24, 12, 'Model Evaluation Metrics', 'Evaluate your model using accuracy, precision, recall and F1 score.', 'https://www.youtube.com/watch?v=85dtiMz9tSo', 2, 840);
