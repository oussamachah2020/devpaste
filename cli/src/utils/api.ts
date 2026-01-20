import axios, { AxiosInstance } from "axios";
import { getConfig } from "./config";

export interface CreatePasteDto {
  title?: string;
  content: string;
  language?: string;
  expiresIn?: "1hour" | "1day" | "1week" | "never";
  burnAfterRead?: boolean;
  isPrivate?: boolean;
  password?: string;
}

export interface Paste {
  id: string;
  title?: string;
  content: string;
  language: string;
  expiresAt?: string;
  burnAfterRead: boolean;
  isPrivate: boolean;
  hasPassword?: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

class DevPasteAPI {
  private client: AxiosInstance;

  constructor() {
    const config = getConfig();
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }

  async createPaste(data: CreatePasteDto): Promise<Paste> {
    const response = await this.client.post<Paste>("/pastes", data);
    return response.data;
  }

  async getPaste(id: string, password?: string): Promise<Paste> {
    if (password) {
      const response = await this.client.post<Paste>(`/pastes/${id}`, {
        password,
      });
      return response.data;
    }
    const response = await this.client.get<Paste>(`/pastes/${id}`);
    return response.data;
  }

  async deletePaste(id: string): Promise<void> {
    await this.client.delete(`/pastes/${id}`);
  }

  async getRecentPastes(limit = 20): Promise<Paste[]> {
    const response = await this.client.get<Paste[]>(`/pastes?limit=${limit}`);
    return response.data;
  }
}

export const api = new DevPasteAPI();
