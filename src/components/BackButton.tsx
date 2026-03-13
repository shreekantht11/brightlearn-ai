import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") return null;

  return (
    <div className="absolute top-6 left-6 z-50">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-background/50 backdrop-blur-md border border-border/50 shadow-sm hover:bg-accent hover:text-accent-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default BackButton;
