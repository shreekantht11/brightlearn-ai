export interface Note {
  id: number;
  user_id: number;
  course_id: number;
  lesson_id?: number | null;
  title: string;
  content: string;
  tags?: string[];
  attachments?: string[];
  folder_id?: number | null;
  is_starred?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NoteFolder {
  id: number;
  user_id: number;
  name: string;
  color?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  course_id: number;
  lesson_id?: number;
  tags?: string[];
  folder_id?: number;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
  folder_id?: number;
  is_starred?: boolean;
}

export interface NoteSearchQuery {
  q?: string;
  course_id?: number;
  folder_id?: number;
  tags?: string[];
  sort?: 'newest' | 'oldest' | 'updated' | 'title';
  limit?: number;
  offset?: number;
}
