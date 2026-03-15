import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "ai";
  content: string;
  time: string;
}

const suggestions = ["Explain this concept", "Give me an example", "What's next?"];

const AIChatPanel = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your AI tutor. Ask me anything about this lesson!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const sendMessage = (text?: string) => {
    const userMsg = (text || input).trim();
    if (!userMsg) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: "user", content: userMsg, time: now }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `That's a great question about "${userMsg}". Let me explain — this concept relates to the fundamentals we covered in the video. Would you like me to elaborate further?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      setTyping(false);
    }, 1500);
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
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "520px" }}
          >
            {/* Gradient header */}
            <div className="relative bg-gradient-to-r from-primary to-primary-glow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }}
                    className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-bold text-white">AI Tutor</p>
                    <p className="text-xs text-white/70">Always here to help</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "ai" && (
                    <div className="h-6 w-6 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-accent-foreground" />
                    </div>
                  )}
                  <div>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      {msg.content}
                    </div>
                    <p className={`text-[10px] text-muted-foreground mt-1 ${msg.role === "user" ? "text-right" : ""}`}>{msg.time}</p>
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="h-6 w-6 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3.5 w-3.5 text-accent-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggestion chips */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
              {suggestions.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="shrink-0 text-xs font-medium text-accent-foreground bg-accent hover:bg-accent/80 px-3 py-1.5 rounded-full transition-colors border border-border">
                  {s}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about this lesson..."
                  className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                <Button size="icon" onClick={() => sendMessage()} className="rounded-xl h-10 w-10 shadow-sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </>
  );
};

export default AIChatPanel;
