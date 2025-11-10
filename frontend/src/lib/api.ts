import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthResponse, User, Category, Test, TestResult, PaginatedResponse } from '@/types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1` || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  
  me: () => api.get<User>('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
};

export const categoryApi = {
  getAll: (params?: { per_page?: number; page?: number }) =>
    api.get<PaginatedResponse<Category>>('/categories', { params }),
  
  getById: (id: number) => api.get<Category>(`/categories/${id}`),
  
  create: (data: { name: string; description?: string }) =>
    api.post<Category>('/categories', data),
  
  update: (id: number, data: { name?: string; description?: string }) =>
    api.put<Category>(`/categories/${id}`, data),
  
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const testApi = {
  getAll: (params?: { per_page?: number; page?: number }) =>
    api.get<PaginatedResponse<Test>>('/tests', { params }),
  
  getById: (id: number) => api.get<Test>(`/tests/${id}`),
  
  create: (data: {
    category_id: number;
    title: string;
    description?: string;
    time_limit_minutes?: number;
    questions: Array<{
      text: string;
    }>;
    scoring_logic?: Record<string, any>;
    result_interpretation?: Record<string, any>;
  }) => api.post<Test>('/tests', data),
  
  update: (id: number, data: {
    category_id?: number;
    title?: string;
    description?: string;
    time_limit_minutes?: number;
    questions?: Array<{
      text: string;
    }>;
    scoring_logic?: Record<string, any>;
    result_interpretation?: Record<string, any>;
  }) => api.put<Test>(`/tests/${id}`, data),
  
  delete: (id: number) => api.delete(`/tests/${id}`),
  
  start: (testId: number) => api.post<{ test_result: TestResult; message: string }>(`/tests/${testId}/start`),
};

export const testResultApi = {
  submitAnswers: (testResultId: number, answers: Array<{
    question_index: number;
    answer_value: number;
  }>) => api.post<{ test_result: TestResult; message: string }>(`/test-results/${testResultId}/submit`, { answers }),
  
  getResult: (testResultId: number) => api.get<TestResult>(`/test-results/${testResultId}`),
  
  getUserResults: (params?: { per_page?: number; page?: number }) =>
    api.get<PaginatedResponse<TestResult>>('/my-test-results', { params }),
};

export default api;
