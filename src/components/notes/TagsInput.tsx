import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X } from 'lucide-react';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

const TagsInput = ({ 
  tags, 
  onChange, 
  placeholder = "Add a tag...", 
  suggestions = [],
  className = ""
}: TagsInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const commonTags = [
    '#python', '#javascript', '#react', '#nodejs', '#html', '#css',
    '#important', '#exam', '#review', '#basics', '#advanced',
    '#functions', '#loops', '#arrays', '#objects', '#api'
  ];

  const allSuggestions = [...suggestions, ...commonTags];

  useEffect(() => {
    if (inputValue.startsWith('#')) {
      const filtered = allSuggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(suggestion)
      );
      setFilteredSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, tags, suggestions]);

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`;
    if (cleanTag && !tags.includes(cleanTag)) {
      onChange([...tags, cleanTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputClick = () => {
    if (!inputValue.startsWith('#')) {
      setInputValue('#');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Tags display */}
      <div className="flex flex-wrap gap-2 p-3 border border-border rounded-2xl bg-card min-h-[48px] items-center">
        {tags.map((tag, index) => (
          <motion.span
            key={`${tag}-${index}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
          >
            <Tag className="h-3 w-3" />
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-primary/70 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.span>
        ))}
        
        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-card border border-border rounded-2xl shadow-lg overflow-hidden"
          >
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span>{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help text */}
      {tags.length === 0 && !inputValue && (
        <p className="text-xs text-muted-foreground mt-2">
          Type # to add tags (e.g., #python, #important)
        </p>
      )}
    </div>
  );
};

export default TagsInput;
