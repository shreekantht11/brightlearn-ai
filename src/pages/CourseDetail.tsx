import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, BookOpen, ChevronDown, Lock, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { courses } from "@/lib/data";
import { useState } from "react";

const CourseDetail = () => {
  const { id } = useParams();
  const course = courses.find((c) => c.id === id);
  const [openSections, setOpenSections] = useState<number[]>([0]);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center text-muted-foreground">Course not found.</div>
      </div>
    );
  }

  const toggleSection = (i: number) => {
    setOpenSections((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-surface border-b border-border">
        <div className="container py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{course.title}</h1>
            <p className="text-muted-foreground mb-6">{course.description}</p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
              <span className="font-medium text-foreground">{course.instructor}</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" />{course.rating}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration}</span>
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{course.lessons} lessons</span>
            </div>
            <div className="flex gap-3">
              <Link to={`/learn/${course.id}`}>
                <Button size="lg" className="rounded-xl px-8 h-12 font-semibold">
                  <Play className="mr-2 h-4 w-4" /> Start Learning
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-xl px-8 h-12 font-semibold">Enroll for Free</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          {/* What You'll Learn */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xl font-bold text-foreground mb-4">What You'll Learn</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {course.learnings.map((l) => (
                <div key={l} className="flex items-start gap-3 rounded-xl bg-accent/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Curriculum */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xl font-bold text-foreground mb-4">Course Curriculum</h2>
            <div className="space-y-3">
              {course.curriculum.map((section, i) => (
                <div key={i} className="rounded-2xl border border-border overflow-hidden">
                  <button
                    onClick={() => toggleSection(i)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold text-foreground text-sm">{section.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{section.lessons.length} lessons</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openSections.includes(i) ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {openSections.includes(i) && (
                    <div className="border-t border-border">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border last:border-0">
                          {lesson.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                          ) : lesson.locked ? (
                            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <Play className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                          <span className={`text-sm ${lesson.locked ? "text-muted-foreground" : "text-foreground"}`}>{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar card */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-4">
            <img src={course.thumbnail} alt={course.title} className="rounded-xl w-full aspect-video object-cover" />
            <div className="text-2xl font-bold text-foreground">Free</div>
            <Link to={`/learn/${course.id}`}>
              <Button className="w-full rounded-xl h-12 font-semibold">Start Learning</Button>
            </Link>
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              <div className="flex justify-between"><span>Lessons</span><span className="text-foreground font-medium">{course.lessons}</span></div>
              <div className="flex justify-between"><span>Duration</span><span className="text-foreground font-medium">{course.duration}</span></div>
              <div className="flex justify-between"><span>Level</span><span className="text-foreground font-medium">Beginner</span></div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
