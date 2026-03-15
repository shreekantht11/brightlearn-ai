import { Link, useNavigate } from "react-router-dom";
import { Clock, BookOpen, User, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEnrollModal } from "@/context/EnrollModalContext";

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  lessons: number;
  progress?: number;
  category?: string;
}

const CourseCard = ({ id, title, instructor, thumbnail, duration, lessons, progress, category }: CourseCardProps) => {
  const { openEnrollModal } = useEnrollModal();
  const navigate = useNavigate();
  const isLiveId = /^\d+$/.test(id);

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLiveId) { navigate(`/learn/${id}`); return; }
    openEnrollModal(id, title);
  };

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25, ease: "easeOut" }}>
      <Link
        to={`/course/${id}`}
        className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative"
      >
        {/* Thumbnail */}
        <div className="aspect-video bg-muted overflow-hidden relative">
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-5 w-5 text-primary ml-0.5" />
            </div>
          </div>
          {/* Category badge */}
          {category && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-foreground px-3 py-1 rounded-full shadow-sm">
              {category}
            </span>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-base">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center">
              <User className="h-3 w-3 text-accent-foreground" />
            </div>
            <span>{instructor}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{duration}</span>
            <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{lessons} lessons</span>
          </div>

          {/* Progress bar */}
          {progress !== undefined && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-primary">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {progress === undefined && (
            <Button size="sm" className="w-full mt-1 rounded-xl font-semibold shadow-sm hover:shadow-md transition-shadow" onClick={handleEnrollClick}>
              Enroll Now
            </Button>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
