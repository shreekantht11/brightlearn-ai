import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, BookOpen, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import SkeletonCard from "@/components/SkeletonCard";
import ScrollToTop from "@/components/ScrollToTop";
import { useCatalogCourses } from "@/hooks/useCatalogCourses";

const categories = ["All", "Programming", "Data Science", "Design", "Cloud"];

const categoryIcons: Record<string, typeof BookOpen> = {
  All: Grid3X3,
  Programming: BookOpen,
  "Data Science": SlidersHorizontal,
  Design: BookOpen,
  Cloud: BookOpen,
};

const Courses = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { courses, loading } = useCatalogCourses();

  const filtered = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || course.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-accent-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="container relative py-16 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Explore Courses</h1>
            <p className="text-white/70 text-lg max-w-md">Find the perfect course for your learning goals.</p>
          </motion.div>
        </div>
      </section>

      <div className="container py-10">
        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-2xl border border-input bg-card py-3.5 pl-11 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-6">{filtered.length} course{filtered.length !== 1 ? "s" : ""} found</p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard
                key={course.id} id={course.id} title={course.title}
                instructor={course.instructor} thumbnail={course.thumbnail}
                duration={course.duration} lessons={course.lessons}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-20 text-center">
            <div className="h-20 w-20 rounded-3xl bg-accent flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filter criteria.</p>
            <button onClick={() => { setSearch(""); setCategory("All"); }}
              className="text-sm font-semibold text-primary hover:underline">
              Clear filters
            </button>
          </motion.div>
        )}
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Courses;
