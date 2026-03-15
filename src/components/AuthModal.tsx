import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthModal } from "@/context/AuthModalContext";

const inputClass =
  "w-full rounded-xl border border-input bg-background px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

const GoogleIcon = () => (
  <svg className="mr-2.5 h-4 w-4 shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Password strength
const getPasswordStrength = (pw: string) => {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Weak", color: "bg-destructive" };
  if (score <= 3) return { level: 2, label: "Medium", color: "bg-warning" };
  return { level: 3, label: "Strong", color: "bg-success" };
};

// ─── Login Form ────────────────────────────────────────────────
const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to log in");
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      onSuccess();
      window.dispatchEvent(new Event("storage"));
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</label>
        <input type="email" placeholder="you@example.com" value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Password</label>
        <div className="relative">
          <input type={showPass ? "text" : "password"} placeholder="••••••••" value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass + " pr-12"} />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={loading}
        className="w-full rounded-xl h-12 font-bold text-base shadow-lg shadow-primary/20 transition-all mt-2">
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Log In"}
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">or</span></div>
      </div>
      <Button variant="outline" type="button"
        className="w-full rounded-xl h-12 font-semibold border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center">
        <GoogleIcon /> Continue with Google
      </Button>
    </form>
  );
};

// ─── Register Form ─────────────────────────────────────────────
const RegisterForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register");
      toast.success("Account created! Please log in.");
      onSuccess();
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Full Name</label>
        <input type="text" placeholder="John Doe" value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</label>
        <input type="email" placeholder="you@example.com" value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Password</label>
        <div className="relative">
          <input type={showPass ? "text" : "password"} placeholder="Create a strong password" value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass + " pr-12"} />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {/* Password strength indicator */}
        {formData.password && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" /> {strength.label}
            </p>
          </div>
        )}
      </div>
      <Button type="submit" disabled={loading}
        className="w-full rounded-xl h-12 font-bold text-base shadow-lg shadow-primary/20 transition-all mt-2">
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Account"}
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">or</span></div>
      </div>
      <Button variant="outline" type="button"
        className="w-full rounded-xl h-12 font-semibold border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center">
        <GoogleIcon /> Sign up with Google
      </Button>
    </form>
  );
};

// ─── Main Modal ────────────────────────────────────────────────
const AuthModal = () => {
  const { isOpen, activeTab, closeModal, switchTab } = useAuthModal();
  const navigate = useNavigate();

  const handleLoginSuccess = () => { closeModal(); navigate("/"); };
  const handleRegisterSuccess = () => { switchTab("login"); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-md" onClick={closeModal} />

          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
            <motion.div key="dialog" layout
              initial={{ opacity: 0, y: 32, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-[520px] bg-card rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-primary to-accent-foreground">
                <button onClick={closeModal}
                  className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3 mb-5">
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10">
                    <BookOpen className="h-6 w-6 text-white" />
                  </motion.div>
                  <span className="text-xl font-black text-white tracking-tight">BrightLearn</span>
                </div>

                <div className="flex gap-1 bg-white/15 rounded-xl p-1">
                  {(["login", "register"] as const).map((tab) => (
                    <button key={tab} onClick={() => switchTab(tab)}
                      className={`relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors z-10 ${
                        activeTab === tab ? "text-primary" : "text-white/80 hover:text-white"
                      }`}>
                      {activeTab === tab && (
                        <motion.div layoutId="tab-pill" className="absolute inset-0 bg-white rounded-lg"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
                      )}
                      <span className="relative z-10">{tab === "login" ? "Log In" : "Sign Up"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-6 h-[500px] flex flex-col">
                <div className="mb-6 h-[50px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab + "-heading"}
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}>
                      <h2 className="text-xl font-black text-foreground">
                        {activeTab === "login" ? "Welcome back!" : "Create your account"}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {activeTab === "login" ? "Log in to continue your learning journey." : "Join thousands of learners on BrightLearn."}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="relative flex-1 w-full">
                  <AnimatePresence initial={false}>
                    <motion.div key={activeTab}
                      initial={{ opacity: 0, x: activeTab === "login" ? -24 : 24 }}
                      animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: activeTab === "login" ? 24 : -24 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }} className="absolute inset-0">
                      {activeTab === "login" ? <LoginForm onSuccess={handleLoginSuccess} /> : <RegisterForm onSuccess={handleRegisterSuccess} />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-4 pt-4 border-t border-border text-center text-xs text-muted-foreground">
                  {activeTab === "login" ? (
                    <>No account? <button onClick={() => switchTab("register")} className="text-primary font-semibold hover:underline">Sign up free</button></>
                  ) : (
                    <>Already have one? <button onClick={() => switchTab("login")} className="text-primary font-semibold hover:underline">Log in</button></>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
