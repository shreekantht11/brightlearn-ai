import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Clock, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

const Profile = () => {
  const stats = [
    { icon: BookOpen, label: "Courses Enrolled", value: "4" },
    { icon: CheckCircle2, label: "Lessons Completed", value: "23" },
    { icon: Clock, label: "Completion", value: "38%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <motion.div initial="hidden" animate="visible" className="space-y-10">
          {/* Profile Card */}
          <motion.div variants={fadeUp} custom={0} className="rounded-2xl border border-border bg-card p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-accent flex items-center justify-center">
              <User className="h-10 w-10 text-accent-foreground" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-foreground">John Doe</h1>
              <p className="text-muted-foreground text-sm">john@example.com</p>
              <p className="text-xs text-muted-foreground mt-1">Member since March 2026</p>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} custom={i + 1} className="rounded-2xl border border-border bg-card p-6 text-center hover-lift">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
                  <s.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Recent Courses */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-6">Recent Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((c) => (
                <CourseCard key={c.id} {...c} progress={Math.floor(Math.random() * 60 + 10)} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
