import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Brain, BarChart3, Target, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { courses, testimonials } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const features = [
  { icon: BookOpen, title: "Structured Video Learning", desc: "High-quality video lessons organized into clear learning paths." },
  { icon: Brain, title: "AI Tutor Assistant", desc: "Get instant help from our intelligent AI tutor anytime." },
  { icon: BarChart3, title: "Progress Tracking", desc: "Track your learning journey with detailed analytics." },
  { icon: Target, title: "Smart Recommendations", desc: "AI-powered course suggestions tailored to your goals." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="section-padding relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background Cutouts */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[10%] w-32 h-32 bg-primary/20 rounded-full blur-2xl"
          />
          <motion.div
            animate={{
              y: [0, 30, 0],
              rotate: [0, -10, 10, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[40%] right-[10%] w-48 h-48 bg-blue-500/20 rounded-full blur-3xl opacity-60"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[20%] left-[30%] w-56 h-56 bg-purple-500/10 rounded-full blur-3xl"
          />

          {/* Floating UI Elements */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[25%] hidden lg:flex items-center gap-3 bg-card/80 backdrop-blur-md border outline outline-white/10 p-4 rounded-2xl shadow-xl z-10"
          >
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Tutor</p>
              <p className="text-xs text-muted-foreground">Always active</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-[25%] left-[15%] hidden lg:flex items-center gap-3 bg-card/80 backdrop-blur-md border outline outline-white/10 p-4 rounded-2xl shadow-xl z-10"
          >
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">4.8 Average Rating</p>
              <p className="text-xs text-muted-foreground">From 10k+ learners</p>
            </div>
          </motion.div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background -z-10" />
        <div className="container relative z-20">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl text-center py-16"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" /> Next-generation AI Learning
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
              Unlock Your Potential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">AI-Powered</span> Learning
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Experience smart, personalized paths with AI-driven recommendations, interactive tutoring, and structured courses designed for the modern learner.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/courses">
                <Button size="lg" className="rounded-2xl px-8 h-14 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                  Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="rounded-2xl px-8 h-14 text-lg font-semibold bg-background/50 backdrop-blur-sm border-2">
                  Get Started For Free
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-surface">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold text-foreground mb-3">Why LearnAI?</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-md mx-auto">Everything you need for an exceptional learning experience.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i} className="rounded-2xl border border-border bg-card p-6 hover-lift">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="section-padding">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex items-end justify-between mb-10">
            <div>
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold text-foreground mb-2">Popular Courses</motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground">Start learning from our most popular courses.</motion.p>
            </div>
            <motion.div variants={fadeUp} custom={2}>
              <Link to="/courses"><Button variant="ghost" className="text-primary">View all <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
            </motion.div>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((c) => (
              <CourseCard key={c.id} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-surface">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold text-foreground mb-3">What Our Learners Say</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i} className="rounded-2xl border border-border bg-card p-6 hover-lift">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-warning text-warning" />)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-accent-foreground">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
