import { BookOpen, Mail, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border bg-card">
      {/* Gradient accent line */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary-glow to-accent-foreground" />

      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              BrightLearn
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
              Your smartest path to mastery — AI-powered learning for the modern era.
            </p>
            {/* Newsletter */}
            <div className="flex gap-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
                className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              <Button size="sm" className="rounded-xl px-5 shadow-sm" onClick={() => { setEmail(""); }}>
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {[
            { title: "Platform", links: ["Courses", "AI Tutor", "Pricing"] },
            { title: "Company", links: ["About", "Blog", "Careers"] },
            { title: "Support", links: ["Help Center", "Contact", "Privacy"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-sm text-foreground mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 BrightLearn. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <button key={i} className="h-9 w-9 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
