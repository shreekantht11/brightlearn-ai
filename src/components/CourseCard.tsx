import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Clock, BookOpen, User, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuthModal } from "@/context/AuthModalContext";

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  lessons: number;
  progress?: number;
}

const CourseCard = ({ id, title, instructor, thumbnail, duration, lessons, progress }: CourseCardProps) => {
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const { openModal } = useAuthModal();
  const navigate = useNavigate();

  const isLiveId = /^\d+$/.test(id);

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLiveId) {
      navigate(`/learn/${id}`);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      openModal("login");
      return;
    }
    setShowEnrollConfirm(true);
  };

  const confirmEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEnrolling(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/enroll/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Successfully enrolled! View it in your Profile.`);
        setShowEnrollConfirm(false);
      } else {
        toast.error("Enrollment failed. Please login.");
        openModal("login");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showEnrollConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(!enrolling) setShowEnrollConfirm(false); }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 border border-border text-center"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Play className="h-8 w-8 text-primary ml-1" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Enroll in Course</h2>
                <p className="text-slate-500 mb-8">
                  Are you sure you want to enroll in "{title}"?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEnrollConfirm(false); }}
                    disabled={enrolling}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 rounded-xl h-12 bg-primary text-white hover:bg-primary/90"
                    onClick={confirmEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Confirm"}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          to={`/course/${id}`}
          className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow duration-300 relative z-10"
        >
        <div className="aspect-video bg-muted overflow-hidden">
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="p-5 space-y-3">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{instructor}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{duration}</span>
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{lessons} lessons</span>
          </div>
          {progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {progress === undefined && (
            <Button size="sm" className="w-full mt-1" onClick={handleEnrollClick}>
              Enroll Now
            </Button>
          )}
        </div>
        </Link>
      </motion.div>
    </>
  );
};

export default CourseCard;
