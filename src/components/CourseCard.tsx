import { Link, useNavigate } from "react-router-dom";
import { Clock, BookOpen, User } from "lucide-react";
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
}

const CourseCard = ({ id, title, instructor, thumbnail, duration, lessons, progress }: CourseCardProps) => {
  const { openEnrollModal } = useEnrollModal();
  const navigate = useNavigate();

  const isLiveId = /^\d+$/.test(id);

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLiveId) {
      navigate(`/learn/${id}`);
      return;
    }
    openEnrollModal(id, title);
  };

  return (
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
  );
};

export default CourseCard;
