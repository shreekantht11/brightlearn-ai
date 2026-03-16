import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Bookmark,
  Highlighter,
  StickyNote,
  Search,
  Play,
  Code,
  FileText,
  Image,
  CheckCircle2,
  Clock,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface StudyMaterial {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  course_id: number;
  course_title: string;
  lesson_id?: number;
  lesson_title?: string;
  category: string;
  upload_date: string;
  is_completed?: boolean;
  download_count: number;
  content?: string;
  contentType?: 'pdf' | 'text' | 'code' | 'quiz' | 'flashcards' | 'video' | 'interactive';
  estimated_time?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface MaterialViewerProps {
  material: StudyMaterial | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (materialId: number) => void;
}

const MaterialViewer = ({ material, isOpen, onClose, onComplete }: MaterialViewerProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [highlights, setHighlights] = useState<{ [key: string]: string }>({});
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState<Date | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && material) {
      setStudyStartTime(new Date());
      setIsStudying(true);
    } else {
      setIsStudying(false);
    }
  }, [isOpen, material]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderContent = () => {
    if (!material) return null;

    switch (material.contentType) {
      case 'pdf':
        return renderPDFContent();
      case 'text':
        return renderTextContent();
      case 'code':
        return renderCodeContent();
      case 'quiz':
        return renderQuizContent();
      case 'flashcards':
        return renderFlashcardContent();
      case 'video':
        return renderVideoContent();
      case 'interactive':
        return renderInteractiveContent();
      default:
        return renderTextContent();
    }
  };

  const renderPDFContent = () => {
    const totalPages = 10; // Mock page count
    
    return (
      <div className="flex flex-col h-full">
        {/* PDF Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              className="rounded-lg"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
              className="rounded-lg"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-8">
          <div 
            className="bg-white shadow-lg mx-auto"
            style={{ 
              width: `${600 * zoomLevel}px`,
              minHeight: `${800 * zoomLevel}px`,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center'
            }}
          >
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">{material.title}</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  Welcome to {material.title}. This comprehensive guide covers all the essential concepts
                  you need to master this topic. Each section builds upon the previous one, creating a
                  solid foundation for your learning journey.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-2">Chapter {currentPage}: Getting Started</h3>
                <p className="leading-relaxed">
                  In this chapter, we'll explore the fundamental concepts that form the backbone of
                  {material.category.toLowerCase()}. You'll learn through practical examples and
                  hands-on exercises that reinforce your understanding.
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
                  <p className="font-medium text-blue-800">
                    💡 Pro Tip: Take your time with each concept and practice the examples
                    before moving to the next section.
                  </p>
                </div>
                
                <h4 className="text-lg font-semibold mt-4 mb-2">Key Concepts</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Fundamental principles and terminology</li>
                  <li>Practical applications and use cases</li>
                  <li>Best practices and common pitfalls</li>
                  <li>Advanced techniques and optimizations</li>
                </ul>
                
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages} • Estimated reading time: {material.estimated_time} minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTextContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Text Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search in document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBookmarks([...bookmarks, currentPage])}
              className="rounded-lg"
            >
              <Bookmark className="h-4 w-4 mr-1" />
              Bookmark
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-lg"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Text Content Area */}
        <div className={`flex-1 overflow-auto ${isFullscreen ? 'p-12' : 'p-8'} bg-white`}>
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{material.title}</h1>
              
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
                  {material.difficulty}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {material.estimated_time} min read
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {material.category}
                </span>
              </div>

              <div className="space-y-6 text-gray-700">
                <p className="leading-relaxed">
                  {material.content}
                </p>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                  <p className="font-medium text-yellow-800">
                    📝 Note: This is an interactive study material. You can highlight text,
                    add notes, and bookmark important sections as you study.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Key Learning Objectives</h2>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Understand the fundamental concepts and principles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Apply theoretical knowledge to practical scenarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Develop problem-solving skills and critical thinking</span>
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Practice Exercises</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-3">Exercise 1: Quick Assessment</h3>
                  <p className="mb-4">Test your understanding with this quick exercise:</p>
                  <div className="bg-white rounded p-4 border border-blue-200">
                    <p className="font-medium mb-2">Question: What is the primary purpose of {material.category.toLowerCase()}?</p>
                    <Textarea
                      placeholder="Type your answer here..."
                      className="w-full"
                      rows={3}
                    />
                    <Button className="mt-3 rounded-lg">Submit Answer</Button>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Additional Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-2">📚 Recommended Reading</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Advanced concepts documentation</li>
                      <li>• Industry best practices guide</li>
                      <li>• Case studies and examples</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-2">🎯 Practice Tools</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Interactive coding playground</li>
                      <li>• Quiz and assessment tools</li>
                      <li>• Progress tracking dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCodeContent = () => {
    const codeExamples = [
      {
        title: "Basic Example",
        language: "python",
        code: `# Welcome to ${material.title}
# This is a basic example to get you started

def hello_world():
    """A simple hello world function"""
    print("Hello, World!")
    return "Success!"

# Call the function
result = hello_world()
print(f"Function returned: {result}")`
      },
      {
        title: "Advanced Example",
        language: "python", 
        code: `# Advanced ${material.category} example
import asyncio
from typing import List, Dict

class DataProcessor:
    def __init__(self, data: List[Dict]):
        self.data = data
        self.processed = []
    
    async def process_data(self):
        """Process data asynchronously"""
        for item in self.data:
            processed_item = await self.transform(item)
            self.processed.append(processed_item)
        return self.processed
    
    async def transform(self, item: Dict) -> Dict:
        """Transform individual data item"""
        # Add your transformation logic here
        return {
            **item,
            'processed': True,
            'timestamp': datetime.now()
        }`
      }
    ];

    return (
      <div className="flex flex-col h-full">
        {/* Code Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Code Examples</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              <Play className="h-4 w-4 mr-1" />
              Run Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              Copy
            </Button>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 overflow-auto bg-gray-900 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-gray-300">
              <h2 className="text-2xl font-bold mb-4">{material.title} - Code Examples</h2>
              
              {codeExamples.map((example, index) => (
                <div key={index} className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">
                    {example.title}
                  </h3>
                  <div className="bg-black rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                      <span className="text-sm text-gray-400">{example.language}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(example.code)}
                        className="text-gray-400 hover:text-white"
                      >
                        Copy
                      </Button>
                    </div>
                    <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                  
                  {/* Code Output */}
                  <div className="mt-4 bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">Output:</div>
                    <div className="text-green-400 font-mono">
                      <div>Hello, World!</div>
                      <div>Function returned: Success!</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Interactive Code Editor */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3 text-blue-400">
                  Try It Yourself
                </h3>
                <div className="bg-black rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <span className="text-sm text-gray-400">Live Editor</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                  </div>
                  <Textarea
                    placeholder="# Write your code here..."
                    className="w-full h-32 bg-black border-0 text-gray-300 font-mono text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizContent = () => {
    const quizQuestions = [
      {
        id: 1,
        question: "What is the primary purpose of " + material.category.toLowerCase() + "?",
        options: [
          "To make development faster",
          "To solve specific problems",
          "To improve user experience",
          "All of the above"
        ],
        correctAnswer: 3
      },
      {
        id: 2,
        question: "Which of the following is a best practice in " + material.category.toLowerCase() + "?",
        options: [
          "Write clean, readable code",
          "Test thoroughly",
          "Document your work",
          "All of the above"
        ],
        correctAnswer: 3
      }
    ];

    return (
      <div className="flex flex-col h-full">
        {/* Quiz Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <span className="font-semibold">Quiz: {material.title}</span>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Test Your Knowledge</h2>
              <p className="text-gray-600">
                Answer the following questions to check your understanding of {material.title}
              </p>
            </div>

            {quizQuestions.map((question, index) => (
              <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-4">{question.question}</h3>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={optionIndex}
                            onChange={(e) => setQuizAnswers({...quizAnswers, [question.id.toString()]: e.target.value})}
                            className="text-purple-600"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-8">
              <Button className="rounded-lg px-8">
                Submit Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFlashcardContent = () => {
    const flashcards = [
      {
        front: "What is " + material.category + "?",
        back: material.description || "A powerful tool for building modern applications"
      },
      {
        front: "Key benefit of " + material.category,
        back: "Improved productivity, better code organization, and enhanced user experience"
      },
      {
        front: "Common use case",
        back: "Web development, mobile apps, desktop applications, and system integration"
      }
    ];

    const currentCard = flashcards[flashcardIndex];

    return (
      <div className="flex flex-col h-full">
        {/* Flashcard Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">Flashcards: {material.title}</span>
            </div>
            <div className="text-sm text-gray-600">
              {flashcardIndex + 1} of {flashcards.length}
            </div>
          </div>
        </div>

        {/* Flashcard Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <motion.div
              className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-8 min-h-[300px] flex items-center justify-center cursor-pointer"
              onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-4">
                  {showFlashcardAnswer ? 'Answer' : 'Question'}
                </div>
                <div className="text-xl font-medium text-gray-900">
                  {showFlashcardAnswer ? currentCard.back : currentCard.front}
                </div>
              </div>
            </motion.div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setFlashcardIndex(Math.max(0, flashcardIndex - 1));
                  setShowFlashcardAnswer(false);
                }}
                disabled={flashcardIndex === 0}
                className="rounded-lg"
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {flashcards.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === flashcardIndex ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setFlashcardIndex(Math.min(flashcards.length - 1, flashcardIndex + 1));
                  setShowFlashcardAnswer(false);
                }}
                disabled={flashcardIndex === flashcards.length - 1}
                className="rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 border-t border-border bg-gray-50">
          <p className="text-center text-sm text-gray-600">
            Click the card to flip • Use arrow keys to navigate • Press Space to flip
          </p>
        </div>
      </div>
    );
  };

  const renderVideoContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Video Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-red-500" />
            <span className="font-semibold">Video: {material.title}</span>
          </div>
        </div>

        {/* Video Content */}
        <div className="flex-1 bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-4">Video Player</p>
            <p className="text-sm opacity-75">
              Video content would be embedded here
            </p>
            <Button className="mt-4 rounded-lg">
              Play Video
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderInteractiveContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Interactive Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
            <span className="font-semibold">Interactive: {material.title}</span>
          </div>
        </div>

        {/* Interactive Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Interactive Learning Experience</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Live Code Editor</h3>
                  <div className="bg-gray-900 rounded p-4 h-32 font-mono text-sm text-green-400">
                    <div>// Interactive editor</div>
                    <div>function learn() &#123;</div>
                    <div>  return "success";</div>
                    <div>&#125;</div>
                  </div>
                  <Button className="mt-4 rounded-lg w-full">Run Code</Button>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Visualizer</h3>
                  <div className="bg-gray-100 rounded p-4 h-32 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-sm">Interactive visualization</p>
                    </div>
                  </div>
                  <Button className="mt-4 rounded-lg w-full">Explore</Button>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Progress Tracker</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Concept 1</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-20"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Concept 2</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Achievements</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏆</div>
                      <p className="text-xs">First Steps</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">⭐</div>
                      <p className="text-xs">Quick Learner</p>
                    </div>
                    <div className="text-center opacity-50">
                      <div className="text-2xl mb-1">🎯</div>
                      <p className="text-xs">Master</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!material) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={onClose}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-4 bg-background rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', top: '1rem', left: '1rem', right: '1rem', bottom: '1rem' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{material.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {material.course_title} {material.lesson_title && `• ${material.lesson_title}`}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onComplete(material.id)}
                  className="rounded-lg"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content - This is the scrollable area */}
            <div className="flex-1 overflow-auto">
              {renderContent()}
            </div>

            {/* Study Status Bar */}
            {isStudying && (
              <div className="p-4 border-t border-border bg-card flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">
                      Studying for {Math.round((new Date().getTime() - studyStartTime!.getTime()) / 60000)} minutes
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{material.estimated_time || 15} min estimated</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MaterialViewer;
