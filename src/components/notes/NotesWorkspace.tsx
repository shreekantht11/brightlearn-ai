import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  FolderPlus, 
  Download, 
  Brain, 
  Star,
  MoreVertical,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotesSidebar from './NotesSidebar';
import NoteEditor from './NoteEditor';
import { 
  useNotes, 
  useNoteFolders, 
  useCreateNote, 
  useUpdateNote,
  useDeleteNote,
  useCreateFolder,
  useSummarizeNote,
  useGenerateQuizFromNote,
  Note,
  NoteFolder
} from '@/hooks/useNotes';

interface NotesWorkspaceProps {
  courseId?: number;
  lessonId?: number;
  className?: string;
}

const NotesWorkspace = ({ 
  courseId = 1, // Default to course 1 for demo
  lessonId,
  className = ''
}: NotesWorkspaceProps) => {
  const { id } = useParams();
  const [selectedNoteId, setSelectedNoteId] = useState<number | undefined>();
  const [showMetadata, setShowMetadata] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    folderId?: number;
    tags?: string[];
    sort?: string;
  }>({});

  // Fetch notes and folders
  const { data: notesData, isLoading: notesLoading } = useNotes({
    q: searchQuery,
    course_id: courseId,
    folder_id: filters.folderId,
    tags: filters.tags,
    sort: filters.sort as 'newest' | 'oldest' | 'updated' | 'title'
  });
  const { data: folders = [], isLoading: foldersLoading } = useNoteFolders();
  
  // Mutations
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const createFolderMutation = useCreateFolder();
  const summarizeMutation = useSummarizeNote();
  const generateQuizMutation = useGenerateQuizFromNote();

  const notes = notesData?.notes || [];
  const selectedNote = notes.find(note => note.id === selectedNoteId);

  // Extract available tags from notes
  const availableTags = Array.from(
    new Set(notes.flatMap(note => note.tags || []))
  ).slice(0, 20) as string[];

  // Handle note selection
  const handleNoteSelect = (note: Note) => {
    setSelectedNoteId(note.id);
  };

  // Handle new note creation
  const handleNewNote = () => {
    const newNoteData = {
      title: 'New Note',
      content: '',
      course_id: courseId,
      lesson_id: lessonId,
      tags: [],
    };

    createNoteMutation.mutate(newNoteData, {
      onSuccess: (createdNote) => {
        setSelectedNoteId(createdNote.id);
      }
    });
  };

  // Handle note updates
  const handleNoteUpdate = (updateData: any) => {
    if (!selectedNoteId) return;
    
    updateNoteMutation.mutate({
      noteId: selectedNoteId,
      updateData
    });
  };

  // Handle note deletion
  const handleDeleteNote = () => {
    if (!selectedNoteId) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate(selectedNoteId, {
        onSuccess: () => {
          setSelectedNoteId(undefined);
        }
      });
    }
  };

  // Handle folder creation
  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      createFolderMutation.mutate({ name: folderName });
    }
  };

  // Handle note actions
  const handleStarNote = () => {
    if (!selectedNote) return;
    
    handleNoteUpdate({
      is_starred: !selectedNote.is_starred
    });
  };

  const handleSummarize = () => {
    if (!selectedNoteId) return;
    
    summarizeMutation.mutate(selectedNoteId, {
      onSuccess: (data) => {
        alert(`Summary: ${data.summary}`);
      }
    });
  };

  const handleGenerateQuiz = () => {
    if (!selectedNoteId) return;
    
    generateQuizMutation.mutate(selectedNoteId, {
      onSuccess: (data: any) => {
        const quiz = data.quiz;
        alert(`Quiz generated with ${quiz.questions.length} questions`);
      }
    });
  };

  const handleExport = (format: 'pdf' | 'markdown' | 'text') => {
    if (!selectedNote) return;
    
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'markdown':
        content = `# ${selectedNote.title}\n\n${selectedNote.content}`;
        filename = `${selectedNote.title}.md`;
        mimeType = 'text/markdown';
        break;
      case 'text':
        content = `${selectedNote.title}\n\n${selectedNote.content}`;
        filename = `${selectedNote.title}.txt`;
        mimeType = 'text/plain';
        break;
      case 'pdf':
        // For PDF, we'll use the browser's print functionality
        window.print();
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Left Sidebar - Notes List */}
      <div className="w-80 flex-shrink-0">
        <NotesSidebar
          notes={notes}
          folders={folders}
          selectedNoteId={selectedNoteId}
          onNoteSelect={handleNoteSelect}
          onNewNote={handleNewNote}
          availableTags={availableTags}
          isLoading={notesLoading || foldersLoading}
        />
      </div>

      {/* Center - Note Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Editor toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStarNote}
                  className="rounded-xl"
                >
                  <Star className={`h-4 w-4 ${selectedNote.is_starred ? 'fill-warning text-warning' : ''}`} />
                </Button>
                
                <div className="h-6 w-px bg-border" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMetadata(!showMetadata)}
                  className="rounded-xl"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSummarize}
                  disabled={summarizeMutation.isPending}
                  className="rounded-xl"
                >
                  <Brain className="h-4 w-4 mr-1" />
                  Summarize
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateQuiz}
                  disabled={generateQuizMutation.isPending}
                  className="rounded-xl"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Quiz
                </Button>

                <div className="h-6 w-px bg-border" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExport('markdown')}
                  className="rounded-xl"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteNote}
                  disabled={deleteNoteMutation.isPending}
                  className="rounded-xl text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 p-4">
              <NoteEditor
                note={selectedNote}
                onUpdate={handleNoteUpdate}
                isUpdating={updateNoteMutation.isPending}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No note selected
              </h3>
              <p className="text-muted-foreground mb-4">
                Select a note from the sidebar or create a new one
              </p>
              <Button onClick={handleNewNote} className="rounded-xl">
                Create New Note
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Metadata */}
      <AnimatePresence>
        {showMetadata && selectedNote && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 border-l border-border bg-card"
          >
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Note Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMetadata(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
                  <p className="text-sm text-foreground">
                    {new Date(selectedNote.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-sm text-foreground">
                    {new Date(selectedNote.updated_at).toLocaleDateString()}
                  </p>
                </div>

                {selectedNote.course_title && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Course</p>
                    <p className="text-sm text-foreground">{selectedNote.course_title}</p>
                  </div>
                )}

                {selectedNote.lesson_title && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Lesson</p>
                    <p className="text-sm text-foreground">{selectedNote.lesson_title}</p>
                  </div>
                )}

                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedNote.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick actions */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Quick Actions</p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateFolder()}
                      className="w-full justify-start rounded-xl"
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      New Folder
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesWorkspace;
