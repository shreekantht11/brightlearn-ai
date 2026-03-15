import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, BookOpen, ChevronDown, CheckCircle2, Play, Loader2, Star, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { courses as mockCourses } from "@/lib/data";
import { useEnrollModal } from "@/context/EnrollModalContext";

type CourseVideo = { id: number | string; title: string; duration_seconds?: number; completed?: boolean; locked?: boolean; };
type CourseSection = { id: number | string; title: string; videos?: CourseVideo[]; };
type CourseData = { id: number | string; title: string; description?: string; instructor?: string; duration?: string; lessons?: number; rating?: number; thumbnail?: string; learnings?: string[]; };

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLiveId = /^\d+$/.test(id || "");
  const { openEnrollModal } = useEnrollModal();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [tree, setTree] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openSections, setOpenSections] = useState<number[]>([0]);

  useEffect(() => {
    const loadData = async () => {
      if (!isLiveId) {
        const found = mockCourses.find((c) => c.id === id);
        if (!found) { toast.error("Course not found"); navigate("/courses"); return; }
        setCourse({ id: found.id, title: found.title, description: found.description, instructor: found.instructor, duration: found.duration, lessons: found.lessons, rating: found.rating, thumbnail: found.thumbnail, learnings: found.learnings });
        setTree(found.curriculum.map((section, i) => ({ id: i, title: section.title, videos: section.lessons.map((l) => ({ id: l.id, title: l.title, duration_seconds: 600, completed: l.completed, locked: l.locked })) })));
        setLoading(false);
        return;
      }
      const token = localStorage.getItem("token");
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const [subjectRes, treeRes, enrollmentsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/subjects/${id}`),
          fetch(`http://localhost:5000/api/subjects/${id}/tree`),
          token ? fetch(`http://localhost:5000/api/enroll/${id}/status`, { headers }) : Promise.resolve(null),
        ]);
        if (!subjectRes.ok) { toast.error("Course not found"); navigate("/courses"); return; }
        const subjectData = await subjectRes.json();
        const treeData = await treeRes.json();
        setCourse(subjectData);
        setTree(treeData);
        if (enrollmentsRes && enrollmentsRes.ok) { const d = await enrollmentsRes.json(); setIsEnrolled(d.enrolled); }
      } catch { toast.error("Failed to load course"); } finally { setLoading(false); }
    };
    loadData();
  }, [id, navigate, isLiveId]);

  useEffect(() => {
    const onEnrolled = (event: Event) => {
      const ce = event as CustomEvent<{ courseId?: string }>;
      if (!ce.detail?.courseId || ce.detail.courseId === id) setIsEnrolled(true);
    };
    window.addEventListener("enrollmentUpdated", onEnrolled);
    return () => window.removeEventListener("enrollmentUpdated", onEnrolled);
  }, [id]);

  const handleEnrollClick = () => {
    if (!isLiveId) { navigate(`/learn/${id}`); return; }
    openEnrollModal(id!, course?.title || "this course");
  };

  const toggleSection = (i: number) => setOpenSections((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  const totalLessons = isLiveId ? tree.reduce((sum, s) => sum + (s.videos?.length || 0), 0) : course?.lessons || 0;

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (!course) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Gradient Header */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-accent-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {course.thumbnail && (
          <div className="absolute inset-0 opacity-10">
            <img src={course.thumbnail} alt="" className="w-full h-full object-cover blur-2xl scale-110" />
          </div>
        )}
        <div className="container relative py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">{course.title}</h1>
            <p className="text-white/70 mb-6 text-lg max-w-2xl">{course.description}</p>
            <div className="flex flex-wrap items-center gap-5 text-sm text-white/80 mb-8">
              {course.instructor && (
                <span className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center"><Users className="h-3.5 w-3.5 text-white" /></div>
                  {course.instructor}
                </span>
              )}
              {course.rating && (
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-warning text-warning" />{course.rating}</span>
              )}
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{course.duration || `${totalLessons * 15} mins`}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{totalLessons} lessons</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {isLiveId && isEnrolled ? (
                <Link to={`/learn/${course.id}`}>
                  <Button size="lg" className="rounded-full px-8 h-13 font-bold bg-white text-primary hover:bg-white/90 shadow-xl border-0">
                    <Play className="mr-2 h-4 w-4" /> Continue Learning
                  </Button>
                </Link>
              ) : (
                <>
                  <Button size="lg" className="rounded-full px-8 h-13 font-bold bg-white text-primary hover:bg-white/90 shadow-xl border-0" onClick={handleEnrollClick}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />{isLiveId ? "Enroll for Free" : "Start Learning"}
                  </Button>
                  <Link to={`/learn/${course.id}`}>
                    <Button variant="outline" size="lg" className="rounded-full px-8 h-13 font-bold text-white border-2 border-white/30 hover:bg-white hover:text-primary bg-transparent">
                      <Play className="mr-2 h-4 w-4" /> Preview
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* What You'll Learn */}
          {course.learnings && course.learnings.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <h2 className="text-xl font-black text-foreground mb-5 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> What You'll Learn
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.learnings.map((l: string) => (
                  <div key={l} className="flex items-start gap-3 rounded-2xl bg-accent/50 p-4 border border-accent hover:border-primary/20 transition-colors">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{l}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Curriculum */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xl font-black text-foreground mb-5">Course Curriculum</h2>
            {tree.length === 0 ? (
              <p className="text-muted-foreground text-sm">No content added to this course yet.</p>
            ) : (
              <div className="space-y-3">
                {tree.map((section, i) => (
                  <div key={section.id ?? i} className="rounded-2xl border border-border overflow-hidden bg-card">
                    <button onClick={() => toggleSection(i)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">{i + 1}</div>
                        <span className="font-bold text-foreground text-sm">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{section.videos?.length || 0} lessons</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${openSections.includes(i) ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {openSections.includes(i) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border">
                            {(section.videos || []).map((video) => (
                              <div key={video.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0">
                                {video.completed ? <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                                  : video.locked ? <BookOpen className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                                  : <Play className="h-4 w-4 text-primary flex-shrink-0" />}
                                <span className={`text-sm flex-1 ${video.locked ? "text-muted-foreground/50" : "text-foreground"}`}>{video.title}</span>
                                <span className="text-xs text-muted-foreground shrink-0">{Math.floor((video.duration_seconds || 600) / 60)} min</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            {course.thumbnail && (
              <img src={course.thumbnail} alt={course.title} className="w-full aspect-video object-cover" />
            )}
            <div className="p-6 space-y-4">
              <div className="text-3xl font-black text-foreground">Free</div>
              {isLiveId && isEnrolled ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-success font-medium bg-success/10 px-4 py-2.5 rounded-xl border border-success/20">
                    <CheckCircle2 className="h-4 w-4" /> You are enrolled
                  </div>
                  <Link to={`/learn/${course.id}`}><Button className="w-full rounded-xl h-12 font-bold">Continue Learning</Button></Link>
                </>
              ) : (
                <Button className="w-full rounded-xl h-12 font-bold shadow-md shadow-primary/20" onClick={handleEnrollClick}>
                  {isLiveId ? "Enroll Now – Free" : "Start Learning"}
                </Button>
              )}
              <div className="space-y-3 pt-3 border-t border-border text-sm text-muted-foreground">
                {[
                  ["Sections", tree.length || "—"],
                  ["Lessons", totalLessons],
                  ...(course.duration ? [["Duration", course.duration]] : []),
                  ["Level", "All Levels"],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between">
                    <span>{label}</span>
                    <span className="text-foreground font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default CourseDetail;
