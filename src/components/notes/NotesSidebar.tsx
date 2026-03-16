import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Folder, 
  FolderOpen, 
  FileText, 
  Star, 
  Clock,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoteCard from './NoteCard';
import NotesSearch from './NotesSearch';
import { Note, NoteFolder } from '@/hooks/useNotes';

interface NotesSidebarProps {
  notes: Note[];
  folders: NoteFolder[];
  selectedNoteId?: number;
  onNoteSelect: (note: Note) => void;
  onNewNote: () => void;
  availableTags: string[];
  isLoading?: boolean;
  className?: string;
}

const NotesSidebar = ({ 
  notes, 
  folders, 
  selectedNoteId, 
  onNoteSelect, 
  onNewNote,
  availableTags,
  isLoading = false,
  className = ''
}: NotesSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    folderId?: number;
    tags?: string[];
    sort?: string;
  }>({});
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Filter and sort notes
  const filteredNotes = notes.filter(note => {
    if (filters.folderId && note.folder_id !== filters.folderId) return false;
    if (filters.tags && filters.tags.length > 0) {
      const noteTags = note.tags || [];
      const hasMatchingTag = filters.tags.some(tag => noteTags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    return true;
  });

  // Group notes by folder
  const notesByFolder = new Map<number, Note[]>();
  const uncategorizedNotes: Note[] = [];

  filteredNotes.forEach(note => {
    if (note.folder_id) {
      if (!notesByFolder.has(note.folder_id)) {
        notesByFolder.set(note.folder_id, []);
      }
      notesByFolder.get(note.folder_id)!.push(note);
    } else {
      uncategorizedNotes.push(note);
    }
  });

  // Quick stats
  const starredCount = filteredNotes.filter(note => note.is_starred).length;
  const recentNotes = filteredNotes
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  return (
    <div className={`flex flex-col h-full bg-card border-r border-border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Notes</h2>
          <Button
            onClick={onNewNote}
            size="sm"
            className="rounded-xl h-8 px-3"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search and filters */}
        <NotesSearch
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          folders={folders}
          availableTags={availableTags}
        />
      </div>

      {/* Quick stats */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/50">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-foreground">{filteredNotes.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/50">
            <Star className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-foreground">{starredCount}</p>
              <p className="text-xs text-muted-foreground">Starred</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-2xl border border-border bg-muted/30 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-1" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recent notes */}
            {recentNotes.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Recent
                </h3>
                <div className="space-y-2">
                  {recentNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isSelected={selectedNoteId === note.id}
                      onClick={() => onNoteSelect(note)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Folder structure */}
            {folders.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Folders
                </h3>
                <div className="space-y-2">
                  {folders.map((folder) => {
                    const folderNotes = notesByFolder.get(folder.id) || [];
                    const isExpanded = expandedFolders.has(folder.id);

                    if (folderNotes.length === 0) return null;

                    return (
                      <div key={folder.id}>
                        <button
                          onClick={() => toggleFolder(folder.id)}
                          className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors"
                        >
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: folder.color || '#3B82F6' }}
                          />
                          <span className="text-sm font-medium text-foreground">
                            {folder.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {folderNotes.length}
                          </span>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="ml-6 space-y-2 overflow-hidden"
                            >
                              {folderNotes.map((note) => (
                                <NoteCard
                                  key={note.id}
                                  note={note}
                                  isSelected={selectedNoteId === note.id}
                                  onClick={() => onNoteSelect(note)}
                                />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Uncategorized notes */}
            {uncategorizedNotes.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Uncategorized
                </h3>
                <div className="space-y-2">
                  {uncategorizedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isSelected={selectedNoteId === note.id}
                      onClick={() => onNoteSelect(note)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {filteredNotes.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notes found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery || filters.folderId || filters.tags?.length
                    ? 'Try adjusting your filters'
                    : 'Create your first note to get started'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSidebar;
