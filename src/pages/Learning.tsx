import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Lock, Play, Menu, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/VideoPlayer";
import AIChatPanel from "@/components/AIChatPanel";
import { courses as mockCourses } from "@/lib/data";
import { toast } from "sonner";

// A fixed demo YouTube video ID used for mock/static courses
const DEMO_VIDEO_ID = "dQw4w9WgXcQ";

const Learning = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Detect if it's a live DB course (numeric) or mock course (string slug)
  const isLiveId = /^\d+$/.test(id || "");

  const [tree, setTree] = useState<any[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [completedVideoIds, setCompletedVideoIds] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const saveProgressTimer = useRef<ReturnType<typeof setTimeout>>();

  const token = localStorage.getItem("token");

  const allVideos = tree.flatMap((s) => s.videos || []);
  const currentIndex = allVideos.findIndex((v) => v.id === currentVideo?.id);

  const fetchProgress = useCallback(async (videoId: number) => {
    if (!token || !isLiveId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/progress/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
      }
    } catch { /* ignore */ }
  }, [token, isLiveId]);

  const saveProgress = useCallback(async (videoId: any, lastPositionSeconds: number, isCompleted: boolean) => {
    if (!token || !isLiveId) {
      // For mock courses just mark in local state
      if (isCompleted && !completedVideoIds.includes(videoId)) {
        setCompletedVideoIds(prev => [...prev, videoId]);
        toast.success("Lesson completed! Great job! 🎉");
      }
      return;
    }
    try {
      await fetch(`http://localhost:5000/api/progress/videos/${videoId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ last_position_seconds: lastPositionSeconds, is_completed: isCompleted })
      });
      if (isCompleted && !completedVideoIds.includes(videoId)) {
        setCompletedVideoIds(prev => [...prev, videoId]);
        toast.success("Lesson completed! Great job! 🎉");
      }
    } catch { /* ignore */ }
  }, [token, completedVideoIds, isLiveId]);

  useEffect(() => {
    const loadData = async () => {
      if (!isLiveId) {
        // ---- MOCK COURSE PATH ----
        const found = mockCourses.find((c) => c.id === id);
        if (!found) { toast.error("Course not found"); navigate("/courses"); return; }

        setCourseTitle(found.title);
        const mockTree = found.curriculum.map((section, si) => ({
          id: si,
          title: section.title,
          videos: section.lessons.map((l, li) => ({
            id: `${si}-${li}`,
            title: l.title,
            youtube_url: DEMO_VIDEO_ID,
            duration_seconds: 600,
            locked: l.locked,
            completed: l.completed,
          })),
        }));
        setTree(mockTree);
        const firstVideo = mockTree[0]?.videos?.[0];
        if (firstVideo) setCurrentVideo(firstVideo);
        setLoading(false);
        return;
      }

      // ---- LIVE DB COURSE PATH ----
      if (!token) { navigate("/login"); return; }

      try {
        const [subjectRes, treeRes] = await Promise.all([
          fetch(`http://localhost:5000/api/subjects/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/subjects/${id}/tree`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!subjectRes.ok) { toast.error("Course not found"); navigate("/courses"); return; }

        const [subjectData, treeData] = await Promise.all([subjectRes.json(), treeRes.json()]);

        setCourseTitle(subjectData.title);
        setTree(treeData);

        const firstVideo = treeData[0]?.videos?.[0];
        if (firstVideo) {
          setCurrentVideo(firstVideo);
          await fetchProgress(firstVideo.id);

          // Bulk-load completed video IDs
          const flatVideos = treeData.flatMap((s: any) => s.videos || []);
          const completedIds: number[] = [];
          await Promise.all(flatVideos.map(async (v: any) => {
            const pRes = await fetch(`http://localhost:5000/api/progress/videos/${v.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (pRes.ok) {
              const pData = await pRes.json();
              if (pData.progress?.is_completed) completedIds.push(v.id);
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

  const handleSelectVideo = async (video: any) => {
    if (video.locked) return;
    setCurrentVideo(video);
    setProgress(null);
    if (isLiveId) await fetchProgress(video.id);
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
    if (currentVideo) saveProgress(currentVideo.id, 0, true);
  };

  const progressPercent = allVideos.length > 0
    ? Math.round((completedVideoIds.length / allVideos.length) * 100)
    : 0;

  const getYouTubeId = (url: string) => {
    if (!url) return DEMO_VIDEO_ID;
    if (url.length === 11 && !url.includes("/")) return url; // already an ID
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : DEMO_VIDEO_ID;
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-4 gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link to={`/course/${id}`} className="text-sm font-semibold text-foreground truncate">{courseTitle}</Link>
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
                {tree.map((section) => (
                  <div key={section.id}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">{section.title}</h3>
                    <div className="space-y-0.5">
                      {(section.videos || []).map((video: any) => {
                        const isDone = completedVideoIds.includes(video.id);
                        const isCurrent = currentVideo?.id === video.id;
                        const isLocked = video.locked;
                        return (
                          <button
                            key={video.id}
                            onClick={() => handleSelectVideo(video)}
                            disabled={isLocked}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                              isCurrent
                                ? "bg-accent text-accent-foreground font-medium"
                                : isLocked
                                ? "text-muted-foreground/40 cursor-not-allowed"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : isLocked ? (
                              <Lock className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <Play className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                            <span className="truncate flex-1">{video.title}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{Math.floor((video.duration_seconds || 600) / 60)}m</span>
                          </button>
                        );
                      })}
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
            {currentVideo ? (
              <>
                <VideoPlayer
                  videoId={getYouTubeId(currentVideo.youtube_url || DEMO_VIDEO_ID)}
                  title={currentVideo.title}
                  startAt={progress?.last_position_seconds || 0}
                  onTimeUpdate={handleTimeUpdate}
                />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">{currentVideo.title}</h1>
                    {currentVideo.description && (
                      <p className="text-muted-foreground text-sm">{currentVideo.description}</p>
                    )}
                  </div>
                  {!completedVideoIds.includes(currentVideo.id) && (
                    <Button variant="outline" size="sm" className="rounded-xl shrink-0" onClick={handleMarkComplete}>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Complete
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => currentIndex > 0 && handleSelectVideo(allVideos[currentIndex - 1])}
                    disabled={currentIndex <= 0}
                    className="rounded-xl"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <Button
                    onClick={() => currentIndex < allVideos.length - 1 && handleSelectVideo(allVideos[currentIndex + 1])}
                    disabled={currentIndex >= allVideos.length - 1}
                    className="rounded-xl"
                  >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-muted-foreground">No videos available in this course yet.</div>
            )}
          </div>
        </main>
      </div>

      <AIChatPanel />
    </div>
  );
};

export default Learning;
