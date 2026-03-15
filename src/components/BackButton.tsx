import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// The global floating BackButton is NOT needed on these pages because
// each page handles its own navigation affordance:
//
// "/"               → Landing page (no back needed)
// "/courses"        → Has Navbar
// "/course/:id"     → Has inline back button in the hero section
// "/learn/:id"      → Has sticky top bar with breadcrumb trail
// "/practice"       → Has Navbar
// "/practice/test"  → Has inline header with Quit button
// "/profile"        → Has Navbar
// "/login"          → Redirects to home; modal-based auth
// "/register"       → Redirects to home; modal-based auth

const BackButton = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const shouldHide =
    pathname === "/" ||
    pathname === "/courses" ||
    pathname === "/practice" ||
    pathname === "/profile" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/learn/") ||
    pathname.startsWith("/course/") ||
    pathname.startsWith("/practice/test/");

  if (shouldHide) return null;

  // Fallback: for any unexpected routes, render a clean floating back button
  return (
    <div className="fixed top-[72px] left-4 z-[90]">
      <Button
        variant="outline"
        size="sm"
        className="rounded-full bg-background/90 backdrop-blur-md border-border shadow-sm hover:bg-muted text-muted-foreground hover:text-foreground gap-1.5 pl-3 pr-4 h-9"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back</span>
      </Button>
    </div>
  );
};

export default BackButton;
