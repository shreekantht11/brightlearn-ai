import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Brain, BarChart3, Target, Star, ArrowRight, Loader2, Sparkles, Users, Award, Quote, Play, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
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
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
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

      {/* Hero - Pastel aesthetic */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center pastel-hero-bg">
        {/* Decorative floating shapes */}
        <div className="absolute top-16 left-[8%] w-16 h-16 rounded-full bg-pastel-shape opacity-60 animate-float" />
        <div className="absolute top-32 right-[12%] w-10 h-10 bg-pastel-accent opacity-50 rotate-45 animate-float-slow" />
        <div className="absolute bottom-24 left-[15%] w-8 h-8 rounded-full bg-pastel-shape-alt opacity-40 animate-orb-pulse" />
        <div className="absolute top-[40%] left-[5%] w-6 h-6 border-2 border-primary/20 rounded-full animate-float-slow" />
        <div className="absolute bottom-[30%] right-[8%] w-12 h-12 border-2 border-pastel-accent rotate-12 rounded-lg animate-float" />
        <div className="absolute top-20 right-[35%] w-4 h-4 bg-warning/30 rounded-full animate-orb-pulse" />

        {/* Soft dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(hsl(234 60% 50%) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div initial="hidden" animate="visible" className="max-w-xl">
              <motion.div variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 mb-8">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary tracking-wide">AI-Powered Platform</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-foreground mb-4 leading-[1.1] tracking-tight">
                Bright{" "}
                <span className="font-black text-primary relative inline-block">
                  Learn
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 120 8" fill="none">
                    <path d="M2 6C20 2 40 2 60 4C80 6 100 3 118 2" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                  </svg>
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2}
                className="text-base md:text-lg text-muted-foreground max-w-md mb-10 leading-relaxed">
                Your smartest path to mastery. AI-curated courses, interactive video lessons, and a built-in AI tutor — all in one place.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center gap-4">
                {!isLoggedIn && (
                  <>
                    <Button size="lg" onClick={() => openModal("register")}
                      className="rounded-full px-8 h-12 text-base font-bold shadow-[var(--shadow-pastel)] hover:shadow-lg transition-all duration-300">
                      Apply now
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => openModal("login")}
                      className="rounded-full px-8 h-12 text-base font-medium border-2 border-border hover:bg-accent hover:border-primary/30 transition-all duration-300">
                      Log in
                    </Button>
                  </>
                )}
                <Link to="/courses">
                  <Button variant="outline" size="lg"
                    className="rounded-full px-8 h-12 text-base font-medium border-2 border-border hover:bg-accent hover:border-primary/30 transition-all duration-300">
                    Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Social icons */}
              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-3 mt-10">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="h-9 w-9 rounded-full bg-primary/8 border border-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Decorative blob with illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex items-center justify-center relative"
            >
              {/* Large blob background */}
              <div className="relative w-[480px] h-[480px]">
                <div className="absolute inset-0 blob-shape bg-gradient-to-br from-pastel-accent via-pastel-shape to-pastel-shape-alt animate-float-slow" />
                
                {/* Inner content card */}
                <div className="absolute inset-8 blob-shape-alt bg-gradient-to-br from-primary/10 via-primary/5 to-accent overflow-hidden flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="h-20 w-20 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                      <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Start Learning</h3>
                    <p className="text-sm text-muted-foreground mb-4">50+ courses ready for you</p>
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary">
                      <Play className="h-4 w-4 fill-primary" /> Watch Now
                    </div>
                  </div>
                </div>

                {/* Floating badge - top right */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-2 right-4 rounded-2xl bg-card border border-border px-4 py-3 shadow-[var(--shadow-pastel)]"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                      <Award className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">10k+</p>
                      <p className="text-[10px] text-muted-foreground">Learners</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating badge - bottom left */}
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-8 -left-6 rounded-2xl bg-card border border-border px-4 py-3 shadow-[var(--shadow-pastel)]"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">4.9/5</p>
                      <p className="text-[10px] text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-border bg-card">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {stats.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-[var(--shadow-pastel)] transition-shadow duration-300">
                <div className="h-12 w-12 rounded-xl bg-pastel border border-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-black text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-background relative">
        <div className="container relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.span variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 rounded-full bg-pastel border border-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-4">
              <Sparkles className="h-3 w-3" /> Why BrightLearn?
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-black text-foreground mb-3">
              Everything you need to <span className="text-primary">learn faster</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-md mx-auto">
              AI-powered tools designed for the modern learner.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i}
                className="group rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-[var(--shadow-pastel)] hover:border-primary/20 transition-all duration-300">
                <div className="h-14 w-14 rounded-2xl bg-pastel border border-primary/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="section-padding bg-pastel/30">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <motion.span variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-3">
                Popular
              </motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-black text-foreground mb-2">
                Trending Courses
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground">
                Start learning from our most popular courses.
              </motion.p>
            </div>
            <motion.div variants={fadeUp} custom={3}>
              <Link to="/courses">
                <Button variant="outline" className="rounded-full px-6 border-2 group hover:border-primary/30">
                  View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <section className="section-padding bg-background relative">
        <div className="container relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.span variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 rounded-full bg-pastel border border-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-4">
              Testimonials
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-black text-foreground">
              Loved by learners worldwide
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i}
                className="group rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-[var(--shadow-pastel)] hover:border-primary/20 transition-all duration-300 relative">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/8" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-pastel-accent flex items-center justify-center text-sm font-bold text-primary border border-primary/10">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
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
            className="relative rounded-3xl bg-gradient-to-br from-pastel via-pastel-accent to-pastel-shape-alt p-12 md:p-16 text-center overflow-hidden border border-primary/10">
            {/* Decorative shapes */}
            <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-primary/5 animate-float" />
            <div className="absolute bottom-8 right-12 w-14 h-14 bg-primary/5 rotate-45 rounded-lg animate-float-slow" />
            
            <div className="relative max-w-xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4">Ready to start learning?</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">Join thousands of learners and unlock your potential with AI-powered education.</p>
              <div className="flex flex-wrap justify-center gap-3">
                {!isLoggedIn && (
                  <Button size="lg" onClick={() => openModal("register")}
                    className="rounded-full px-8 h-12 text-base font-bold shadow-[var(--shadow-pastel)] transition-all">
                    Get Started Free
                  </Button>
                )}
                <Link to="/courses">
                  <Button variant="outline" size="lg"
                    className="rounded-full px-6 h-12 text-base font-medium border-2 border-border hover:bg-card hover:border-primary/30 transition-all">
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
