import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NoteFolder } from '@/hooks/useNotes';

interface NotesSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: {
    folderId?: number;
    tags?: string[];
    sort?: string;
  }) => void;
  folders: NoteFolder[];
  availableTags: string[];
  className?: string;
}

const NotesSearch = ({ 
  onSearch, 
  onFilterChange, 
  folders, 
  availableTags,
  className = ''
}: NotesSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<number | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('updated');

  const sortOptions = [
    { value: 'updated', label: 'Last Updated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Alphabetical' },
  ];

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onSearch]);

  useEffect(() => {
    onFilterChange({
      folderId: selectedFolder,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sort: sortBy as any,
    });
  }, [selectedFolder, selectedTags, sortBy, onFilterChange]);

  const clearFilters = () => {
    setSelectedFolder(undefined);
    setSelectedTags([]);
    setSortBy('updated');
  };

  const hasActiveFilters = selectedFolder || selectedTags.length > 0 || sortBy !== 'updated';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-12 rounded-2xl border-border bg-card"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-xl"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
              {[selectedFolder, ...selectedTags, sortBy !== 'updated' ? 'sort' : null].filter(Boolean).length}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 p-4 border border-border rounded-2xl bg-card"
          >
            {/* Folder filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Folder</label>
              <select
                value={selectedFolder || ''}
                onChange={(e) => setSelectedFolder(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-3 border border-border rounded-xl bg-background text-foreground"
              >
                <option value="">All Folders</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name} ({folder.note_count || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Tags filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort options */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border border-border rounded-xl bg-background text-foreground"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesSearch;
