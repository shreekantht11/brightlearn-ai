import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }

      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Background Animated Blurs */}
      <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <motion.div animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute bottom-[0%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="hidden lg:flex items-center justify-center relative bg-accent/30 p-12 backdrop-blur-xl border-r border-white/5">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="max-w-md text-center relative z-10">
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30 outline outline-8 outline-primary/10"
          >
            <BookOpen className="h-12 w-12 text-white" />
          </motion.div>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">Start Learning Today</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">Join thousands of learners and unlock AI-powered courses tailored specifically for your career goals.</p>
        </motion.div>

        {/* Floating elements inside left panel */}
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-[20%] left-[10%] bg-background/80 p-3 rounded-2xl shadow-xl backdrop-blur-md border border-white/10">
           <span className="text-2xl">🚀</span>
        </motion.div>
        <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute bottom-[20%] right-[10%] bg-background/80 p-3 rounded-2xl shadow-xl backdrop-blur-md border border-white/10">
           <span className="text-2xl">🧠</span>
        </motion.div>
      </div>

      <div className="flex items-center justify-center p-8 relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="w-full max-w-md space-y-8 bg-card/50 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-black/5 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="lg:hidden flex items-center gap-3 font-bold text-2xl text-foreground mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            LearnAI
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Create account</h1>
            <p className="text-base text-muted-foreground mt-2">Start your personalized learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-2xl border border-input bg-background/50 px-5 py-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all backdrop-blur-sm shadow-inner" 
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-2xl border border-input bg-background/50 px-5 py-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all backdrop-blur-sm shadow-inner" 
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Secure Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-2xl border border-input bg-background/50 px-5 py-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all backdrop-blur-sm shadow-inner" 
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-2xl h-14 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Create Account"}
            </Button>
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center pt-2"><div className="w-full border-t border-border/50" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">or</span></div>
            </div>
            <Button variant="outline" type="button" className="w-full rounded-2xl h-14 text-base font-semibold border-2 hover:bg-accent/50 transition-colors">
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </Button>
          </form>

          <p className="text-center text-sm font-medium text-muted-foreground pt-4">
            Already have an account? <Link to="/login" className="text-primary hover:underline underline-offset-4">Log in instantly</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
