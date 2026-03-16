import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_URL } from '@/lib/api-config';

export interface StudyMaterial {
  id: number;
  user_id: number;
  course_id: number;
  lesson_id?: number;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  is_completed: boolean;
  download_count: number;
  upload_date: string;
  created_at: string;
  updated_at: string;
  course_title: string;
  lesson_title?: string;
  content?: string;
  contentType?: 'pdf' | 'text' | 'code' | 'quiz' | 'flashcards' | 'video' | 'interactive';
  estimated_time?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  is_enrolled?: boolean;
}

export interface CreateStudyMaterialRequest {
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  course_id: number;
  lesson_id?: number;
  content?: string;
  contentType?: 'pdf' | 'text' | 'code' | 'quiz' | 'flashcards' | 'video' | 'interactive';
  estimated_time?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface UpdateStudyMaterialRequest {
  title?: string;
  description?: string;
  category?: string;
  is_completed?: boolean;
  content?: string;
  contentType?: 'pdf' | 'text' | 'code' | 'quiz' | 'flashcards' | 'video' | 'interactive';
  estimated_time?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface StudyMaterialSearchQuery {
  q?: string;
  course_id?: number;
  category?: string;
  is_completed?: boolean;
  limit?: number;
  offset?: number;
}

export interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  instructor: string;
  enrolled_date: string;
  progress: number;
  thumbnail?: string;
}

// Get all study materials from all courses (for discovery)
export const useAllStudyMaterials = (query?: StudyMaterialSearchQuery) => {
  const token = localStorage.getItem('token');
  
  return useQuery({
    queryKey: ['all-study-materials', query],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      if (query?.q) params.append('q', query.q);
      if (query?.course_id) params.append('course_id', query.course_id.toString());
      if (query?.category) params.append('category', query.category);
      if (query?.is_completed !== undefined) params.append('is_completed', query.is_completed.toString());
      if (query?.limit) params.append('limit', query.limit.toString());
      if (query?.offset) params.append('offset', query.offset.toString());

      const response = await fetch(`${API_URL}/api/study-materials/all?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If API fails, return mock data for demonstration
        console.warn('Failed to fetch all study materials, using mock data');
        return {
          materials: [
            {
              id: 1,
              user_id: 1,
              course_id: 1,
              lesson_id: 1,
              title: 'Python Fundamentals Cheat Sheet',
              description: 'Complete reference guide for Python basics with interactive examples',
              file_url: '/materials/python-cheatsheet.pdf',
              file_type: 'PDF',
              file_size: 2048576,
              category: 'Reference',
              is_completed: true,
              download_count: 145,
              upload_date: '2024-01-15',
              created_at: '2024-01-15',
              updated_at: '2024-01-15',
              course_title: 'Python for Beginners',
              lesson_title: 'Introduction to Python',
              content: 'This comprehensive Python cheat sheet covers all fundamental concepts including variables, data types, control flow, functions, and object-oriented programming. Each section includes practical examples and best practices.',
              contentType: 'text',
              estimated_time: 15,
              difficulty: 'beginner',
              is_enrolled: true
            },
            {
              id: 2,
              user_id: 1,
              course_id: 2,
              lesson_id: 2,
              title: 'JavaScript Practice Exercises',
              description: 'Hands-on coding exercises with solutions and interactive challenges',
              file_url: '/materials/js-exercises.zip',
              file_type: 'ZIP',
              file_size: 5242880,
              category: 'Exercises',
              is_completed: false,
              download_count: 89,
              upload_date: '2024-01-20',
              created_at: '2024-01-20',
              updated_at: '2024-01-20',
              course_title: 'Advanced JavaScript',
              lesson_title: 'Advanced Concepts',
              content: 'Practice your JavaScript skills with these carefully crafted exercises. From basic syntax to advanced concepts, each exercise comes with detailed explanations and multiple solution approaches.',
              contentType: 'code',
              estimated_time: 25,
              difficulty: 'intermediate',
              is_enrolled: true
            },
            {
              id: 3,
              user_id: 1,
              course_id: 2,
              lesson_id: 3,
              title: 'React Components Guide',
              description: 'Understanding React component patterns and best practices',
              file_url: '/materials/react-guide.pdf',
              file_type: 'PDF',
              file_size: 1536000,
              category: 'Tutorial',
              is_completed: false,
              download_count: 67,
              upload_date: '2024-01-22',
              created_at: '2024-01-22',
              updated_at: '2024-01-22',
              course_title: 'Advanced JavaScript',
              lesson_title: 'React Fundamentals',
              content: 'Master React components with this comprehensive guide covering functional components, hooks, state management, and performance optimization.',
              contentType: 'interactive',
              estimated_time: 30,
              difficulty: 'intermediate',
              is_enrolled: true
            },
            {
              id: 4,
              user_id: 1,
              course_id: 1,
              lesson_id: 4,
              title: 'Python Data Structures Quiz',
              description: 'Test your knowledge of Python data structures with interactive questions',
              file_url: '/materials/python-ds-quiz.pdf',
              file_type: 'PDF',
              file_size: 1024000,
              category: 'Quiz',
              is_completed: false,
              download_count: 45,
              upload_date: '2024-01-25',
              created_at: '2024-01-25',
              updated_at: '2024-01-25',
              course_title: 'Python for Beginners',
              lesson_title: 'Data Structures',
              content: 'Challenge yourself with this comprehensive quiz covering lists, dictionaries, sets, tuples, and more advanced data structures in Python.',
              contentType: 'quiz',
              estimated_time: 20,
              difficulty: 'beginner',
              is_enrolled: true
            },
            {
              id: 5,
              user_id: 1,
              course_id: 2,
              lesson_id: 5,
              title: 'JavaScript Flashcards',
              description: 'Quick reference flashcards for JavaScript concepts and syntax',
              file_url: '/materials/js-flashcards.pdf',
              file_type: 'PDF',
              file_size: 512000,
              category: 'Reference',
              is_completed: false,
              download_count: 32,
              upload_date: '2024-01-28',
              created_at: '2024-01-28',
              updated_at: '2024-01-28',
              course_title: 'Advanced JavaScript',
              lesson_title: 'Quick Reference',
              content: 'Study JavaScript concepts effectively with these flashcards covering ES6 features, DOM manipulation, async programming, and modern JavaScript patterns.',
              contentType: 'flashcards',
              estimated_time: 15,
              difficulty: 'intermediate',
              is_enrolled: true
            },
            {
              id: 6,
              user_id: 1,
              course_id: 3,
              lesson_id: 1,
              title: 'React Hooks Deep Dive',
              description: 'Comprehensive guide to React Hooks with practical examples',
              file_url: '/materials/react-hooks.pdf',
              file_type: 'PDF',
              file_size: 3072000,
              category: 'Tutorial',
              is_completed: false,
              download_count: 234,
              upload_date: '2024-02-01',
              created_at: '2024-02-01',
              updated_at: '2024-02-01',
              course_title: 'React Masterclass',
              lesson_title: 'Advanced Hooks',
              content: 'Master React Hooks with this comprehensive guide covering useState, useEffect, useContext, useReducer, and custom hooks.',
              contentType: 'text',
              estimated_time: 45,
              difficulty: 'advanced',
              is_enrolled: false
            },
            {
              id: 7,
              user_id: 1,
              course_id: 3,
              lesson_id: 2,
              title: 'State Management Patterns',
              description: 'Learn advanced state management patterns in React applications',
              file_url: '/materials/state-management.zip',
              file_type: 'ZIP',
              file_size: 4096000,
              category: 'Tutorial',
              is_completed: false,
              download_count: 156,
              upload_date: '2024-02-05',
              created_at: '2024-02-05',
              updated_at: '2024-02-05',
              course_title: 'React Masterclass',
              lesson_title: 'Advanced State',
              content: 'Explore advanced state management patterns including Redux, MobX, Zustand, and custom solutions for complex React applications.',
              contentType: 'code',
              estimated_time: 60,
              difficulty: 'advanced',
              is_enrolled: false
            },
            {
              id: 8,
              user_id: 1,
              course_id: 4,
              lesson_id: 1,
              title: 'Node.js Basics',
              description: 'Introduction to Node.js server-side JavaScript',
              file_url: '/materials/nodejs-basics.pdf',
              file_type: 'PDF',
              file_size: 2560000,
              category: 'Tutorial',
              is_completed: false,
              download_count: 412,
              upload_date: '2024-02-10',
              created_at: '2024-02-10',
              updated_at: '2024-02-10',
              course_title: 'Backend Development',
              lesson_title: 'Getting Started',
              content: 'Learn the fundamentals of Node.js including modules, file system, HTTP server, and package management.',
              contentType: 'text',
              estimated_time: 35,
              difficulty: 'intermediate',
              is_enrolled: false
            },
            {
              id: 9,
              user_id: 1,
              course_id: 4,
              lesson_id: 2,
              title: 'Express.js Fundamentals',
              description: 'Build web servers with Express.js framework',
              file_url: '/materials/express-fundamentals.pdf',
              file_type: 'PDF',
              file_size: 3145728,
              category: 'Tutorial',
              is_completed: false,
              download_count: 289,
              upload_date: '2024-02-12',
              created_at: '2024-02-12',
              updated_at: '2024-02-12',
              course_title: 'Backend Development',
              lesson_title: 'Web Frameworks',
              content: 'Master Express.js fundamentals including routing, middleware, error handling, and building RESTful APIs.',
              contentType: 'interactive',
              estimated_time: 40,
              difficulty: 'intermediate',
              is_enrolled: false
            },
            {
              id: 10,
              user_id: 1,
              course_id: 5,
              lesson_id: 1,
              title: 'CSS Grid Layout',
              description: 'Modern CSS Grid layout techniques and best practices',
              file_url: '/materials/css-grid.pdf',
              file_type: 'PDF',
              file_size: 2048000,
              category: 'Reference',
              is_completed: false,
              download_count: 378,
              upload_date: '2024-02-15',
              created_at: '2024-02-15',
              updated_at: '2024-02-15',
              course_title: 'Frontend Design',
              lesson_title: 'Layout Systems',
              content: 'Master CSS Grid and Flexbox for creating responsive, modern layouts with practical examples and best practices.',
              contentType: 'text',
              estimated_time: 25,
              difficulty: 'intermediate',
              is_enrolled: false
            }
          ],
          total: 10
        };
      }

      return response.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });
};

// Get user's study materials (only for enrolled courses)
export const useStudyMaterials = (query?: StudyMaterialSearchQuery) => {
  const token = localStorage.getItem('token');
  
  return useQuery({
    queryKey: ['study-materials', query],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      if (query?.q) params.append('q', query.q);
      if (query?.course_id) params.append('course_id', query.course_id.toString());
      if (query?.category) params.append('category', query.category);
      if (query?.is_completed !== undefined) params.append('is_completed', query.is_completed.toString());
      if (query?.limit) params.append('limit', query.limit.toString());
      if (query?.offset) params.append('offset', query.offset.toString());

      const response = await fetch(`${API_URL}/api/study-materials?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If API fails, get enrolled courses and generate materials dynamically
        console.warn('Failed to fetch study materials, generating from enrolled courses');
        
        // Fetch enrolled courses to generate materials
        try {
          const coursesResponse = await fetch(`${API_URL}/api/enroll/my-courses`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          let enrolledCourses: EnrolledCourse[] = [];
          
          if (coursesResponse.ok) {
            enrolledCourses = await coursesResponse.json();
          } else {
            // Use mock enrolled courses as fallback
            enrolledCourses = [
              {
                id: 1,
                title: 'Python for Beginners',
                description: 'Learn Python programming from scratch',
                instructor: 'John Doe',
                enrolled_date: new Date().toISOString(),
                progress: 45
              },
              {
                id: 2,
                title: 'Advanced JavaScript',
                description: 'Master advanced JavaScript concepts',
                instructor: 'Jane Smith',
                enrolled_date: new Date().toISOString(),
                progress: 30
              }
            ];
          }
          
          // Generate materials based on enrolled courses
          const materials = generateMaterialsForCourses(enrolledCourses);
          
          // Apply filters
          let filteredMaterials = materials;
          
          if (query?.course_id) {
            filteredMaterials = filteredMaterials.filter(m => m.course_id === query.course_id);
          }
          
          if (query?.category) {
            filteredMaterials = filteredMaterials.filter(m => m.category === query.category);
          }
          
          if (query?.is_completed !== undefined) {
            filteredMaterials = filteredMaterials.filter(m => m.is_completed === query.is_completed);
          }
          
          if (query?.q) {
            const searchLower = query.q.toLowerCase();
            filteredMaterials = filteredMaterials.filter(m => 
              m.title.toLowerCase().includes(searchLower) ||
              m.description.toLowerCase().includes(searchLower) ||
              m.course_title.toLowerCase().includes(searchLower)
            );
          }
          
          return {
            materials: filteredMaterials,
            total: filteredMaterials.length
          };
          
        } catch (error) {
          console.error('Failed to generate materials:', error);
          return {
            materials: [],
            total: 0
          };
        }
      }

      return response.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });
};

// Get user's enrolled courses
export const useEnrolledCourses = () => {
  const token = localStorage.getItem('token');
  
  return useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/enroll/my-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If API fails, return mock data for demonstration
        console.warn('Failed to fetch enrolled courses, using mock data');
        return [
          {
            id: 1,
            title: 'Python for Beginners',
            description: 'Learn Python programming from scratch',
            instructor: 'John Doe',
            enrolled_date: new Date().toISOString(),
            progress: 45
          },
          {
            id: 2,
            title: 'Advanced JavaScript',
            description: 'Master advanced JavaScript concepts',
            instructor: 'Jane Smith',
            enrolled_date: new Date().toISOString(),
            progress: 30
          }
        ];
      }

      return response.json();
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });
};

// Generate study materials based on enrolled courses
const generateMaterialsForCourses = (courses: EnrolledCourse[]): StudyMaterial[] => {
  const materials: StudyMaterial[] = [];
  let materialId = 1;

  courses.forEach(course => {
    // Generate 2-3 materials per course
    const materialCount = Math.floor(Math.random() * 2) + 2; // 2-3 materials
    
    for (let i = 0; i < materialCount; i++) {
      const materialTypes = [
        { type: 'text', title: 'Complete Guide', category: 'Reference', time: 15 },
        { type: 'quiz', title: 'Knowledge Test', category: 'Quiz', time: 20 },
        { type: 'interactive', title: 'Interactive Tutorial', category: 'Tutorial', time: 30 },
        { type: 'flashcards', title: 'Quick Reference', category: 'Reference', time: 15 }
      ];
      
      const materialType = materialTypes[i % materialTypes.length];
      
      materials.push({
        id: materialId++,
        user_id: 1,
        course_id: course.id,
        lesson_id: materialId,
        title: `${course.title}: ${materialType.title}`,
        description: `Comprehensive ${materialType.title.toLowerCase()} for ${course.title}`,
        file_url: `/materials/${course.title.toLowerCase().replace(/\s+/g, '-')}-${materialType.type}.pdf`,
        file_type: 'PDF',
        file_size: Math.floor(Math.random() * 3000000) + 500000, // 0.5MB - 3.5MB
        category: materialType.category,
        is_completed: false, // No completion tracking
        download_count: Math.floor(Math.random() * 200) + 10,
        upload_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        course_title: course.title,
        lesson_title: `Lesson ${i + 1}`,
        content: `This comprehensive ${materialType.title.toLowerCase()} covers all essential concepts for ${course.title}.`,
        contentType: materialType.type as any,
        estimated_time: materialType.time,
        difficulty: course.id === 1 ? 'beginner' : 'intermediate',
        is_enrolled: true
      });
    }
  });

  return materials;
};

// Create study material
export const useCreateStudyMaterial = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  return useMutation({
    mutationFn: async (materialData: CreateStudyMaterialRequest) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/study-materials`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        throw new Error('Failed to create study material');
      }

      const newMaterial = await response.json();
      
      // Invalidate study materials cache
      queryClient.invalidateQueries({ queryKey: ['study-materials'] });
      
      return newMaterial;
    },
    onSuccess: () => {
      toast.success('Study material created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create study material');
    }
  });
};

// Update study material
export const useUpdateStudyMaterial = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  return useMutation({
    mutationFn: async ({ materialId, updateData }: { materialId: number; updateData: UpdateStudyMaterialRequest }) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/study-materials/${materialId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update study material');
      }

      const updatedMaterial = await response.json();
      
      // Invalidate study materials cache
      queryClient.invalidateQueries({ queryKey: ['study-materials'] });
      
      return updatedMaterial;
    },
    onSuccess: () => {
      toast.success('Study material updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update study material');
    }
  });
};

// Delete study material
export const useDeleteStudyMaterial = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  return useMutation({
    mutationFn: async (materialId: number) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/study-materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete study material');
      }

      // Invalidate study materials cache
      queryClient.invalidateQueries({ queryKey: ['study-materials'] });
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Study material deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete study material');
    }
  });
};

// Download study material
export const useDownloadStudyMaterial = () => {
  const token = localStorage.getItem('token');

  return useMutation({
    mutationFn: async (materialId: number) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/study-materials/${materialId}/download`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download study material');
      }

      return response.json();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to download study material');
    }
  });
};

// Get categories
export const useStudyMaterialCategories = () => {
  const token = localStorage.getItem('token');
  
  return useQuery({
    queryKey: ['study-material-categories'],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/study-materials/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If API fails, return mock categories for demonstration
        console.warn('Failed to fetch categories, using mock data');
        return ['Reference', 'Exercises', 'Tutorial', 'Quiz', 'Code', 'Interactive'];
      }

      return response.json();
    },
    enabled: !!token,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });
};

// Get materials by course
export const useMaterialsByCourse = (courseId: number) => {
  const token = localStorage.getItem('token');
  
  return useQuery({
    queryKey: ['study-materials', 'course', courseId],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/study-materials/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course materials');
      }

      return response.json();
    },
    enabled: !!token && !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
