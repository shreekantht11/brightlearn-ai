import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_URL } from "@/lib/api-config";

export default function PracticeQuiz() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/practice");
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_URL}/api/practice/test/${testId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
        } else {
          toast.error("Failed to load test questions");
          navigate("/practice");
        }
      } catch {
        toast.error("Network error");
        navigate("/practice");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [testId, token, navigate]);

  const handleSelectOption = (qId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm("You have unanswered questions. Are you sure you want to submit?")) {
        return;
      }
    }

    setSubmitting(true);
    const payload = {
      testId: parseInt(testId || "0"),
      answers: Object.entries(answers).map(([qId, opt]) => ({
        questionId: parseInt(qId),
        selectedOption: opt
      }))
    };

    try {
      const res = await fetch(`${API_URL}/api/practice/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        toast.success("Test submitted successfully!");
      } else {
        toast.error("Error submitting test");
      }
    } catch {
      toast.error("Network error submitting test");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (questions.length === 0) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">No Questions Found</h2>
      <p className="text-muted-foreground mb-6">This test doesn't have any questions configured.</p>
      <Button onClick={() => navigate("/practice")}>View Practice Hub</Button>
    </div>
  );

  // Result View
  if (result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8">
          <div className="flex items-center text-sm font-semibold text-slate-900">
            Test Results
          </div>
        </header>
        <div className="flex-1 py-12 px-4 container max-w-3xl">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 text-center mb-8 border border-slate-100">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Award className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">
              You scored {percentage}%
            </h1>
            <p className="text-lg font-medium text-slate-500 mb-8">
              {result.score} out of {result.totalQuestions} correct
            </p>
            <Button onClick={() => window.location.reload()} size="lg" className="rounded-full px-8 h-12 text-base shadow-sm">
              Retake Assessment
            </Button>
          </motion.div>

          <h3 className="text-xl font-bold text-slate-800 mb-6 px-2">Detailed Results</h3>
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const uAns = result.evaluatedAnswers.find((a: any) => a.questionId === q.id);
              const isCorrect = uAns?.isCorrect;
              const hasAnswered = !!uAns;
              
              const options = [
                { id: "A", text: q.option_a },
                { id: "B", text: q.option_b },
                { id: "C", text: q.option_c },
                { id: "D", text: q.option_d },
              ];

              return (
                <div key={q.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    {hasAnswered ? (
                      isCorrect ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-red-500" />
                    ) : (
                      <span className="text-sm font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Skipped</span>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-6">{q.question_text}</h4>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    {options.map((opt) => {
                      const isSelected = uAns?.selectedOption === opt.id;
                      const isActualCorrect = uAns?.correctOption === opt.id;

                      let style = "border-slate-200 bg-whitetext-slate-600 opacity-60";
                      if (isActualCorrect) style = "border-green-500 bg-green-50 text-green-800 ring-2 ring-green-500/20";
                      else if (isSelected && !isCorrect) style = "border-red-300 bg-red-50 text-red-800";

                      return (
                        <div key={opt.id} className={`p-4 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-3 ${style}`}>
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border ${isActualCorrect ? 'bg-green-500 border-green-600 text-white' : isSelected && !isCorrect ? 'bg-red-500 border-red-600 text-white' : 'border-slate-300 text-slate-400'}`}>
                            {opt.id}
                          </div>
                          {opt.text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Quiz View
  const question = questions[currentIdx];
  const progressPercent = ((currentIdx) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 shrink-0">
        <button onClick={() => { if(window.confirm("Quit practice test?")) navigate("/practice"); }} className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <XCircle className="mr-2 h-5 w-5" /> Quit
        </button>
        <div className="ml-auto w-48 hidden sm:block">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary" animate={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-right text-xs text-slate-400 font-semibold mt-1">Question {currentIdx + 1} of {questions.length}</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-100 p-8 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <h3 className="text-2xl font-bold text-slate-800 leading-snug mb-8">{question.question_text}</h3>
              
              <div className="space-y-3 mb-8 flex-1">
                {[
                  { id: "A", text: question.option_a },
                  { id: "B", text: question.option_b },
                  { id: "C", text: question.option_c },
                  { id: "D", text: question.option_d },
                ].map((opt) => {
                  const selected = answers[question.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(question.id, opt.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 text-base font-medium transition-all flex items-center gap-4 group ${
                        selected ? "border-primary bg-primary/5 ring-4 ring-primary/10 text-primary" : "border-slate-200 hover:border-primary/40 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                        selected ? "border-primary bg-primary text-white" : "border-slate-300 text-slate-400 group-hover:border-primary/40 group-hover:text-primary/70"
                      }`}>
                        {opt.id}
                      </div>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center mt-auto">
            <Button
              variant="outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="rounded-xl h-12 px-6 font-semibold"
            >
              Previous
            </Button>
            
            {currentIdx < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="rounded-xl h-12 px-8 font-semibold bg-primary text-white hover:bg-primary/90"
              >
                Next Question
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl h-12 px-8 font-bold bg-[#D35400] text-white hover:bg-[#A04000] shadow-lg shadow-orange-500/20"
              >
                {submitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Submit Assessment"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
