import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

// Types
export interface StudyMaterial {
  id: number;
  user_id: number;
  course_id: number;
  lesson_id: number;
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
  lesson_title: string;
  content?: string;
  contentType?: 'text' | 'code' | 'quiz' | 'flashcards' | 'video' | 'interactive';
  estimated_time?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  is_enrolled?: boolean;
}

export interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  instructor: string;
  enrolled_date: string;
  progress: number;
}

export interface StudyMaterialSearchQuery {
  q?: string;
  course_id?: number;
  category?: string;
  is_completed?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateStudyMaterialRequest {
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  course_id: number;
  lesson_id: number;
  content?: string;
  contentType?: 'text' | 'code' | 'quiz' | 'flashcards' | 'video' | 'interactive';
  estimated_time?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface UpdateStudyMaterialRequest {
  materialId: number;
  updateData: Partial<StudyMaterial>;
}

// Generate study materials based on courses
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

// Get ALL study materials (not just enrolled courses)
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
        // If API fails, return mock data for ALL courses
        console.warn('Failed to fetch study materials, using mock data for all courses');
        
        // Mock all available courses (not just enrolled)
        const allCourses = [
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
          },
          {
            id: 3,
            title: 'React Development',
            description: 'Build modern web apps with React',
            instructor: 'Mike Johnson',
            enrolled_date: new Date().toISOString(),
            progress: 60
          },
          {
            id: 4,
            title: 'Data Science Fundamentals',
            description: 'Introduction to data science and analytics',
            instructor: 'Sarah Williams',
            enrolled_date: new Date().toISOString(),
            progress: 25
          },
          {
            id: 5,
            title: 'Machine Learning Basics',
            description: 'Learn the fundamentals of machine learning',
            instructor: 'David Brown',
            enrolled_date: new Date().toISOString(),
            progress: 40
          }
        ];
        
        // Generate materials for all courses
        const materials = generateMaterialsForCourses(allCourses);
        
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

// Get study material categories
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
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If API fails, return mock categories
        console.warn('Failed to fetch categories, using mock data');
        return ['Reference', 'Tutorial', 'Quiz', 'Flashcards'];
      }

      return response.json();
    },
    enabled: !!token,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
    retryDelay: 1000,
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
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download material');
      }

      return response.json();
    },
    onSuccess: (data, materialId) => {
      // In a real app, this would trigger a file download
      console.log('Material downloaded:', data);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to download study material');
    }
  });
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

      return response.json();
    },
    onSuccess: () => {
      toast.success('Study material created successfully');
      queryClient.invalidateQueries({ queryKey: ['study-materials'] });
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
    mutationFn: async ({ materialId, updateData }: UpdateStudyMaterialRequest) => {
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
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete study material');
      }

      return materialId;
    },
    onSuccess: () => {
      toast.success('Study material deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['study-materials'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete study material');
    }
  });
};
