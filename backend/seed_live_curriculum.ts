import pool from "./src/config/database";
import { RowDataPacket } from "mysql2/promise";

type LessonSeed = {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string;
  durationSeconds: number;
  orderIndex: number;
};

type SectionSeed = {
  id: number;
  title: string;
  orderIndex: number;
  lessons: LessonSeed[];
};

type SubjectSeed = {
  subjectSlug: string;
  subjectTitle: string;
  sections: SectionSeed[];
};

const subjectSeeds: SubjectSeed[] = [
  {
    subjectSlug: "python-beginners",
    subjectTitle: "Python for Beginners",
    sections: [
      {
        id: 101,
        title: "Python Foundations",
        orderIndex: 1,
        lessons: [
          {
            id: 1001,
            title: "Installing Python and Running Your First Script",
            description: "Get your environment ready and learn how to execute your first Python program with confidence.",
            youtubeUrl: "https://www.youtube.com/watch?v=YYXdXT2l-Gg",
            durationSeconds: 600,
            orderIndex: 1,
          },
          {
            id: 1002,
            title: "Variables, Data Types, and Input Basics",
            description: "Understand how Python stores data, handles user input, and builds the foundation for all later lessons.",
            youtubeUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
            durationSeconds: 720,
            orderIndex: 2,
          },
        ],
      },
      {
        id: 102,
        title: "Control Flow and Functions",
        orderIndex: 2,
        lessons: [
          {
            id: 1003,
            title: "If Statements and Loops in Real Programs",
            description: "Learn how conditionals and loops let you control program flow and automate repeated logic.",
            youtubeUrl: "https://www.youtube.com/watch?v=DZwmZ8Usvnk",
            durationSeconds: 840,
            orderIndex: 1,
          },
          {
            id: 1004,
            title: "Writing Reusable Functions in Python",
            description: "Move from one-off scripts to cleaner reusable code by organizing logic into well-structured functions.",
            youtubeUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
            durationSeconds: 660,
            orderIndex: 2,
          },
        ],
      },
    ],
  },
  {
    subjectSlug: "html-css-web-dev",
    subjectTitle: "Web Development with HTML & CSS",
    sections: [
      {
        id: 103,
        title: "HTML Structure",
        orderIndex: 1,
        lessons: [
          {
            id: 1005,
            title: "HTML Structure, Tags, and Page Anatomy",
            description: "Build a strong mental model for how HTML documents are structured and how core tags work together.",
            youtubeUrl: "https://www.youtube.com/watch?v=salY_Sm6mv4",
            durationSeconds: 720,
            orderIndex: 1,
          },
          {
            id: 1006,
            title: "Forms, Inputs, and Semantic HTML",
            description: "Create cleaner, more accessible pages using semantic elements and practical HTML form patterns.",
            youtubeUrl: "https://www.youtube.com/watch?v=fNcJuPIZ2WE",
            durationSeconds: 800,
            orderIndex: 2,
          },
        ],
      },
      {
        id: 104,
        title: "CSS Styling and Layout",
        orderIndex: 2,
        lessons: [
          {
            id: 1007,
            title: "Selectors, Box Model, and Spacing",
            description: "Understand how CSS targets elements and controls spacing, sizing, and page structure.",
            youtubeUrl: "https://www.youtube.com/watch?v=yfoY53QXEnI",
            durationSeconds: 900,
            orderIndex: 1,
          },
          {
            id: 1008,
            title: "Responsive Layouts with Flexbox and Grid",
            description: "Use modern CSS layout systems to create cleaner responsive page layouts with less guesswork.",
            youtubeUrl: "https://www.youtube.com/watch?v=JJSoEo8JSnc",
            durationSeconds: 1020,
            orderIndex: 2,
          },
        ],
      },
    ],
  },
];

async function resolveSubjectId(subjectSlug: string, subjectTitle: string): Promise<number> {
  const [rows] = await pool.query<Array<RowDataPacket & { id: number }>>(
    "SELECT id FROM subjects WHERE slug = ? OR title = ? ORDER BY id ASC LIMIT 1",
    [subjectSlug, subjectTitle]
  );

  if (!rows.length) {
    throw new Error(`Live curriculum seed could not find subject: ${subjectSlug}`);
  }

  return rows[0].id;
}

async function seedLiveCurriculum() {
  try {
    for (const subjectSeed of subjectSeeds) {
      const subjectId = await resolveSubjectId(subjectSeed.subjectSlug, subjectSeed.subjectTitle);

      for (const section of subjectSeed.sections) {
        await pool.query(
          "INSERT IGNORE INTO sections (id, subject_id, title, order_index) VALUES (?, ?, ?, ?)",
          [section.id, subjectId, section.title, section.orderIndex]
        );

        for (const lesson of section.lessons) {
          await pool.query(
            `INSERT IGNORE INTO videos
              (id, section_id, title, description, youtube_url, order_index, duration_seconds)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              lesson.id,
              section.id,
              lesson.title,
              lesson.description,
              lesson.youtubeUrl,
              lesson.orderIndex,
              lesson.durationSeconds,
            ]
          );
        }
      }
    }

    console.log("Live course curriculum seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Live curriculum seed error:", error);
    process.exit(1);
  }
}

seedLiveCurriculum();
