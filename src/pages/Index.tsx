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
      <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-white">
        <div className="container relative z-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="max-w-2xl text-left"
            >
              <motion.h1 variants={fadeUp} custom={0} className="text-6xl md:text-8xl font-black tracking-tight text-[#C44A00] mb-2 leading-[1.0] drop-shadow-sm">
                Online<br/>Learning
              </motion.h1>
              <motion.p variants={fadeUp} custom={1} className="text-lg md:text-xl font-medium text-slate-600 max-w-lg mb-8 leading-relaxed mt-4">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
              </motion.p>
              <motion.div variants={fadeUp} custom={2} className="flex flex-wrap items-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold bg-[#D35400] hover:bg-[#A04000] text-white shadow-xl shadow-orange-500/20 transition-all">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="ghost" size="lg" className="rounded-full px-8 h-14 text-lg font-bold text-[#D35400] hover:bg-orange-50 transition-all">
                    View Courses <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <img 
                src="https://img.freepik.com/free-vector/online-tutorials-concept_52683-37480.jpg" 
                alt="Online Learning Illustration" 
                className="w-full h-auto object-contain scale-[1.10] drop-shadow-2xl"
              />
            </motion.div>

          </div>
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
