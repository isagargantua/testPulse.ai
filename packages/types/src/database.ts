// Database Types
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';
export type ProjectStatus = 'active' | 'archived';
export type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type AnalysisStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type FailureCategory =
  | 'synchronization'
  | 'overlay'
  | 'iframe'
  | 'stale_element'
  | 'locator_instability'
  | 'timeout'
  | 'api_failure'
  | 'network'
  | 'assertion'
  | 'unknown';
export type Framework = 'playwright' | 'selenium' | 'cypress' | 'puppeteer' | 'other';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  framework: Framework;
  repository_url: string | null;
  settings: Record<string, unknown>;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Upload {
  id: string;
  project_id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  storage_bucket: string;
  mime_type: string | null;
  metadata: Record<string, unknown>;
  status: UploadStatus;
  created_at: string;
  processed_at: string | null;
}

export interface Failure {
  id: string;
  project_id: string;
  upload_id: string | null;
  title: string;
  description: string | null;
  framework: Framework;
  failure_category: FailureCategory;
  error_message: string | null;
  stack_trace: string | null;
  test_name: string | null;
  test_file: string | null;
  line_number: number | null;
  browser: string | null;
  os: string | null;
  retry_count: number;
  is_flaky: boolean;
  flakiness_score: number | null;
  raw_data: Record<string, unknown>;
  created_at: string;
  first_seen_at: string;
  last_seen_at: string;
}

export interface Analysis {
  id: string;
  failure_id: string;
  user_id: string;
  status: AnalysisStatus;
  category: FailureCategory | null;
  root_cause: string | null;
  confidence_score: number | null;
  explanation: string | null;
  raw_ai_response: Record<string, unknown> | null;
  processing_time_ms: number | null;
  token_usage: number | null;
  model_used: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Recommendation {
  id: string;
  analysis_id: string;
  type: 'locator_fix' | 'code_fix' | 'retry_strategy' | 'best_practice';
  title: string;
  description: string | null;
  original_code: string | null;
  suggested_code: string | null;
  confidence_score: number | null;
  priority: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  project_id: string | null;
  action_type: 'analysis' | 'upload' | 'api_call';
  resource_type: string | null;
  resource_id: string | null;
  quantity: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

// API Types
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// Dashboard Types
export interface DashboardStats {
  total_projects: number;
  total_failures: number;
  flaky_tests: number;
  reliability_score: number;
  recent_failures: Failure[];
  projects_summary: ProjectSummary[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  failure_count: number;
  reliability_score: number;
  last_failure_at: string | null;
}

// Analysis Types
export interface AnalysisResult {
  id: string;
  failure_id: string;
  category: FailureCategory;
  root_cause: string;
  confidence: number;
  explanation: string;
  recommendations: Recommendation[];
  processing_time_ms: number;
  token_usage: number;
}

// Upload Types
export interface UploadFile {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: UploadStatus;
  progress: number;
  error?: string;
}

export interface PresignedUrlResponse {
  url: string;
  expires_at: string;
}