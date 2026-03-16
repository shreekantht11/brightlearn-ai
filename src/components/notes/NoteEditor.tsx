import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Eye, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NotesToolbar from './NotesToolbar';
import TagsInput from './TagsInput';
import { Note, UpdateNoteRequest } from '@/hooks/useNotes';

interface NoteEditorProps {
  note: Note | null;
  onUpdate: (updateData: UpdateNoteRequest) => void;
  isUpdating: boolean;
  className?: string;
}

const NoteEditor = ({ note, onUpdate, isUpdating, className = '' }: NoteEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize editor content when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setSaveStatus('saved');
    }
  }, [note]);

  // Auto-save functionality
  const saveNote = useCallback(() => {
    if (!note) return;

    setSaveStatus('saving');
    onUpdate({
      title: title.trim(),
      content: content.trim(),
      tags: tags.filter(tag => tag.trim()),
    });
  }, [note, title, content, tags, onUpdate]);

  // Debounced auto-save
  useEffect(() => {
    if (!note) return;

    clearTimeout(saveTimeoutRef.current);
    setSaveStatus('saving');

    saveTimeoutRef.current = setTimeout(() => {
      saveNote();
    }, 1000);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [title, content, tags, note, saveNote]);

  // Update save status based on update mutation
  useEffect(() => {
    if (isUpdating) {
      setSaveStatus('saving');
    } else if (saveStatus === 'saving') {
      setSaveStatus('saved');
    }
  }, [isUpdating, saveStatus]);

  const handleFormat = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    
    switch (command) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'insertUnorderedList':
      case 'insertOrderedList':
      case 'justifyLeft':
      case 'justifyCenter':
      case 'justifyRight':
        document.execCommand(command, false);
        break;
      
      case 'formatBlock':
        if (value) {
          document.execCommand('formatBlock', false, value);
        }
        break;
      
      case 'createLink':
        if (value) {
          document.execCommand('createLink', false, value);
        }
        break;
      
      case 'insertImage':
        if (value) {
          document.execCommand('insertImage', false, value);
        }
        break;
      
      default:
        break;
    }

    // Update content after formatting
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          handleFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          handleFormat('underline');
          break;
        case 's':
          e.preventDefault();
          saveNote();
          break;
      }
    }
  };

  const processMarkdown = (text: string) => {
    // Simple markdown processing for preview
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  };

  if (!note) {
    return (
      <div className={`flex items-center justify-center h-full bg-card rounded-2xl border border-border ${className}`}>
        <div className="text-center">
          <p className="text-muted-foreground">Select a note to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-card rounded-2xl border border-border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="text-xl font-bold bg-transparent border-none px-0 focus-visible:ring-0"
          />
          
          <div className="flex items-center gap-2">
            {/* Save status */}
            <motion.div
              key={saveStatus}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-1 text-sm ${
                saveStatus === 'saved' ? 'text-emerald-600' :
                saveStatus === 'saving' ? 'text-amber-600' : 'text-red-600'
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Save className="h-3 w-3" />
                  Saved
                </>
              ) : (
                'Error'
              )}
            </motion.div>

            {/* View toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              className="rounded-xl"
            >
              {isPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Tags */}
        <TagsInput
          tags={tags}
          onChange={setTags}
          placeholder="Add tags..."
        />
      </div>

      {/* Toolbar */}
      {!isPreview && <NotesToolbar onFormat={handleFormat} />}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          // Preview mode
          <div className="h-full p-6 overflow-y-auto">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: processMarkdown(content) }}
            />
          </div>
        ) : (
          // Edit mode
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
            className="h-full p-6 overflow-y-auto outline-none"
            style={{ minHeight: '300px' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
