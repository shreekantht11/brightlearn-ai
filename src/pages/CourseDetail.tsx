import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, BookOpen, ChevronDown, CheckCircle2, Play, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { courses as mockCourses } from "@/lib/data";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Determine if this is a live DB course (numeric id) or a mock course (slug string)
  const isLiveId = /^\d+$/.test(id || "");

  const [course, setCourse] = useState<any>(null);
  const [tree, setTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openSections, setOpenSections] = useState<number[]>([0]);

  useEffect(() => {
    const loadData = async () => {
      if (!isLiveId) {
        // ---- MOCK COURSE PATH ----
        const found = mockCourses.find((c) => c.id === id);
        if (!found) {
          toast.error("Course not found");
          navigate("/courses");
          return;
        }
        setCourse({
          id: found.id,
          title: found.title,
          description: found.description,
          instructor: found.instructor,
          duration: found.duration,
          lessons: found.lessons,
          rating: found.rating,
          thumbnail: found.thumbnail,
          learnings: found.learnings,
        });
        setTree(found.curriculum.map((section, i) => ({
          id: i,
          title: section.title,
          videos: section.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            duration_seconds: 600,
            completed: l.completed,
            locked: l.locked,
          })),
        })));
        setLoading(false);
        return;
      }

      // ---- LIVE DB COURSE PATH ----
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      try {
        const [subjectRes, treeRes, enrollmentsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/subjects/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/subjects/${id}/tree`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/users/enrollments`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!subjectRes.ok) { toast.error("Course not found"); navigate("/courses"); return; }

        const [subjectData, treeData, enrollmentsData] = await Promise.all([
          subjectRes.json(), treeRes.json(), enrollmentsRes.json()
        ]);

        setCourse(subjectData);
        setTree(treeData);
        const alreadyEnrolled = enrollmentsData.some((e: any) => e.subject_id === parseInt(id!));
        setIsEnrolled(alreadyEnrolled);
      } catch (err) {
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, isLiveId]);

  const handleEnroll = async () => {
    if (!isLiveId) {
      // Mock course — just navigate to learning
      navigate(`/learn/${id}`);
      return;
    }
    setEnrolling(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/subjects/${id}/enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIsEnrolled(true);
        toast.success("Successfully enrolled! Start learning now.");
      } else {
        toast.error("Enrollment failed. Please login first.");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setEnrolling(false);
    }
  };

  const toggleSection = (i: number) => {
    setOpenSections((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  const totalLessons = isLiveId
    ? tree.reduce((sum, s) => sum + (s.videos?.length || 0), 0)
    : course?.lessons || 0;

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!course) return null;

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
              {course.instructor && <span className="font-medium text-foreground">{course.instructor}</span>}
              {course.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{course.rating}
                </span>
              )}
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration || `${totalLessons * 15} mins`}</span>
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{totalLessons} lessons</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {isLiveId && isEnrolled ? (
                <Link to={`/learn/${course.id}`}>
                  <Button size="lg" className="rounded-xl px-8 h-12 font-semibold">
                    <Play className="mr-2 h-4 w-4" /> Continue Learning
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="rounded-xl px-8 h-12 font-semibold"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    {isLiveId ? "Enroll for Free" : "Start Learning"}
                  </Button>
                  <Link to={`/learn/${course.id}`}>
                    <Button variant="outline" size="lg" className="rounded-xl px-8 h-12 font-semibold">
                      <Play className="mr-2 h-4 w-4" /> Preview
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          
          {/* What You'll Learn — mock courses have this */}
          {course.learnings && course.learnings.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <h2 className="text-xl font-bold text-foreground mb-4">What You'll Learn</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.learnings.map((l: string) => (
                  <div key={l} className="flex items-start gap-3 rounded-xl bg-accent/50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{l}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Curriculum */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xl font-bold text-foreground mb-4">Course Curriculum</h2>
            {tree.length === 0 ? (
              <p className="text-muted-foreground text-sm">No content added to this course yet.</p>
            ) : (
              <div className="space-y-3">
                {tree.map((section, i) => (
                  <div key={section.id ?? i} className="rounded-2xl border border-border overflow-hidden">
                    <button
                      onClick={() => toggleSection(i)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-semibold text-foreground text-sm">{section.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{section.videos?.length || 0} lessons</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openSections.includes(i) ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    {openSections.includes(i) && (
                      <div className="border-t border-border">
                        {(section.videos || []).map((video: any) => (
                          <div key={video.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border last:border-0">
                            {video.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : video.locked ? (
                              <BookOpen className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                            ) : (
                              <Play className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                            <span className={`text-sm flex-1 ${video.locked ? "text-muted-foreground/50" : "text-foreground"}`}>
                              {video.title}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {Math.floor((video.duration_seconds || 600) / 60)} min
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-4">
            {course.thumbnail && (
              <img src={course.thumbnail} alt={course.title} className="rounded-xl w-full aspect-video object-cover" />
            )}
            <div className="text-2xl font-bold text-foreground">Free</div>
            {isLiveId && isEnrolled ? (
              <>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-2 rounded-xl border border-green-200">
                  <CheckCircle2 className="h-4 w-4" /> You are enrolled
                </div>
                <Link to={`/learn/${course.id}`}>
                  <Button className="w-full rounded-xl h-12 font-semibold">Continue Learning</Button>
                </Link>
              </>
            ) : (
              <Button className="w-full rounded-xl h-12 font-semibold" onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLiveId ? "Enroll Now – Free" : "Start Learning"}
              </Button>
            )}
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Sections</span>
                <span className="text-foreground font-medium">{tree.length || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Lessons</span>
                <span className="text-foreground font-medium">{totalLessons}</span>
              </div>
              {course.duration && (
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="text-foreground font-medium">{course.duration}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Level</span>
                <span className="text-foreground font-medium">All Levels</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
