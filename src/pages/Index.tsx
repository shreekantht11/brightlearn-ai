import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Brain, BarChart3, Target, Star, ArrowRight, Loader2, Sparkles, Users, Award, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import ScrollToTop from "@/components/ScrollToTop";
import SkeletonCard from "@/components/SkeletonCard";
import { testimonials } from "@/lib/data";
import { useAuthModal } from "@/context/AuthModalContext";
import { useCatalogCourses } from "@/hooks/useCatalogCourses";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

const features = [
  { icon: BookOpen, title: "Structured Video Learning", desc: "High-quality video lessons organized into clear, progressive learning paths.", color: "from-primary to-primary-glow" },
  { icon: Brain, title: "AI Tutor Assistant", desc: "Get instant, context-aware help from our intelligent AI tutor anytime.", color: "from-info to-primary" },
  { icon: BarChart3, title: "Progress Tracking", desc: "Track your learning journey with detailed analytics and milestones.", color: "from-success to-info" },
  { icon: Target, title: "Smart Recommendations", desc: "AI-powered course suggestions tailored to your personal goals.", color: "from-warning to-destructive" },
];

const stats = [
  { value: "50+", label: "Courses", icon: BookOpen },
  { value: "10k+", label: "Learners", icon: Users },
  { value: "4.9", label: "Rating", icon: Star },
  { value: "95%", label: "Completion", icon: Award },
];

const Index = () => {
  const { openModal } = useAuthModal();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const { courses, loading } = useCatalogCourses();
  const popularCourses = courses.slice(0, 3);

  useEffect(() => {
    const checkLogin = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent-foreground" />
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Animated orbs */}
        <div className="absolute top-20 right-[15%] w-72 h-72 rounded-full bg-white/10 blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 left-[10%] w-96 h-96 rounded-full bg-accent-foreground/20 blur-3xl animate-float" />
        <div className="absolute top-1/2 right-[30%] w-40 h-40 rounded-full bg-primary-glow/30 blur-2xl animate-orb-pulse" />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div initial="hidden" animate="visible" className="max-w-2xl">
              <motion.div variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-white/90">AI-Powered Learning Platform</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1}
                className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.05]">
                Learn Smarter,
                <br />
                <span className="text-white/80">Not Harder</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2}
                className="text-lg md:text-xl text-white/70 max-w-lg mb-8 leading-relaxed">
                Your smartest path to mastery. AI-curated courses, interactive video lessons, and a built-in AI tutor — all in one place.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center gap-4">
                {!isLoggedIn && (
                  <Button size="lg" onClick={() => openModal("register")}
                    className="rounded-full px-10 h-14 text-lg font-bold bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/10 transition-all border-0 hover:scale-105">
                    Get Started Free
                  </Button>
                )}
                <Link to="/courses">
                  <Button variant="outline" size="lg"
                    className="rounded-full px-8 h-14 text-lg font-bold text-white hover:text-primary border-2 border-white/30 hover:bg-white transition-all bg-transparent backdrop-blur-sm">
                    Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right — Floating cards composition */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block h-[500px]"
            >
              {/* Main glass card */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 left-8 right-8 bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Python Fundamentals</p>
                    <p className="text-xs text-white/60">Dr. Sarah Chen</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-white/80"
                    initial={{ width: 0 }} animate={{ width: "68%" }}
                    transition={{ duration: 2, delay: 1 }} />
                </div>
                <p className="text-xs text-white/60 mt-2">68% Complete</p>
              </motion.div>

              {/* Floating badge 1 */}
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-4 right-0 bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-success/30 flex items-center justify-center">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Certificate</p>
                    <p className="text-[10px] text-white/60">Earned!</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating badge 2 */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-24 left-0 bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-warning/30 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">AI Tutor</p>
                    <p className="text-[10px] text-white/60">Online Now</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats mini card */}
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-8 right-4 left-16 bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-xl">
                <div className="grid grid-cols-3 gap-4">
                  {[{ v: "10k+", l: "Learners" }, { v: "50+", l: "Courses" }, { v: "4.9★", l: "Rating" }].map((s) => (
                    <div key={s.l} className="text-center">
                      <p className="text-lg font-black text-white">{s.v}</p>
                      <p className="text-[10px] text-white/60">{s.l}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-border bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-surface relative">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="container relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0}
              className="inline-block text-sm font-semibold text-accent-foreground bg-accent px-4 py-1.5 rounded-full mb-4">
              Why BrightLearn?
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Everything you need to <span className="text-gradient">learn faster</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-md mx-auto text-lg">
              AI-powered tools designed for the modern learner.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i}
                className="group rounded-2xl border border-border bg-card p-7 hover-lift hover-glow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative h-14 w-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="relative font-bold text-foreground mb-2 text-lg">{f.title}</h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="section-padding">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <motion.span variants={fadeUp} custom={0}
                className="inline-block text-sm font-semibold text-accent-foreground bg-accent px-4 py-1.5 rounded-full mb-4">
                Popular
              </motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-black text-foreground mb-2">
                Trending Courses
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg">
                Start learning from our most popular courses.
              </motion.p>
            </div>
            <motion.div variants={fadeUp} custom={3}>
              <Link to="/courses">
                <Button variant="outline" className="rounded-full px-6 group">
                  View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCourses.map((course) => (
                <CourseCard
                  key={course.id} id={course.id} title={course.title}
                  instructor={course.instructor} thumbnail={course.thumbnail}
                  duration={course.duration} lessons={course.lessons}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-surface relative">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="container relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0}
              className="inline-block text-sm font-semibold text-accent-foreground bg-accent px-4 py-1.5 rounded-full mb-4">
              Testimonials
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-black text-foreground">
              Loved by learners worldwide
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i}
                className="group rounded-2xl border border-border bg-card p-7 hover-lift relative overflow-hidden">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-accent-foreground/10 group-hover:text-accent-foreground/20 transition-colors" />
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-sm font-bold text-primary-foreground shadow-md">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full inline-block mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl bg-gradient-to-br from-primary via-primary to-accent-foreground p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to start learning?</h2>
              <p className="text-white/70 max-w-md mx-auto mb-8 text-lg">Join thousands of learners and unlock your potential with AI-powered education.</p>
              <div className="flex flex-wrap justify-center gap-4">
                {!isLoggedIn && (
                  <Button size="lg" onClick={() => openModal("register")}
                    className="rounded-full px-10 h-14 text-lg font-bold bg-white text-primary hover:bg-white/90 shadow-xl border-0 hover:scale-105 transition-transform">
                    Get Started Free
                  </Button>
                )}
                <Link to="/courses">
                  <Button variant="outline" size="lg"
                    className="rounded-full px-8 h-14 text-lg font-bold text-white border-2 border-white/30 hover:bg-white hover:text-primary bg-transparent transition-all">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
