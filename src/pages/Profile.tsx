import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Clock, User, Pencil, Save, X, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import ProgressRing from "@/components/ProgressRing";
import ScrollToTop from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthModal } from "@/context/AuthModalContext";
import { API_URL } from "@/lib/api-config";

type ProfileData = { name: string; email: string; created_at: string; };
type Enrollment = { id: number; title: string; thumbnail?: string; totalLessons?: number; completedLessons?: number; progressPercentage?: number; };

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useAuthModal();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", password: "" });

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("token"); localStorage.removeItem("refreshToken"); localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage")); navigate("/"); openModal("login");
      toast.error("Session expired. Please log in again.");
    };
    const fetchEnrollments = async (authToken: string) => {
      const res = await fetch(`${API_URL}/api/enroll/my-courses`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (res.ok) { const d = await res.json(); setEnrollments(d); return d; }
      if (res.status === 401) handleUnauthorized(); else toast.error("Failed to load enrollments");
      return null;
    };
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); openModal("login"); return; }
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/"); openModal("login"); return; }
      try {
        const profileRes = await fetch(`${API_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const enrollmentsData = await fetchEnrollments(token);
          if (!enrollmentsData) return;
          setProfile(profileData);
          setEditData({ name: profileData.name, password: "" });
        } else if (profileRes.status === 401) handleUnauthorized();
        else toast.error("Failed to load profile data");
      } catch { toast.error("Error connecting to server"); } finally { setLoading(false); }
    };
    fetchData();
    const handleEnrollmentUpdated = async () => {
      const latestToken = localStorage.getItem("token");
      if (!latestToken) { navigate("/"); openModal("login"); return; }
      await fetchEnrollments(latestToken);
    };
    window.addEventListener("enrollmentUpdated", handleEnrollmentUpdated);
    return () => window.removeEventListener("enrollmentUpdated", handleEnrollmentUpdated);
  }, [navigate, openModal]);

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editData.name, ...(editData.password ? { password: editData.password } : {}) })
      });
      if (response.ok) {
        const data = await response.json();
        setProfile((prev) => prev ? { ...prev, name: data.user.name } : prev);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsEditing(false); setEditData(prev => ({ ...prev, password: "" }));
        toast.success("Profile updated successfully!");
      } else toast.error("Failed to update profile");
    } catch { toast.error("Something went wrong"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("refreshToken"); localStorage.removeItem("user");
    navigate("/"); toast.success("Successfully logged out");
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <RotateCcw className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const totalLessonsCompleted = enrollments.reduce((sum, e) => sum + (e.completedLessons || 0), 0);
  const totalCoursesEnrolled = enrollments.length;
  const totalPercentage = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) / enrollments.length) : 0;

  const stats = [
    { icon: BookOpen, label: "Courses Enrolled", value: totalCoursesEnrolled.toString() },
    { icon: CheckCircle2, label: "Lessons Completed", value: totalLessonsCompleted.toString() },
    { icon: Clock, label: "Avg Completion", value: `${totalPercentage}%`, showRing: true, ringValue: totalPercentage },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {/* Gradient banner */}
      <div className="h-48 bg-gradient-to-br from-primary via-primary to-accent-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="container max-w-5xl -mt-20 relative z-10 pb-10">
        <motion.div initial="hidden" animate="visible" className="space-y-8">

          {/* Profile Card */}
          <motion.div variants={fadeUp} custom={0} className="rounded-2xl border border-border bg-card p-8 flex flex-col md:flex-row items-start md:items-center gap-8 shadow-lg">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex shrink-0 items-center justify-center shadow-xl shadow-primary/20 text-white text-4xl font-black">
              {profile?.name?.charAt(0) || <User className="h-10 w-10" />}
            </div>

            <div className="flex-1 w-full space-y-4">
              {!isEditing ? (
                <>
                  <div>
                    <h2 className="text-2xl font-black text-foreground">{profile?.name}</h2>
                    <p className="text-muted-foreground font-medium">{profile?.email}</p>
                    <p className="text-xs text-muted-foreground mt-2 bg-muted inline-block px-3 py-1 rounded-full">
                      Member since {new Date(profile?.created_at || "").toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-full">
                      <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                    <Button variant="outline" className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
                      Log out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4 max-w-md w-full bg-surface p-6 rounded-2xl border border-border">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">Full Name</label>
                    <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">New Password <span className="text-xs font-normal text-muted-foreground">(leave blank to keep current)</span></label>
                    <input type="password" value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} placeholder="••••••••"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleUpdateProfile} className="rounded-full shadow-md">
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                    <Button onClick={() => { setIsEditing(false); setEditData({ name: profile?.name || "", password: "" }); }} variant="outline" className="rounded-full">
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} custom={i + 1}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm group hover-lift">
                <div className="relative z-10">
                  {s.showRing ? (
                    <div className="mx-auto mb-3">
                      <ProgressRing value={s.ringValue || 0} size={64} />
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-3 text-accent-foreground group-hover:scale-110 transition-transform">
                      <s.icon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="text-3xl font-black text-foreground mb-1">{s.value}</div>
                  <div className="text-sm font-medium text-muted-foreground">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Course Enrollments */}
          <div>
            <h2 className="text-2xl font-black text-foreground mb-6 mt-4">My Enrolled Courses</h2>
            {enrollments.length === 0 ? (
              <div className="text-center p-12 bg-card rounded-2xl border border-border border-dashed">
                <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No courses yet</h3>
                <p className="text-muted-foreground mb-6">Explore the catalog and start your first course!</p>
                <Link to="/courses"><Button className="rounded-full shadow-md px-8">Browse Courses</Button></Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((e) => (
                  <CourseCard
                    key={e.id} id={e.id.toString()} title={e.title} instructor="BrightLearn Platform"
                    thumbnail={e.thumbnail || `https://source.unsplash.com/random/800x600?${e.title}`}
                    duration={`${(e.totalLessons || 0) * 15} mins`} lessons={e.totalLessons || 0} progress={e.progressPercentage || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Profile;
