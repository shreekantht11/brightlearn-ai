import { courses as legacyCourses } from "@/lib/data";

type LegacyCourse = (typeof legacyCourses)[number];

export type BackendSubject = {
  id: number;
  title: string;
  slug: string;
  description?: string;
};

export type CatalogCourse = {
  id: string;
  slug: string;
  title: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  lessons: number;
  category: string;
  description?: string;
  rating?: number;
  isLive: boolean;
};

const LIVE_COURSE_OVERRIDES: Record<string, Partial<CatalogCourse>> = {
  "python-beginners": {
    instructor: "BrightLearn Platform",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=340&fit=crop",
    duration: "12 hours",
    lessons: 48,
    category: "Programming",
  },
  "html-css-web-dev": {
    instructor: "BrightLearn Platform",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=340&fit=crop",
    duration: "20 hours",
    lessons: 64,
    category: "Programming",
  },
  "javascript-essentials": {
    instructor: "BrightLearn Platform",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=340&fit=crop",
    duration: "10 hours",
    lessons: 32,
    category: "Programming",
  },
  "data-science-python": {
    instructor: "BrightLearn Platform",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop",
    duration: "14 hours",
    lessons: 42,
    category: "Data Science",
  },
  "react-modern-ui": {
    instructor: "BrightLearn Platform",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=340&fit=crop",
    duration: "15 hours",
    lessons: 45,
    category: "Programming",
  },
  "machine-learning-fundamentals": {
    instructor: "BrightLearn Platform",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=340&fit=crop",
    duration: "16 hours",
    lessons: 52,
    category: "Data Science",
  },
};

const DEFAULT_LIVE_THUMBNAIL =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleSignature = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !["course", "courses", "fundamentals", "essentials", "with", "for", "and", "the"].includes(word))
    .join("-");

const inferCategory = (title: string, description?: string) => {
  const haystack = `${title} ${description || ""}`.toLowerCase();

  if (haystack.includes("cloud") || haystack.includes("aws")) return "Cloud";
  if (haystack.includes("design") || haystack.includes("ui") || haystack.includes("ux")) return "Design";
  if (haystack.includes("data") || haystack.includes("machine learning") || haystack.includes("analytics")) return "Data Science";
  return "Programming";
};

const normaliseMockCourse = (course: LegacyCourse): CatalogCourse => ({
  id: course.id,
  slug: slugify(course.id),
  title: course.title,
  instructor: course.instructor,
  thumbnail: course.thumbnail,
  duration: course.duration,
  lessons: course.lessons,
  category: course.category,
  description: course.description,
  rating: course.rating,
  isLive: false,
});

const normaliseLiveSubject = (subject: BackendSubject): CatalogCourse => {
  const override = LIVE_COURSE_OVERRIDES[subject.slug] || {};

  return {
    id: subject.id.toString(),
    slug: subject.slug,
    title: subject.title,
    instructor: override.instructor || "BrightLearn Platform",
    thumbnail: override.thumbnail || DEFAULT_LIVE_THUMBNAIL,
    duration: override.duration || "2+ hours",
    lessons: override.lessons || 5,
    category: override.category || inferCategory(subject.title, subject.description),
    description: subject.description,
    rating: override.rating,
    isLive: true,
  };
};

const buildKeys = (course: Pick<CatalogCourse, "slug" | "title">) => {
  const keys = new Set<string>();
  const slugKey = slugify(course.slug);
  const titleKey = slugify(course.title);
  const signatureKey = titleSignature(course.title);

  if (slugKey) keys.add(`slug:${slugKey}`);
  if (titleKey) keys.add(`title:${titleKey}`);
  if (signatureKey) keys.add(`signature:${signatureKey}`);

  return keys;
};

export const getLegacyCatalogCourses = (): CatalogCourse[] => legacyCourses.map(normaliseMockCourse);

export const mergeCatalogCourses = (subjects: BackendSubject[] = []): CatalogCourse[] => {
  const liveCourses = subjects.map(normaliseLiveSubject);
  const legacyCatalog = getLegacyCatalogCourses();
  const seenKeys = new Set<string>();

  const rememberCourse = (course: CatalogCourse) => {
    for (const key of buildKeys(course)) {
      seenKeys.add(key);
    }
  };

  for (const course of liveCourses) {
    rememberCourse(course);
  }

  const mergedLegacy = legacyCatalog.filter((course) => {
    const hasMatch = Array.from(buildKeys(course)).some((key) => seenKeys.has(key));
    if (!hasMatch) {
      rememberCourse(course);
      return true;
    }
    return false;
  });

  return [...liveCourses, ...mergedLegacy];
};
