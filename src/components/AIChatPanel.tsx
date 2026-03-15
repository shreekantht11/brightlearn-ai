import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Send, Bot, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthModal } from "@/context/AuthModalContext";
import { API_URL } from "@/lib/api-config";

interface Message {
  role: "user" | "ai";
  content: string;
  time: string;
}

type ChatContext = {
  route: string;
  pageTitle?: string;
  courseTitle?: string;
  lessonTitle?: string;
};

const getTimeLabel = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const getContextualSuggestions = (pathname: string) => {
  if (pathname.startsWith("/learn/")) {
    return ["Explain this lesson", "Give me an example", "Summarize what I'm watching"];
  }
  if (pathname.startsWith("/course/")) {
    return ["What will I learn here?", "Is this good for beginners?", "How should I start?"];
  }
  if (pathname.startsWith("/practice")) {
    return ["How does practice work?", "How should I prepare?", "What should I do next?"];
  }
  return ["Help me choose a course", "Where do I see my enrollments?", "How does practice work?"];
};

const getPlaceholder = (pathname: string) => {
  if (pathname.startsWith("/learn/")) return "Ask about this lesson or what to study next...";
  if (pathname.startsWith("/course/")) return "Ask about this course or how to start...";
  return "Ask about courses, learning, enrollments, or practice...";
};

const AIChatPanel = () => {
  const location = useLocation();
  const { openModal } = useAuthModal();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hi! I'm your BrightLearn assistant. I can help with lessons, courses, navigation, enrollments, and practice.",
      time: getTimeLabel(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageContext, setPageContext] = useState<ChatContext>({ route: location.pathname });
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => getContextualSuggestions(location.pathname), [location.pathname]);
  const placeholder = useMemo(() => getPlaceholder(location.pathname), [location.pathname]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const pageTitle = document.querySelector("main h1, section h1, h1")?.textContent?.trim() || "";
      const courseTitle =
        document.querySelector('header a[href^="/course/"]')?.textContent?.trim() ||
        document.querySelector('a[href^="/course/"]')?.textContent?.trim() ||
        "";
      const lessonTitle = location.pathname.startsWith("/learn/") ? pageTitle : "";

      setPageContext({
        route: location.pathname,
        pageTitle: pageTitle || undefined,
        courseTitle: courseTitle || undefined,
        lessonTitle: lessonTitle || undefined,
      });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [location.pathname, open]);

  const sendMessage = async (text?: string) => {
    const token = localStorage.getItem("token");
    const userMsg = (text || input).trim();

    if (!userMsg || loading) return;

    if (!token) {
      setOpen(true);
      setError("");
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Please log in to use the AI assistant. Once you're signed in, I can help with courses, lessons, and app questions.",
          time: getTimeLabel(),
        },
      ]);
      openModal("login");
      return;
    }

    const userEntry: Message = { role: "user", content: userMsg, time: getTimeLabel() };
    setMessages((prev) => [...prev, userEntry]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMsg,
          context: pageContext,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          openModal("login");
          throw new Error("Your session expired. Please log in again to continue chatting.");
        }

        throw new Error(data?.error || "The assistant could not answer right now.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data?.reply || "I couldn't generate a response right now. Please try again.",
          time: getTimeLabel(),
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "The assistant is unavailable right now.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "I hit a problem while responding. Please try again in a moment.",
          time: getTimeLabel(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[25rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
          >
            <div className="relative bg-gradient-to-r from-primary to-cyan-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
                  >
                    <Bot className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-bold text-white">BrightLearn AI</p>
                    <p className="text-xs text-white/75">Study help and app guidance</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-lg bg-white/20 p-1.5 transition-colors hover:bg-white/30">
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={`${msg.time}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "ai" && (
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-accent">
                      <Bot className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
                  <div className={msg.role === "user" ? "flex flex-col items-end" : ""}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        msg.role === "user"
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md bg-muted text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p className={`mt-1 text-[10px] text-muted-foreground ${msg.role === "user" ? "text-right" : ""}`}>
                      {msg.time}
                    </p>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-accent">
                    <Bot className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 pb-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => void sendMessage(suggestion)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-border bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {error && (
              <div className="mx-4 mb-2 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void sendMessage()}
                  placeholder={placeholder}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
                />
                <Button
                  size="icon"
                  onClick={() => void sendMessage()}
                  disabled={loading || !input.trim()}
                  className="h-10 w-10 rounded-xl shadow-sm"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Uses current page context to help with lessons, courses, and app questions.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl"
        aria-label="Open AI assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </>
  );
};

export default AIChatPanel;
