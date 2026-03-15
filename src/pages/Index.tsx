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
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/5 backdrop-blur-sm px-4 py-2 mb-8">
                <Sparkles className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-white/90 tracking-wide">AI-Powered Learning Platform</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-none tracking-[-0.02em]">
                BrightLearn
              </motion.h1>

              <motion.p variants={fadeUp} custom={2}
                className="text-base md:text-lg text-white/80 max-w-lg mb-10 leading-relaxed">
                Your smartest path to mastery. AI-curated courses, interactive video lessons, and a built-in AI tutor, all in one place.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center gap-4">
                {!isLoggedIn && (
                  <Button size="lg" onClick={() => openModal("register")}
                    className="rounded-xl px-9 h-12 text-base font-bold bg-white text-primary hover:bg-white/95 shadow-[0_0_24px_rgba(255,255,255,0.25)] border-0 hover:shadow-[0_0_32px_rgba(255,255,255,0.3)] transition-all duration-300">
                    Get Started Free
                  </Button>
                )}
                <Link to="/courses">
                  <Button variant="outline" size="lg"
                    className="rounded-xl px-8 h-12 text-base font-bold text-white border-2 border-white/50 hover:bg-white hover:text-primary transition-all duration-300 bg-transparent">
                    Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right - Learning Workspace card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="mx-6 rounded-[1.75rem] border border-white/20 bg-slate-900/50 p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] backdrop-blur-xl ring-1 ring-white/10">
                <div className="mb-5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70">
                    <Sparkles className="h-3 w-3 text-warning" />
                    Learning Workspace
                  </div>
                  <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
                    Guided lessons
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-white/10 bg-slate-950/50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Featured Topic</p>
                      <h3 className="mt-1.5 text-xl font-black text-white tracking-tight">Python Essentials</h3>
                      <p className="mt-1 text-sm text-white/65 leading-snug">A calm, guided path through fundamentals, examples, and smart study support.</p>
                    </div>
                    <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Workspace</p>
                      <p className="mt-0.5 text-sm font-semibold text-white">Notes + AI</p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
                    <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                      <div className="h-full rounded-lg bg-slate-950/60 p-4 border border-white/5">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs font-medium text-white/85">
                          <BookOpen className="h-3.5 w-3.5" />
                          Study smarter with guided lessons
                        </div>
                        <div className="mt-3 rounded-lg border border-white/5 bg-slate-900/50 p-3">
                          <p className="text-sm font-semibold text-white/90">Soft video previews</p>
                          <p className="mt-0.5 text-xs text-white/55">Clear explanations, all in one place. Clear walkthroughs designed to feel approachable from the very first lesson.</p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {["Concept maps", "Short recaps", "Smart prompts"].map((item) => (
                              <span key={item} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-white/70">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Study Flow</p>
                          <p className="mt-1.5 text-xs font-semibold text-white/90 leading-snug">Move between lessons, notes, and AI help without breaking focus.</p>
                        </div>
                        <span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-primary">
                          Explore
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Highlights</p>
                      <div className="mt-2 space-y-1.5">
                        {["Easy-to-follow lessons", "Built-in study support", "Helpful practice prompts"].map((item) => (
                          <div key={item} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/75">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-border bg-background">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border-2 border-primary/15 flex items-center justify-center shrink-0">
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
      <section className="section-padding bg-muted/40 relative">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="container relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.span variants={fadeUp} custom={0}
              className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-4">
              Why BrightLearn?
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-black text-foreground mb-3">
              Everything you need to <span className="text-gradient">learn faster</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-md mx-auto">
              AI-powered tools designed for the modern learner.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i}
                className="group rounded-2xl border-2 border-border bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/25 transition-all duration-300">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="section-padding bg-background">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <motion.span variants={fadeUp} custom={0}
                className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">
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
                <Button variant="outline" className="rounded-xl px-5 border-2 group">
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
      <section className="section-padding bg-muted/40 relative">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="container relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.span variants={fadeUp} custom={0}
              className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-4">
              Testimonials
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-black text-foreground">
              Loved by learners worldwide
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i}
                className="group rounded-2xl border-2 border-border bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/25 transition-all duration-300 relative">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-sm font-bold text-primary-foreground">
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
            className="relative rounded-2xl bg-gradient-to-br from-primary via-primary to-accent-foreground p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative max-w-xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Ready to start learning?</h2>
              <p className="text-white/80 max-w-md mx-auto mb-8">Join thousands of learners and unlock your potential with AI-powered education.</p>
              <div className="flex flex-wrap justify-center gap-3">
                {!isLoggedIn && (
                  <Button size="lg" onClick={() => openModal("register")}
                    className="rounded-xl px-8 h-12 text-base font-bold bg-white text-primary hover:bg-white/95 shadow-[0_0_20px_rgba(255,255,255,0.2)] border-0 transition-all">
                    Get Started Free
                  </Button>
                )}
                <Link to="/courses">
                  <Button variant="outline" size="lg"
                    className="rounded-xl px-6 h-12 text-base font-bold text-white border-2 border-white/50 hover:bg-white hover:text-primary transition-all bg-transparent">
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
