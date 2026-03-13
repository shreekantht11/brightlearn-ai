import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { courses as mockCourses } from "@/lib/data";

const categories = ["All", "Programming", "Data Science", "Design", "Cloud"];

// Normalise mock courses to match the shape we use in rendering
const normalisedMock = mockCourses.map((c) => ({
  id: c.id,
  title: c.title,
  instructor: c.instructor,
  thumbnail: c.thumbnail,
  duration: c.duration,
  lessons: c.lessons,
  category: c.category,
  isLive: false,
}));

const Courses = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  // Pre-load mock data so courses are visible immediately — API replaces with live data if available
  const [coursesData, setCoursesData] = useState<any[]>(normalisedMock);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/subjects", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            // Backend has real subjects — swap in live data
            setCoursesData(data.map((s: any) => ({
              id: s.id.toString(),
              title: s.title,
              instructor: "BrightLearn Platform",
              thumbnail: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop`,
              duration: "2+ hours",
              lessons: 5,
              category: "All",
              isLive: true,
            })));
          }
          // If API returns empty, the existing mock data stays visible
        }
        // On network error, mock data stays visible silently
      } catch {
        // keep mock data
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = coursesData.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || c.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Explore Courses</h1>
          <p className="text-muted-foreground">Find the perfect course for your learning goals.</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-xl border border-input bg-background pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <CourseCard
                key={c.id}
                id={c.id.toString()}
                title={c.title}
                instructor={c.instructor}
                thumbnail={c.thumbnail}
                duration={c.duration}
                lessons={c.lessons}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No courses found matching your search.
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
