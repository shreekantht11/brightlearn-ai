import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-surface py-12">
    <div className="container grid gap-8 md:grid-cols-4">
      <div>
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground mb-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          BrightLearn
        </Link>
        <p className="text-sm text-muted-foreground">Your smartest path to mastery — AI-powered learning for the modern era.</p>
      </div>
      {[
        { title: "Platform", links: ["Courses", "AI Tutor", "Pricing"] },
        { title: "Company", links: ["About", "Blog", "Careers"] },
        { title: "Support", links: ["Help Center", "Contact", "Privacy"] },
      ].map((col) => (
        <div key={col.title}>
          <h4 className="font-semibold text-sm text-foreground mb-3">{col.title}</h4>
          <ul className="space-y-2">
            {col.links.map((l) => (
              <li key={l}><span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{l}</span></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="container mt-8 pt-8 border-t border-border">
      <p className="text-xs text-muted-foreground text-center">© 2026 BrightLearn. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
