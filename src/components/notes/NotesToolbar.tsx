import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Link,
  Image,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotesToolbarProps {
  onFormat: (command: string, value?: string) => void;
  className?: string;
}

const NotesToolbar = ({ onFormat, className = '' }: NotesToolbarProps) => {
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const handleFormatClick = (command: string, value?: string) => {
    onFormat(command, value);
    
    // Update active state for toggle commands
    if (['bold', 'italic', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight'].includes(command)) {
      setActiveFormats(prev => {
        const newSet = new Set(prev);
        if (newSet.has(command)) {
          newSet.delete(command);
        } else {
          newSet.add(command);
        }
        return newSet;
      });
    }
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      onFormat('createLink', url);
    }
  };

  const handleImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      onFormat('insertImage', url);
    }
  };

  const toolbarSections = [
    {
      title: 'Text Formatting',
      buttons: [
        { icon: Bold, command: 'bold', tooltip: 'Bold (Ctrl+B)' },
        { icon: Italic, command: 'italic', tooltip: 'Italic (Ctrl+I)' },
        { icon: Underline, command: 'underline', tooltip: 'Underline (Ctrl+U)' },
      ]
    },
    {
      title: 'Headings',
      buttons: [
        { icon: Heading1, command: 'formatBlock', value: 'h1', tooltip: 'Heading 1' },
        { icon: Heading2, command: 'formatBlock', value: 'h2', tooltip: 'Heading 2' },
        { icon: Heading3, command: 'formatBlock', value: 'h3', tooltip: 'Heading 3' },
      ]
    },
    {
      title: 'Lists',
      buttons: [
        { icon: List, command: 'insertUnorderedList', tooltip: 'Bullet List' },
        { icon: ListOrdered, command: 'insertOrderedList', tooltip: 'Numbered List' },
      ]
    },
    {
      title: 'Elements',
      buttons: [
        { icon: Code, command: 'formatBlock', value: 'pre', tooltip: 'Code Block' },
        { icon: Quote, command: 'formatBlock', value: 'blockquote', tooltip: 'Quote' },
      ]
    },
    {
      title: 'Insert',
      buttons: [
        { icon: Link, command: 'custom', action: handleLink, tooltip: 'Insert Link' },
        { icon: Image, command: 'custom', action: handleImage, tooltip: 'Insert Image' },
      ]
    },
    {
      title: 'Alignment',
      buttons: [
        { icon: AlignLeft, command: 'justifyLeft', tooltip: 'Align Left' },
        { icon: AlignCenter, command: 'justifyCenter', tooltip: 'Align Center' },
        { icon: AlignRight, command: 'justifyRight', tooltip: 'Align Right' },
      ]
    }
  ];

  return (
    <div className={`border-b border-border bg-card p-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-1">
        {toolbarSections.map((section, sectionIndex) => (
          <div key={section.title} className="flex items-center gap-1">
            {sectionIndex > 0 && (
              <div className="h-6 w-px bg-border mx-1" />
            )}
            
            {section.buttons.map((button, buttonIndex) => (
              <Button
                key={`${section.title}-${buttonIndex}`}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (button.action) {
                    button.action();
                  } else {
                    handleFormatClick(button.command, button.value);
                  }
                }}
                className={`h-8 w-8 p-0 transition-all duration-200 ${
                  activeFormats.has(button.command)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={button.tooltip}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button.icon className="h-4 w-4" />
                </motion.div>
              </Button>
            ))}
          </div>
        ))}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="mt-2 text-xs text-muted-foreground">
        <span className="font-medium">Shortcuts:</span> Ctrl+B (Bold) • Ctrl+I (Italic) • Ctrl+U (Underline)
      </div>
    </div>
  );
};

export default NotesToolbar;
