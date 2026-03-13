import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Lock, Play, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/VideoPlayer";
import AIChatPanel from "@/components/AIChatPanel";
import { courses } from "@/lib/data";

const DEMO_VIDEO_ID = "dQw4w9WgXcQ";

const Learning = () => {
  const { id } = useParams();
  const course = courses.find((c) => c.id === id) || courses[0];
  const allLessons = course.curriculum.flatMap((s) => s.lessons);
  const [currentLessonId, setCurrentLessonId] = useState(allLessons[0]?.id || "1");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const currentLesson = allLessons[currentIndex];
  const completedCount = allLessons.filter((l) => l.completed).length;
  const progressPercent = Math.round((completedCount / allLessons.length) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-4 gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link to={`/course/${course.id}`} className="text-sm font-semibold text-foreground truncate">{course.title}</Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">{progressPercent}% complete</span>
          <div className="w-32 h-2 rounded-full bg-muted overflow-hidden hidden sm:block">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-r border-border bg-card overflow-y-auto flex-shrink-0"
            >
              <div className="p-4 space-y-4">
                {course.curriculum.map((section, si) => (
                  <div key={si}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">{section.title}</h3>
                    <div className="space-y-0.5">
                      {section.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => !lesson.locked && setCurrentLessonId(lesson.id)}
                          disabled={lesson.locked}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                            currentLessonId === lesson.id
                              ? "bg-accent text-accent-foreground font-medium"
                              : lesson.locked
                              ? "text-muted-foreground/50 cursor-not-allowed"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          {lesson.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                          ) : lesson.locked ? (
                            <Lock className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <Play className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <VideoPlayer videoId={DEMO_VIDEO_ID} title={currentLesson?.title || "Lesson"} />

            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{currentLesson?.title || "Lesson"}</h1>
              <p className="text-muted-foreground text-sm">
                This lesson covers the key concepts and practical examples to help you understand {currentLesson?.title?.toLowerCase()}.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => currentIndex > 0 && setCurrentLessonId(allLessons[currentIndex - 1].id)}
                disabled={currentIndex <= 0}
                className="rounded-xl"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button
                onClick={() => currentIndex < allLessons.length - 1 && setCurrentLessonId(allLessons[currentIndex + 1].id)}
                disabled={currentIndex >= allLessons.length - 1}
                className="rounded-xl"
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>

      <AIChatPanel />
    </div>
  );
};

export default Learning;
