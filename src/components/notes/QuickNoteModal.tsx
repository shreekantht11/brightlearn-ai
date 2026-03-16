import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateNote } from '@/hooks/useNotes';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  lessonId?: number;
  lessonTitle?: string;
  courseTitle?: string;
}

const QuickNoteModal = ({ 
  isOpen, 
  onClose, 
  courseId, 
  lessonId, 
  lessonTitle,
  courseTitle 
}: QuickNoteModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const createNoteMutation = useCreateNote();

  // Auto-generate title when opening
  useEffect(() => {
    if (isOpen && !title) {
      const autoTitle = lessonTitle 
        ? `Note: ${lessonTitle}`
        : courseTitle 
          ? `Note: ${courseTitle}`
          : 'Quick Note';
      setTitle(autoTitle);
    }
  }, [isOpen, lessonTitle, courseTitle, title]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current && !isMinimized) {
      textareaRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSave = () => {
    if (!title.trim()) return;

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      course_id: courseId,
      lesson_id: lessonId,
      tags: lessonTitle ? ['#quick-note', '#' + lessonTitle.toLowerCase().replace(/\s+/g, '')] : ['#quick-note']
    };

    createNoteMutation.mutate(noteData, {
      onSuccess: () => {
        setTitle('');
        setContent('');
        onClose();
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ 
            y: isMinimized ? 0 : 0, 
            opacity: 1,
            height: isMinimized ? 'auto' : 'auto'
          }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="pointer-events-auto"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-96 max-w-[90vw]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Quick Note</h3>
                {lessonTitle && (
                  <span className="text-xs text-muted-foreground">
                    - {lessonTitle}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0"
                >
                  <div className={`w-3 h-0.5 bg-current transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    {/* Title */}
                    <Input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Note title..."
                      className="border-border"
                      onKeyDown={handleKeyDown}
                    />

                    {/* Content */}
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Take a quick note..."
                      className="w-full h-32 p-3 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground"
                      onKeyDown={handleKeyDown}
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Ctrl+Enter to save • Esc to close
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onClose}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                        
                        <Button
                          onClick={handleSave}
                          disabled={createNoteMutation.isPending || !title.trim()}
                          className="rounded-xl"
                        >
                          {createNoteMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Minimized state */}
            {isMinimized && (
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground truncate">
                    {title || 'Quick Note'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(false)}
                    className="h-6 w-6 p-0"
                  >
                    <div className="w-3 h-0.5 bg-current" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickNoteModal;
