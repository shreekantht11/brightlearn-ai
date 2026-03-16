import { motion } from 'framer-motion';
import { Calendar, Clock, Star, Tag, FileText, Folder } from 'lucide-react';
import { Note } from '@/hooks/useNotes';

interface NoteCardProps {
  note: Note;
  isSelected?: boolean;
  onClick: () => void;
}

const NoteCard = ({ note, isSelected = false, onClick }: NoteCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getPreview = (content: string) => {
    const plainText = content.replace(/[#*`\[\]]/g, '').replace(/\n+/g, ' ');
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`
        relative p-4 rounded-2xl border cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'bg-primary text-primary-foreground border-primary shadow-md' 
          : 'bg-card border-border hover:border-primary/20 hover:shadow-sm'
        }
      `}
    >
      {/* Star indicator */}
      {note.is_starred && (
        <div className="absolute top-3 right-3">
          <Star className={`h-4 w-4 ${isSelected ? 'fill-primary-foreground text-primary-foreground' : 'fill-warning text-warning'}`} />
        </div>
      )}

      {/* Note title */}
      <h3 className={`font-semibold mb-2 line-clamp-2 ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
        {note.title}
      </h3>

      {/* Content preview */}
      <p className={`text-sm mb-3 line-clamp-2 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
        {getPreview(note.content)}
      </p>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${isSelected 
                  ? 'bg-primary-foreground/20 text-primary-foreground' 
                  : 'bg-primary/10 text-primary'
                }
              `}
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className={`text-xs ${isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Lesson reference */}
          {note.lesson_title && (
            <div className={`flex items-center gap-1 ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              <FileText className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{note.lesson_title}</span>
            </div>
          )}

          {/* Course reference */}
          {note.course_title && !note.lesson_title && (
            <div className={`flex items-center gap-1 ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              <Folder className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{note.course_title}</span>
            </div>
          )}
        </div>

        {/* Last updated */}
        <div className={`flex items-center gap-1 ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          <Clock className="h-3 w-3" />
          <span>{formatDate(note.updated_at)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;
