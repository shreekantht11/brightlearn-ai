import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_URL } from '@/lib/api-config';

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
  course_title?: string;
  lesson_title?: string;
  created_at: string;
  updated_at: string;
}

export interface NoteFolder {
  id: number;
  user_id: number;
  name: string;
  color?: string;
  note_count?: number;
  created_at: string;
  updated_at: string;
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

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const useNotes = (query: NoteSearchQuery = {}) => {
  return useQuery({
    queryKey: ['notes', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.q) params.append('q', query.q);
      if (query.course_id) params.append('course_id', query.course_id.toString());
      if (query.folder_id) params.append('folder_id', query.folder_id.toString());
      if (query.tags?.length) params.append('tags', query.tags.join(','));
      if (query.sort) params.append('sort', query.sort);
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.offset) params.append('offset', query.offset.toString());

      const response = await fetch(`${API_URL}/api/notes?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      return data.data;
    },
  });
};

export const useNote = (noteId: number) => {
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch note');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!noteId,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteData: CreateNoteRequest) => {
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create note');
      console.error('Create note error:', error);
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, updateData }: { noteId: number; updateData: UpdateNoteRequest }) => {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.setQueryData(['note', variables.noteId], data);
    },
    onError: (error) => {
      console.error('Update note error:', error);
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete note');
      console.error('Delete note error:', error);
    },
  });
};

export const useNoteFolders = () => {
  return useQuery({
    queryKey: ['note-folders'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/notes/folders`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      return data.data;
    },
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color?: string }) => {
      const response = await fetch(`${API_URL}/api/notes/folders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-folders'] });
      toast.success('Folder created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create folder');
      console.error('Create folder error:', error);
    },
  });
};

export const useSummarizeNote = () => {
  return useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`${API_URL}/api/notes/${noteId}/summarize`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to summarize note');
      }

      const data = await response.json();
      return data.data;
    },
    onError: (error) => {
      toast.error('Failed to generate summary');
      console.error('Summarize note error:', error);
    },
  });
};

export const useGenerateQuizFromNote = () => {
  return useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`${API_URL}/api/notes/${noteId}/generate-quiz`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      return data.data;
    },
    onError: (error) => {
      toast.error('Failed to generate quiz');
      console.error('Generate quiz error:', error);
    },
  });
};
