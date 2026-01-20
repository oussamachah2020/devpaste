import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface CreatePasteDto {
  title?: string;
  content: string;
  language?: string;
  expiresIn?: "1hour" | "1day" | "1week" | "never";
  burnAfterRead?: boolean;
  password?: boolean;
  isPrivate?: boolean;
}

export interface Paste {
  id: string;
  title?: string;
  content: string;
  language: string;
  expiresAt?: string;
  burnAfterRead: boolean;
  hasPassword?: boolean;
  isPrivate: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export const pasteApi = {
  create: (data: CreatePasteDto) => api.post<Paste>("/pastes", data),

  getById: (id: string, password?: string) => {
    if (password) {
      return api.post<Paste>(`/pastes/${id}`, { password });
    }
    return api.get<Paste>(`/pastes/${id}`);
  },

  getRecent: (limit = 20) => api.get<Paste[]>(`/pastes?limit=${limit}`),

  delete: (id: string) => api.delete(`/pastes/${id}`),
};

export default api;