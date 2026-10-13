import { apiClient } from './client';
import { ApiResponse, LoginResult, User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResult> => {
    const res = await apiClient.post<ApiResponse<LoginResult>>('/users/login', { email, password });
    return res.data.data;
  },

  register: async (payload: { email: string; password: string; name: string; phone?: string; address?: string }): Promise<User> => {
    const res = await apiClient.post<ApiResponse<User>>('/users/register', payload);
    return res.data.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/users/me');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/users/logout');
  }
};
