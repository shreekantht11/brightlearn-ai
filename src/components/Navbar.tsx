import { Link, useLocation } from "react-router-dom";
import { BookOpen, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/context/AuthModalContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { openModal } = useAuthModal();

  const [authState, setAuthState] = useState({
    token: localStorage.getItem("token"),
    userName: (() => { try { return JSON.parse(localStorage.getItem("user") || "{}").name || ""; } catch { return ""; } })()
  });

  useEffect(() => {
    const sync = () => setAuthState({
      token: localStorage.getItem("token"),
      userName: (() => { try { return JSON.parse(localStorage.getItem("user") || "{}").name || ""; } catch { return ""; } })()
    });
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const isLoggedIn = !!authState.token;
  const userName = authState.userName;

  const links = [
    { to: "/", label: "Home" },
    { to: "/courses", label: "Courses" },
    { to: "/practice", label: "Practice" },
    ...(isLoggedIn ? [{ to: "/profile", label: "Profile" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          BrightLearn
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link to="/profile" className="flex items-center gap-2.5 bg-accent hover:bg-accent/80 rounded-full pl-2 pr-4 py-1.5 transition-colors">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                {userName ? userName[0].toUpperCase() : <User className="h-4 w-4" />}
              </div>
              <span className="text-sm font-semibold text-foreground truncate max-w-[100px]">
                {userName || "Profile"}
              </span>
            </Link>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => openModal("login")}>
                Log in
              </Button>
              <Button size="sm" onClick={() => openModal("register")}
                className="rounded-full px-5 shadow-sm">
                Get Started
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {isLoggedIn ? (
              <Link to="/profile" className="flex-1">
                <Button className="w-full" size="sm">My Profile</Button>
              </Link>
            ) : (
              <>
                <Button variant="outline" className="flex-1" size="sm"
                  onClick={() => { setMobileOpen(false); openModal("login"); }}>
                  Log in
                </Button>
                <Button className="flex-1" size="sm"
                  onClick={() => { setMobileOpen(false); openModal("register"); }}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
