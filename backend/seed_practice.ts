import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "./src/config/database";

type PracticeSeed = {
  testId: number;
  questionStartId: number;
  subjectSlug: string;
  subjectTitle: string;
  subjectDescription: string;
  title: string;
  description: string;
  questions: Array<{
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
  }>;
};

const practiceSeeds: PracticeSeed[] = [
  {
    testId: 1,
    questionStartId: 1,
    subjectSlug: "python-beginners",
    subjectTitle: "Python for Beginners",
    subjectDescription: "Learn Python programming from scratch. Covers variables, loops, functions, and more.",
    title: "Python Basics Quiz",
    description: "Test your knowledge on Python variables, data types, and basic operators.",
    questions: [
      {
        question_text: "Which of the following is a valid variable name in Python?",
        option_a: "1variable",
        option_b: "_variable",
        option_c: "var-name",
        option_d: "variable 1",
        correct_option: "B",
      },
      {
        question_text: "What is the output of print(2 ** 3)?",
        option_a: "5",
        option_b: "6",
        option_c: "8",
        option_d: "9",
        correct_option: "C",
      },
      {
        question_text: "Which data type is mutable in Python?",
        option_a: "Tuple",
        option_b: "String",
        option_c: "Integer",
        option_d: "List",
        correct_option: "D",
      },
      {
        question_text: "How do you insert a comment in Python?",
        option_a: "// comment",
        option_b: "# comment",
        option_c: "/* comment */",
        option_d: "<!-- comment -->",
        correct_option: "B",
      },
      {
        question_text: "Correct file extension for Python?",
        option_a: ".pt",
        option_b: ".pyth",
        option_c: ".pyt",
        option_d: ".py",
        correct_option: "D",
      },
    ],
  },
  {
    testId: 2,
    questionStartId: 6,
    subjectSlug: "html-css-web-dev",
    subjectTitle: "Web Development with HTML & CSS",
    subjectDescription: "Build beautiful websites using modern HTML5 and CSS3 techniques.",
    title: "HTML & CSS Fundamentals",
    description: "A quick quiz to check your understanding of basic HTML and CSS.",
    questions: [
      {
        question_text: "What does HTML stand for?",
        option_a: "Hyper Text Markup Language",
        option_b: "High Text Markup Language",
        option_c: "Hyper Tabular Markup Language",
        option_d: "None",
        correct_option: "A",
      },
      {
        question_text: "Which tag defines an internal style sheet?",
        option_a: "<css>",
        option_b: "<style>",
        option_c: "<script>",
        option_d: "<link>",
        correct_option: "B",
      },
      {
        question_text: "Which CSS property controls text size?",
        option_a: "font-size",
        option_b: "text-style",
        option_c: "text-size",
        option_d: "font-style",
        correct_option: "A",
      },
    ],
  },
];

interface SubjectRow extends RowDataPacket {
  id: number;
}

async function resolveOrCreateSubjectId(seedConfig: PracticeSeed): Promise<number> {
  const [rows] = await pool.query<SubjectRow[]>(
    "SELECT id FROM subjects WHERE slug = ? OR title = ? ORDER BY id ASC LIMIT 1",
    [seedConfig.subjectSlug, seedConfig.subjectTitle]
  );

  if (rows.length) {
    return rows[0].id;
  }

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, TRUE)",
    [seedConfig.subjectTitle, seedConfig.subjectSlug, seedConfig.subjectDescription]
  );

  return result.insertId;
}

async function seed() {
  try {
    for (const seedConfig of practiceSeeds) {
      const subjectId = await resolveOrCreateSubjectId(seedConfig);

      await pool.query(
        "INSERT IGNORE INTO practice_tests (id, subject_id, title, description) VALUES (?, ?, ?, ?)",
        [seedConfig.testId, subjectId, seedConfig.title, seedConfig.description]
      );

      for (const [index, question] of seedConfig.questions.entries()) {
        await pool.query(
          `INSERT IGNORE INTO practice_questions
            (id, test_id, question_text, option_a, option_b, option_c, option_d, correct_option)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            seedConfig.questionStartId + index,
            seedConfig.testId,
            question.question_text,
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
            question.correct_option,
          ]
        );
      }
    }

    console.log("Practice seed data inserted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Practice seed error:", err);
    process.exit(1);
  }
}

seed();
