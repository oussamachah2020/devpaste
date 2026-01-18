import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (
    typeof window !== 'undefined' && window.location.origin.includes('localhost')
      ? 'http://localhost:4000'
      : '/api'
  ),
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CreatePasteDto {
  title?: string;
  content: string;
  language?: string;
  expiresIn?: '1hour' | '1day' | '1week' | 'never';
  burnAfterRead?: boolean;
  isPrivate?: boolean;
}

export interface Paste {
  id: string;
  title?: string;
  content: string;
  language: string;
  expiresAt?: string;
  burnAfterRead: boolean;
  isPrivate: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export const pasteApi = {
  create: (data: CreatePasteDto) => 
    api.post<Paste>('/pastes', data),
  
  getById: (id: string) => 
    api.get<Paste>(`/pastes/${id}`),
 
  
  getRecent: (limit = 20) => 
    api.get<Paste[]>(`/pastes?limit=${limit}`),
  
  delete: (id: string) => 
    api.delete(`/pastes/${id}`),
};

export default api;