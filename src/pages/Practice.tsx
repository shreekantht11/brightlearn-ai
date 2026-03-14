import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Code, BookOpen, Clock, Target, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuthModal } from "@/context/AuthModalContext";

export default function Practice() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [results, setResults] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [loadingTests, setLoadingTests] = useState(false);
  const { openModal } = useAuthModal();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchSubjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/subjects", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
          if (data.length > 0) {
            handleSelectSubject(data[0]);
          }
        }
      } catch (err) {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [token]);

  const handleSelectSubject = async (subject: any) => {
    if (!token) return;
    setSelectedSubject(subject);
    setLoadingTests(true);
    try {
      // Fetch tests
      const res = await fetch(`http://localhost:5000/api/practice/tests/${subject.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const testsData = await res.json();
        setTests(testsData);

        // Fetch best result for each test
        const resultsMap: Record<number, any> = {};
        for (const t of testsData) {
          const rRes = await fetch(`http://localhost:5000/api/practice/results/${t.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (rRes.ok) {
            const rData = await rRes.json();
            if (rData.length > 0) {
              // Best score
              resultsMap[t.id] = rData.reduce((prev: any, current: any) => (prev.score > current.score) ? prev : current);
            }
          }
        }
        setResults(resultsMap);
      }
    } catch {
      toast.error("Failed to load tests");
    } finally {
      setLoadingTests(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <Target className="h-16 w-16 text-primary mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Practice Hub</h2>
          <p className="text-muted-foreground max-w-md mb-8">You need to log in to access the practice tests and assessments.</p>
          <button onClick={() => openModal("login")} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
            Log In to Continue
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">Practice & Assessments</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Test your knowledge, reinforce your learning, and track your progress through interactive quizzes.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar / Subject selection */}
            <div className="lg:col-span-1 border border-border rounded-2xl bg-card overflow-hidden h-fit">
              <div className="p-4 bg-muted/30 border-b border-border font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Subjects
              </div>
              <ul className="divide-y divide-border">
                {subjects.length === 0 ? (
                  <li className="p-4 text-sm text-muted-foreground text-center">No subjects found</li>
                ) : (
                  subjects.map((sub) => (
                    <li key={sub.id}>
                      <button
                        onClick={() => handleSelectSubject(sub)}
                        className={`w-full text-left p-4 text-sm font-medium transition-colors ${
                          selectedSubject?.id === sub.id ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-muted"
                        }`}
                      >
                        {sub.title}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Test Cards */}
            <div className="lg:col-span-3">
              {loadingTests ? (
                 <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : !selectedSubject ? (
                <div className="text-center py-20 border border-dashed border-border rounded-2xl">
                  <p className="text-muted-foreground">Select a subject on the left to view available practice tests.</p>
                </div>
              ) : tests.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-2xl">
                  <Target className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-lg">No practice tests available for {selectedSubject?.title} yet.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {tests.map((test) => {
                    const result = results[test.id];
                    const completed = !!result;
                    const scorePercent = completed ? Math.round((result.score / result.total_questions) * 100) : 0;
                    
                    return (
                      <motion.div
                        key={test.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border border-border bg-card rounded-3xl p-6 shadow-sm flex flex-col hover:border-primary/30 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <Code className="h-6 w-6" />
                          </div>
                          {completed && (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${scorePercent >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              Best Score: {result.score}/{result.total_questions} ({scorePercent}%)
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{test.title}</h3>
                        <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-2">{test.description || "Test your practical knowledge and concepts."}</p>
                        <div className="flex items-center gap-3 pt-4 border-t border-border mt-auto">
                          <Link to={`/practice/test/${test.id}`} className="flex-1">
                            <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${completed ? 'bg-muted text-foreground hover:bg-muted/80' : 'bg-primary text-white hover:bg-primary/90'}`}>
                              {completed ? "Retake Test" : "Start Test"}
                            </button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
