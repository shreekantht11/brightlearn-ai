import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") return null;

  return (
    <div className="fixed top-6 left-6 z-[100]">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-white/90 backdrop-blur-md border-border/50 shadow-md hover:bg-slate-100 hover:text-slate-900 h-10 w-10 flex items-center justify-center text-slate-800"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default BackButton;
