import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Search,
  Folder,
  Calendar,
  User,
  Loader2,
  Eye,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import MaterialViewer from '@/components/study-materials/MaterialViewer';
import { 
  useStudyMaterials,
  useEnrolledCourses,
  useStudyMaterialCategories,
  useUpdateStudyMaterial,
  useDownloadStudyMaterial
} from '@/hooks/useStudyMaterials';
import type { StudyMaterial, EnrolledCourse } from '@/hooks/useStudyMaterials';

const StudyMaterials = () => {
  const [viewerMaterial, setViewerMaterial] = useState<StudyMaterial | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const token = localStorage.getItem('token');

  // Fetch enrolled courses and study materials (enrolled only)
  const { data: materialsData, isLoading: materialsLoading } = useStudyMaterials({
    q: searchQuery,
    course_id: selectedCourse || undefined,
    category: selectedCategory || undefined
  });
  const { data: enrolledCourses = [], isLoading: coursesLoading } = useEnrolledCourses();
  const { data: categories = [] } = useStudyMaterialCategories();
  
  const materials = materialsData?.materials || [];
  const enrolledCoursesList = enrolledCourses || [];
  
  // Mutations
  const updateMaterialMutation = useUpdateStudyMaterial();
  const downloadMutation = useDownloadStudyMaterial();

  // Handle view button click - only enrolled materials are shown
  const handleViewClick = (material: StudyMaterial) => {
    console.log('View button clicked for material:', material);
    setViewerMaterial(material);
    setIsViewerOpen(true);
  };

  // Handle mark complete
  const handleMarkComplete = (materialId: number) => {
    updateMaterialMutation.mutate({
      materialId,
      updateData: { is_completed: true }
    });
  };

  // Handle view complete
  const handleViewComplete = (materialId: number) => {
    updateMaterialMutation.mutate({
      materialId,
      updateData: { is_completed: true }
    });
  };

  // Handle download
  const handleDownload = async (material: StudyMaterial) => {
    setDownloading(material.id);
    
    try {
      await downloadMutation.mutate(material.id);
      toast.success(`Downloaded: ${material.title}`);
    } catch (error) {
      toast.error('Failed to download material');
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'xls':
      case 'xlsx':
        return '📈';
      case 'zip':
      case 'rar':
        return '🗂️';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥';
      case 'mp3':
      case 'wav':
        return '🎵';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'txt':
      case 'md':
        return '📄';
      default:
        return '📄';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getContentTypeIcon = (contentType?: string) => {
    switch (contentType) {
      case 'pdf': return '📄';
      case 'text': return '📝';
      case 'code': return '💻';
      case 'quiz': return '🧠';
      case 'flashcards': return '🗂️';
      case 'video': return '🎥';
      case 'interactive': return '🎮';
      default: return '📄';
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access your study materials</p>
            <Button onClick={() => window.location.href = '/login'}>Sign In</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (materialsLoading || coursesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  // Show enroll message if no courses are enrolled
  if (enrolledCoursesList.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Courses Enrolled</h2>
            <p className="text-muted-foreground mb-6">
              You need to enroll in courses to access study materials. Browse our course catalog and enroll in courses that interest you!
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = '/courses'} className="rounded-xl">
                Browse Courses
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'} className="rounded-xl">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black text-foreground mb-2">Study Materials</h1>
              <p className="text-lg text-muted-foreground">
                Access learning resources from your enrolled courses
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Enrolled</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-blue-500 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{enrolledCoursesList.length}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Enrolled Courses</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-purple-500 flex items-center justify-center">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-purple-900 dark:text-purple-100">{materials.length}</p>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Total Materials</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-green-900 dark:text-green-100">
                  {materials.filter(m => m.is_completed).length}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">Completed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-0 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-orange-500 flex items-center justify-center">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-orange-900 dark:text-orange-100">
                  {materials.reduce((acc, m) => acc + (m.estimated_time || 0), 0)}
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Min Est. Time</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search study materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              
              <select
                value={selectedCourse || ''}
                onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : null)}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-foreground"
              >
                <option value="">All Courses</option>
                {enrolledCoursesList.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-foreground"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Study Materials Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCourse || selectedCategory
                  ? 'Try adjusting your filters'
                  : 'No materials available for your enrolled courses'}
              </p>
            </motion.div>
          ) : (
            materials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                {/* Header with content type icon */}
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">
                      {getContentTypeIcon(material.contentType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                            {material.title}
                          </h3>
                          <p className="text-sm line-clamp-2 text-gray-600 dark:text-gray-300">
                            {material.description}
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {material.is_completed && (
                            <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                              <CheckCircle2 className="h-3 w-3 inline mr-1" />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{material.course_title}</span>
                        </div>
                        
                        {material.lesson_title && (
                          <div className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            <span>{material.lesson_title}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(material.upload_date).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{material.download_count}</span>
                        </div>
                        
                        <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {material.category}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleViewClick(material)}
                          className="flex-1 rounded-xl font-medium transition-all bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        
                        <Button
                          onClick={() => handleDownload(material)}
                          disabled={downloading === material.id}
                          className="rounded-xl font-medium transition-all bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {downloading === material.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleMarkComplete(material.id)}
                          className="rounded-xl border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {material.is_completed ? 'Undo' : 'Done'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <Footer />

      {/* Material Viewer Modal */}
      <MaterialViewer
        material={viewerMaterial}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        onComplete={handleViewComplete}
      />
    </div>
  );
};

export default StudyMaterials;
