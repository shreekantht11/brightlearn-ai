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
  upload_date: Date;
  created_at: Date;
  updated_at: Date;
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
}

export interface UpdateStudyMaterialRequest {
  title?: string;
  description?: string;
  category?: string;
  is_completed?: boolean;
}

export interface StudyMaterialSearchQuery {
  q?: string;
  course_id?: number;
  category?: string;
  is_completed?: boolean;
  limit?: number;
  offset?: number;
}
