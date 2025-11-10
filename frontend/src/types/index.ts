export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  tests_count?: number;
  created_at: string;
  updated_at: string;
}

export type TestType = 'likert' | 'yes_no';

export interface LikertQuestion {
  text: string;
}

export interface YesNoQuestion {
  text: string;
}

export type Question = LikertQuestion | YesNoQuestion;

export interface Test {
  id: number;
  category_id: number;
  title: string;
  description?: string;
  test_type: TestType;
  time_limit_minutes?: number;
  questions: Question[];
  scoring_logic?: Record<string, any>;
  result_interpretation?: Record<string, any>;
  category?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface TestAnswer {
  id: number;
  test_result_id: number;
  question_index: number;
  answer_value?: number;
  answer_text?: string;
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: number;
  user_id: number;
  test_id: number;
  scores?: Record<string, any>;
  interpretation?: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  test?: Test;
  answers?: TestAnswer[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

