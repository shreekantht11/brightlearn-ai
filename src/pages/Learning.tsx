import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Home,
  BookOpen,
  Loader2,
  Lock,
  Menu,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/VideoPlayer";
import { courses as mockCourses } from "@/lib/data";
import { toast } from "sonner";
import { API_URL } from "@/lib/api-config";

const DEMO_VIDEO_ID = "dQw4w9WgXcQ";

type Lesson = {
  id: number | string;
  title: string;
  description?: string;
  youtube_url?: string;
  duration_seconds?: number;
  locked?: boolean;
  completed?: boolean;
};

type Section = {
  id: number | string;
  title: string;
  videos?: Lesson[];
};

type ProgressData = {
  last_position_seconds?: number;
  is_completed?: boolean;
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return "10 min lesson";
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins} min lesson`;
};

const getYouTubeId = (url?: string) => {
  if (!url) return DEMO_VIDEO_ID;
  if (url.length === 11 && !url.includes("/")) return url;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : DEMO_VIDEO_ID;
};

const Learning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLiveId = /^\d+$/.test(id || "");

  const [tree, setTree] = useState<Section[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [currentVideo, setCurrentVideo] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [completedVideoIds, setCompletedVideoIds] = useState<Array<number | string>>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const saveProgressTimer = useRef<ReturnType<typeof setTimeout>>();

  const token = localStorage.getItem("token");
  const allVideos = tree.flatMap((section) => section.videos || []);
  const currentIndex = allVideos.findIndex((video) => video.id === currentVideo?.id);

  const fetchProgress = useCallback(async (videoId: number) => {
    if (!token || !isLiveId) return;
    try {
      const res = await fetch(`${API_URL}/api/progress/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
      }
    } catch {
      // keep UI usable even if progress endpoint fails
    }
  }, [token, isLiveId]);

  const saveProgress = useCallback(async (videoId: number | string, lastPositionSeconds: number, isCompleted: boolean) => {
    if (!token || !isLiveId) {
      if (isCompleted && !completedVideoIds.includes(videoId)) {
        setCompletedVideoIds((prev) => [...prev, videoId]);
        toast.success("Lesson completed! Great job!");
      }
      return;
    }

    try {
      await fetch(`${API_URL}/api/progress/videos/${videoId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          last_position_seconds: lastPositionSeconds,
          is_completed: isCompleted,
        }),
      });

      if (isCompleted && !completedVideoIds.includes(videoId)) {
        setCompletedVideoIds((prev) => [...prev, videoId]);
        toast.success("Lesson completed! Great job!");
      }
    } catch {
      // keep playback flow moving even if progress save fails
    }
  }, [token, completedVideoIds, isLiveId]);

  useEffect(() => {
    const loadData = async () => {
      if (!isLiveId) {
        const found = mockCourses.find((course) => course.id === id);
        if (!found) {
          toast.error("Course not found");
          navigate("/courses");
          return;
        }

        setCourseTitle(found.title);
        const mockTree: Section[] = found.curriculum.map((section, sectionIndex) => ({
          id: sectionIndex,
          title: section.title,
          videos: section.lessons.map((lesson, lessonIndex) => ({
            id: `${sectionIndex}-${lessonIndex}`,
            title: lesson.title,
            description: "Preview lesson from the course curriculum.",
            youtube_url: DEMO_VIDEO_ID,
            duration_seconds: 600,
            locked: lesson.locked,
            completed: lesson.completed,
          })),
        }));

        setTree(mockTree);
        setCurrentVideo(mockTree[0]?.videos?.[0] || null);
        setLoading(false);
        return;
      }

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const [subjectRes, treeRes] = await Promise.all([
          fetch(`${API_URL}/api/subjects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/subjects/${id}/tree`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        if (!subjectRes.ok) {
          toast.error("Course not found");
          navigate("/courses");
          return;
        }

        const [subjectData, treeData] = await Promise.all([subjectRes.json(), treeRes.json()]);
        setCourseTitle(subjectData.title);
        setTree(treeData);

        const firstVideo = treeData[0]?.videos?.[0] || null;
        setCurrentVideo(firstVideo);

        if (firstVideo) {
          await fetchProgress(firstVideo.id as number);

          const flatVideos = treeData.flatMap((section: Section) => section.videos || []);
          const completedIds: Array<number | string> = [];

          await Promise.all(flatVideos.map(async (video: Lesson) => {
            const pRes = await fetch(`${API_URL}/api/progress/videos/${video.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (pRes.ok) {
              const pData = await pRes.json();
              if (pData.progress?.is_completed) {
                completedIds.push(video.id);
              }
            }
          }));

          setCompletedVideoIds(completedIds);
        }
      } catch {
        toast.error("Failed to load course content");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, token, isLiveId, fetchProgress]);

  const handleSelectVideo = async (video: Lesson) => {
    if (video.locked) return;
    setCurrentVideo(video);
    setProgress(null);
    if (isLiveId && typeof video.id === "number") {
      await fetchProgress(video.id);
    }
  };

  const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
    if (!currentVideo) return;

    clearTimeout(saveProgressTimer.current);
    saveProgressTimer.current = setTimeout(() => {
      const isCompleted = duration > 0 && currentTime / duration >= 0.9;
      saveProgress(currentVideo.id, Math.floor(currentTime), isCompleted);
    }, 5000);
  }, [currentVideo, saveProgress]);

  const handleMarkComplete = () => {
    if (currentVideo) {
      saveProgress(currentVideo.id, progress?.last_position_seconds || 0, true);
    }
  };

  const progressPercent = allVideos.length > 0
    ? Math.round((completedVideoIds.length / allVideos.length) * 100)
    : 0;

  const getSectionProgress = (section: Section) => {
    const videos = section.videos || [];
    if (videos.length === 0) return 0;
    const completed = videos.filter((video) => completedVideoIds.includes(video.id)).length;
    return Math.round((completed / videos.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-xl">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl p-2 transition-colors hover:bg-muted">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link
          to={`/course/${id}`}
          className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/20 hover:bg-accent hover:text-foreground sm:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>

        <div className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
          <Link to="/courses" className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
            <Home className="h-3.5 w-3.5" /> Courses
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to={`/course/${id}`} className="max-w-[150px] truncate text-muted-foreground transition-colors hover:text-foreground">
            {courseTitle}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="max-w-[200px] truncate font-semibold text-foreground">{currentVideo?.title || "Course content"}</span>
        </div>

        <Link
          to={`/course/${id}`}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/20 hover:bg-accent hover:text-foreground sm:hidden"
          aria-label="Back to course"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="min-w-0 sm:hidden">
          <p className="truncate text-sm font-semibold text-foreground">{courseTitle}</p>
          <p className="truncate text-xs text-muted-foreground">{currentVideo?.title || "Course content"}</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">{progressPercent}% complete</span>
          <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-muted sm:block">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-shrink-0 overflow-y-auto border-r border-border bg-card"
            >
              <div className="space-y-5 p-4">
                <div className="rounded-[1.5rem] border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Learning progress</p>
                  <h2 className="mt-2 text-lg font-black text-foreground">{courseTitle}</h2>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {completedVideoIds.length} of {allVideos.length} lessons complete
                  </p>
                </div>

                {tree.map((section) => {
                  const sectionProgress = getSectionProgress(section);
                  return (
                    <div key={section.id}>
                      <div className="mb-2 flex items-center justify-between px-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{section.title}</h3>
                        <span className="text-[10px] font-semibold text-primary">{sectionProgress}%</span>
                      </div>
                      <div className="mx-2 mb-3 h-1 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary/70"
                          initial={{ width: 0 }}
                          animate={{ width: `${sectionProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>

                      <div className="space-y-1">
                        {(section.videos || []).map((video) => {
                          const isDone = completedVideoIds.includes(video.id);
                          const isCurrent = currentVideo?.id === video.id;
                          const isLocked = video.locked;

                          return (
                            <button
                              key={video.id}
                              onClick={() => handleSelectVideo(video)}
                              disabled={isLocked}
                              className={`w-full rounded-2xl px-3 py-3 text-left text-sm transition-all ${
                                isCurrent
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : isLocked
                                    ? "cursor-not-allowed text-muted-foreground/40"
                                    : "text-foreground hover:bg-muted"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 shrink-0">
                                  {isDone ? (
                                    <CheckCircle2 className={`h-4 w-4 ${isCurrent ? "text-primary-foreground" : "text-emerald-500"}`} />
                                  ) : isLocked ? (
                                    <Lock className="h-4 w-4" />
                                  ) : (
                                    <Play className={`h-4 w-4 ${isCurrent ? "text-primary-foreground" : "text-primary"}`} />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">{video.title}</p>
                                  <div className={`mt-1 flex items-center gap-2 text-xs ${isCurrent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                    <Clock className="h-3 w-3" />
                                    {formatDuration(video.duration_seconds)}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl space-y-6 p-6">
            {currentVideo ? (
              <>
                <VideoPlayer
                  videoId={getYouTubeId(currentVideo.youtube_url)}
                  title={currentVideo.title}
                  startAt={progress?.last_position_seconds || 0}
                  durationLabel={formatDuration(currentVideo.duration_seconds)}
                  eyebrow={`Lesson ${currentIndex + 1} of ${allVideos.length}`}
                  onTimeUpdate={handleTimeUpdate}
                />

                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Active lesson
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(currentVideo.duration_seconds)}
                      </div>
                    </div>

                    <h1 className="mt-4 text-2xl font-black text-foreground sm:text-3xl">{currentVideo.title}</h1>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                      {currentVideo.description || "This lesson is part of your live course track. Watch the video, complete the lesson, and continue through the course in sequence."}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Course progress</p>
                        <p className="mt-2 text-2xl font-black text-foreground">{progressPercent}%</p>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current lesson</p>
                        <p className="mt-2 text-2xl font-black text-foreground">{currentIndex + 1}</p>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lessons complete</p>
                        <p className="mt-2 text-2xl font-black text-foreground">{completedVideoIds.length}</p>
                      </div>
                    </div>
                  </div>

                  {!completedVideoIds.includes(currentVideo.id) && (
                    <Button
                      variant="outline"
                      className="h-12 rounded-xl px-5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={handleMarkComplete}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Complete
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Keep moving</p>
                    <p className="mt-2 text-sm text-muted-foreground">Use the lesson controls to continue through the course in order.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => currentIndex > 0 && handleSelectVideo(allVideos[currentIndex - 1])}
                      disabled={currentIndex <= 0}
                      className="rounded-xl"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      onClick={() => currentIndex < allVideos.length - 1 && handleSelectVideo(allVideos[currentIndex + 1])}
                      disabled={currentIndex >= allVideos.length - 1}
                      className="rounded-xl"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-border bg-card p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-accent text-accent-foreground">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h1 className="mt-6 text-2xl font-black text-foreground">Course content is being prepared</h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                  This live course is available for enrollment, but the lesson videos are not seeded in this environment yet.
                  Once curriculum is added, this page will automatically become the full learning player for the course.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to={`/course/${id}`}>
                    <Button variant="outline" className="rounded-xl">
                      Back to Course
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button className="rounded-xl">
                      Browse Other Courses
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Learning;
