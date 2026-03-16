import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  MessageCircle, X, Send, Bot, Sparkles, AlertCircle,
  BookOpen, Target, Search, BarChart3, Copy, RefreshCw,
  Maximize2, Minimize2, Trash2, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthModal } from "@/context/AuthModalContext";
import { API_URL } from "@/lib/api-config";
import ReactMarkdown from "react-markdown";

/* ─── types ─── */
interface Message {
  role: "user" | "ai";
  content: string;
  time: string;
  id: string;
}

type ChatContext = {
  route: string;
  pageTitle?: string;
  courseTitle?: string;
  lessonTitle?: string;
};

/* ─── helpers ─── */
const uid = () => Math.random().toString(36).slice(2, 10);
const getTimeLabel = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const getContextualSuggestions = (pathname: string) => {
  if (pathname.startsWith("/learn/"))
    return ["Explain this lesson", "Give me an example", "Summarize what I'm watching"];
  if (pathname.startsWith("/course/"))
    return ["What will I learn here?", "Is this good for beginners?", "How should I start?"];
  if (pathname.startsWith("/practice"))
    return ["How does practice work?", "How should I prepare?", "What should I do next?"];
  return ["Help me choose a course", "Where do I see my enrollments?", "How does practice work?"];
};

const getPlaceholder = (pathname: string) => {
  if (pathname.startsWith("/learn/")) return "Ask about this lesson…";
  if (pathname.startsWith("/course/")) return "Ask about this course…";
  return "Ask me anything…";
};

const INITIAL_MSG: Message = {
  role: "ai",
  content:
    "Hi! I'm your **BrightLearn** assistant. I can help with lessons, courses, navigation, enrollments, and practice.",
  time: getTimeLabel(),
  id: "init",
};

const quickActions = [
  { icon: BookOpen, label: "Explain a concept", message: "Can you explain a concept from my current course?" },
  { icon: Target, label: "Help me practice", message: "Help me practice for my next quiz" },
  { icon: Search, label: "Find a course", message: "Help me find the right course for me" },
  { icon: BarChart3, label: "Track progress", message: "Show me how to track my learning progress" },
];

/* ─── sub-components ─── */

const BouncingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="inline-block h-2 w-2 rounded-full bg-primary/60"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const MessageActions = ({
  msg,
  isLast,
  onRegenerate,
}: {
  msg: Message;
  isLast: boolean;
  onRegenerate: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-1 flex items-center gap-1"
    >
      <button
        onClick={copy}
        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      {isLast && (
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      )}
    </motion.div>
  );
};

/* ─── main component ─── */
const AIChatPanel = () => {
  const location = useLocation();
  const { openModal } = useAuthModal();

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageContext, setPageContext] = useState<ChatContext>({ route: location.pathname });
  const [unread, setUnread] = useState(0);
  const [hasOpened, setHasOpened] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = useMemo(() => getContextualSuggestions(location.pathname), [location.pathname]);
  const placeholder = useMemo(() => getPlaceholder(location.pathname), [location.pathname]);
  const isWelcome = messages.length === 1 && messages[0].id === "init";

  /* auto-scroll */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  /* page context */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const pageTitle = document.querySelector("main h1, section h1, h1")?.textContent?.trim() || "";
      const courseTitle =
        document.querySelector('a[href^="/course/"]')?.textContent?.trim() || "";
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

  /* auto-resize textarea */
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  }, [input]);

  /* send message */
  const sendMessage = useCallback(
    async (text?: string) => {
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
            content: "Please **log in** to use the AI assistant.",
            time: getTimeLabel(),
            id: uid(),
          },
        ]);
        openModal("login");
        return;
      }

      const userEntry: Message = { role: "user", content: userMsg, time: getTimeLabel(), id: uid() };
      setMessages((prev) => [...prev, userEntry]);
      setInput("");
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: userMsg, context: pageContext }),
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 401) {
            openModal("login");
            throw new Error("Session expired — please log in again.");
          }
          throw new Error(data?.error || "Couldn't get a response right now.");
        }

        const aiMsg: Message = {
          role: "ai",
          content: data?.reply || "I couldn't generate a response. Please try again.",
          time: getTimeLabel(),
          id: uid(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (!open) setUnread((u) => u + 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Assistant unavailable.";
        setError(message);
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "Something went wrong. Please try again.", time: getTimeLabel(), id: uid() },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, openModal, pageContext, open],
  );

  const regenerate = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) void sendMessage(lastUserMsg.content);
  }, [messages, sendMessage]);

  const clearChat = () => {
    setMessages([{ ...INITIAL_MSG, time: getTimeLabel(), id: uid() }]);
    setError("");
  };

  const handleOpen = () => {
    setOpen((prev) => {
      if (!prev) {
        setUnread(0);
        setHasOpened(true);
      }
      return !prev;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  /* ─── dimensions ─── */
  const panelClass = expanded
    ? "fixed inset-4 sm:inset-8 z-[100] flex flex-col overflow-hidden rounded-3xl"
    : "fixed bottom-24 right-6 z-[100] flex h-[560px] w-[25rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl";

  const lastAiIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "ai") return i;
    return -1;
  })();

  return (
    <>
      {/* ─── panel ─── */}
      <AnimatePresence>
        {open && expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={`${panelClass} border border-border/50 bg-card/80 shadow-2xl backdrop-blur-xl`}
          >
            {/* header */}
            <div className="relative bg-gradient-to-r from-primary to-cyan-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={loading ? { scale: [1, 1.15, 1] } : { y: [0, -2, 0] }}
                    transition={{ duration: loading ? 1 : 3, repeat: Infinity }}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
                  >
                    <Bot className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-bold text-white">BrightLearn AI</p>
                    <p className="text-xs text-white/75">
                      {loading ? "Thinking…" : "Study help & guidance"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearChat}
                    title="New chat"
                    className="rounded-lg bg-white/10 p-1.5 text-white/80 transition-colors hover:bg-white/25 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setExpanded((e) => !e)}
                    title={expanded ? "Minimize" : "Maximize"}
                    className="rounded-lg bg-white/10 p-1.5 text-white/80 transition-colors hover:bg-white/25 hover:text-white"
                  >
                    {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-white/20 p-1.5 text-white transition-colors hover:bg-white/30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* gradient accent line */}
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
            </div>

            {/* messages area */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onMouseEnter={() => msg.role === "ai" && setHoveredMsgId(msg.id)}
                  onMouseLeave={() => setHoveredMsgId(null)}
                  className={`group flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "ai" && (
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-accent">
                      <Bot className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
                  <div className={msg.role === "user" ? "flex flex-col items-end" : "flex-1 min-w-0"}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        msg.role === "user"
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md bg-muted text-foreground"
                      }`}
                    >
                      {msg.role === "ai" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-pre:my-2 prose-code:rounded prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:text-xs">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-[10px] text-muted-foreground ${msg.role === "user" ? "text-right" : ""}`}>
                        {msg.time}
                      </p>
                      {msg.role === "ai" && hoveredMsgId === msg.id && msg.id !== "init" && (
                        <MessageActions msg={msg} isLast={i === lastAiIdx} onRegenerate={regenerate} />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* typing indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-accent">
                    <Bot className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-muted">
                    <BouncingDots />
                  </div>
                </motion.div>
              )}

              {/* welcome quick actions */}
              {isWelcome && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-2 gap-2 pt-2"
                >
                  {quickActions.map((qa) => (
                    <button
                      key={qa.label}
                      onClick={() => void sendMessage(qa.message)}
                      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-3 text-center transition-all hover:border-primary/30 hover:bg-accent hover:shadow-sm"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <qa.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{qa.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* suggestion chips */}
            {!isWelcome && (
              <div className="flex gap-2 overflow-x-auto px-4 pb-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => void sendMessage(s)}
                    disabled={loading}
                    className="shrink-0 rounded-full border border-border bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* error */}
            {error && (
              <div className="mx-4 mb-2 flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* input area */}
            <div className="border-t border-border/50 p-4">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={loading}
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ maxHeight: 120 }}
                />
                <Button
                  size="icon"
                  onClick={() => void sendMessage()}
                  disabled={loading || !input.trim()}
                  className="h-10 w-10 shrink-0 rounded-xl shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  Context-aware · Shift+Enter for new line
                </div>
                {input.length > 0 && (
                  <span className={`text-[10px] ${input.length > 500 ? "text-destructive" : "text-muted-foreground"}`}>
                    {input.length}/500
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FAB ─── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl"
        aria-label="Open AI assistant"
      >
        {/* pulse ring — only before first open */}
        {!hasOpened && !open && (
          <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/30" />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* unread badge */}
        {unread > 0 && !open && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </motion.button>
    </>
  );
};

export default AIChatPanel;
