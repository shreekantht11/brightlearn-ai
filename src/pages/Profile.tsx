import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Clock, User, Pencil, Save, X, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthModal } from "@/context/AuthModalContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useAuthModal();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", password: "" });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const [profileRes, enrollmentsRes] = await Promise.all([
          fetch("http://localhost:5000/api/users/profile", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/enroll/my-courses", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (profileRes.ok && enrollmentsRes.ok) {
          const profileData = await profileRes.json();
          const enrollmentsData = await enrollmentsRes.json();
          setProfile(profileData);
          setEditData({ name: profileData.name, password: "" });
          setEnrollments(enrollmentsData);
        } else if (profileRes.status === 401 || enrollmentsRes.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("storage"));
          navigate("/");
          openModal("login");
          toast.error("Session expired. Please log in again.");
        } else {
          toast.error("Failed to load profile data");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          name: editData.name, 
          ...(editData.password ? { password: editData.password } : {})
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile((prev: any) => ({ ...prev, name: data.user.name }));
        localStorage.setItem("user", JSON.stringify(data.user)); // Update local ref
        setIsEditing(false);
        setEditData(prev => ({ ...prev, password: "" })); // Clear password
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
       toast.error("Something went wrong");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/");
    toast.success("Successfully logged out");
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <RotateCcw className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const totalLessonsCompleted = enrollments.reduce((sum, e) => sum + (e.completedLessons || 0), 0);
  const totalCoursesEnrolled = enrollments.length;
  const totalPercentage = enrollments.length > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) / enrollments.length) 
    : 0;

  const stats = [
    { icon: BookOpen, label: "Courses Enrolled", value: totalCoursesEnrolled.toString() },
    { icon: CheckCircle2, label: "Lessons Completed", value: totalLessonsCompleted.toString() },
    { icon: Clock, label: "Avg Completion", value: `${totalPercentage}%` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="container py-10 max-w-5xl">
        <motion.div initial="hidden" animate="visible" className="space-y-10">
          
          {/* Profile Header */}
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
             <h1 className="text-3xl font-extrabold text-slate-900">My Profile</h1>
             <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full" onClick={handleLogout}>Log out</Button>
          </div>

          {/* Profile Card */}
          <motion.div variants={fadeUp} custom={0} className="rounded-3xl border border-slate-200 bg-white p-8 flex flex-col md:flex-row items-start md:items-center gap-8 shadow-sm relative overflow-hidden">
            <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-blue-500 to-primary flex shrink-0 items-center justify-center shadow-lg shadow-blue-500/20 text-white text-4xl font-black">
              {profile?.name?.charAt(0) || <User className="h-12 w-12" />}
            </div>
            
            <div className="flex-1 w-full space-y-4">
              {!isEditing ? (
                 <>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{profile?.name}</h2>
                    <p className="text-slate-500 font-medium">{profile?.email}</p>
                    <p className="text-xs text-slate-400 mt-2 bg-slate-100 inline-block px-3 py-1 rounded-full">Member since {new Date(profile?.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-full shadow-sm hover:bg-slate-50">
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                 </>
              ) : (
                 <div className="space-y-4 max-w-md w-full bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">Full Name</label>
                      <input 
                        type="text" 
                        value={editData.name} 
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">New Password <span className="text-xs font-normal text-slate-400">(leave blank to keep current)</span></label>
                      <input 
                        type="password" 
                        value={editData.password}
                        onChange={(e) => setEditData({...editData, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                       <Button onClick={handleUpdateProfile} className="rounded-full shadow-md bg-primary hover:bg-blue-700">
                         <Save className="mr-2 h-4 w-4" /> Save
                       </Button>
                       <Button onClick={() => { setIsEditing(false); setEditData({name: profile.name, password: ""}); }} variant="outline" className="rounded-full">
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
              <motion.div key={s.label} variants={fadeUp} custom={i + 1} className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4 text-primary group-hover:scale-110 transition-transform">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{s.value}</div>
                  <div className="text-sm font-medium text-slate-500">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Course Enrollments */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-8">My Enrolled Courses</h2>
            {enrollments.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No courses yet</h3>
                <p className="text-slate-500 mb-6">Explore the catalog and start your first course!</p>
                <Link to="/courses">
                   <Button className="rounded-full shadow-md">Browse Courses</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((e) => (
                  <CourseCard 
                    key={e.id} 
                    id={e.id.toString()}
                    title={e.title}
                    instructor="BrightLearn Platform"
                    thumbnail={e.thumbnail || `https://source.unsplash.com/random/800x600?${e.title}`}
                    duration={`${(e.totalLessons || 0) * 15} mins`}
                    lessons={e.totalLessons || 0}
                    progress={e.progressPercentage || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
