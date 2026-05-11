-- TestPulse AI Database Schema
-- Version: 001_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE project_status AS ENUM ('active', 'archived');
CREATE TYPE upload_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE analysis_status AS ENUM ('queued', 'processing', 'completed', 'failed');
CREATE TYPE failure_category AS ENUM (
  'synchronization',
  'overlay',
  'iframe',
  'stale_element',
  'locator_instability',
  'timeout',
  'api_failure',
  'network',
  'assertion',
  'unknown'
);
CREATE TYPE framework AS ENUM ('playwright', 'selenium', 'cypress', 'puppeteer', 'other');
CREATE TYPE recommendation_type AS ENUM ('locator_fix', 'code_fix', 'retry_strategy', 'best_practice');

-- PROFILES (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  framework framework DEFAULT 'playwright',
  repository_url TEXT,
  settings JSONB DEFAULT '{}',
  status project_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT MEMBERS (team collaboration)
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- UPLOADS
CREATE TABLE public.uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'uploads',
  mime_type TEXT,
  metadata JSONB DEFAULT '{}',
  status upload_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- FAILURES
CREATE TABLE public.failures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES public.uploads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  framework framework DEFAULT 'playwright',
  failure_category failure_category DEFAULT 'unknown',
  error_message TEXT,
  stack_trace TEXT,
  test_name TEXT,
  test_file TEXT,
  line_number INTEGER,
  browser TEXT,
  os TEXT,
  retry_count INTEGER DEFAULT 0,
  is_flaky BOOLEAN DEFAULT false,
  flakiness_score DECIMAL(5,2),
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANALYSES
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  failure_id UUID NOT NULL REFERENCES public.failures(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status analysis_status DEFAULT 'queued',
  category failure_category,
  root_cause TEXT,
  confidence_score DECIMAL(5,2),
  explanation TEXT,
  raw_ai_response JSONB,
  processing_time_ms INTEGER,
  token_usage INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RECOMMENDATIONS
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  type recommendation_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  original_code TEXT,
  suggested_code TEXT,
  confidence_score DECIMAL(5,2),
  priority INTEGER DEFAULT 3,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USAGE TRACKING (for billing/limits)
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  quantity INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_projects_status ON public.projects(status);

CREATE INDEX idx_project_members_project ON public.project_members(project_id);
CREATE INDEX idx_project_members_user ON public.project_members(user_id);

CREATE INDEX idx_uploads_project ON public.uploads(project_id);
CREATE INDEX idx_uploads_status ON public.uploads(status);
CREATE INDEX idx_uploads_created ON public.uploads(created_at DESC);
CREATE INDEX idx_uploads_user ON public.uploads(user_id);

CREATE INDEX idx_failures_project ON public.failures(project_id);
CREATE INDEX idx_failures_category ON public.failures(failure_category);
CREATE INDEX idx_failures_flaky ON public.failures(is_flaky) WHERE is_flaky = true;
CREATE INDEX idx_failures_created ON public.failures(created_at DESC);
CREATE INDEX idx_failures_test ON public.failures(test_name, test_file);
CREATE INDEX idx_failures_upload ON public.failures(upload_id);

CREATE INDEX idx_analyses_failure ON public.analyses(failure_id);
CREATE INDEX idx_analyses_status ON public.analyses(status);
CREATE INDEX idx_analyses_user ON public.analyses(user_id);

CREATE INDEX idx_recommendations_analysis ON public.recommendations(analysis_id);
CREATE INDEX idx_recommendations_type ON public.recommendations(type);

CREATE INDEX idx_usage_user ON public.usage_logs(user_id);
CREATE INDEX idx_usage_created ON public.usage_logs(created_at DESC);

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects: Owner and members can access
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Project Members
CREATE POLICY "Project members can view" ON public.project_members
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage members" ON public.project_members
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Uploads: Owner can manage
CREATE POLICY "Users can view own uploads" ON public.uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads" ON public.uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads" ON public.uploads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploads" ON public.uploads
  FOR DELETE USING (auth.uid() = user_id);

-- Failures: Owner can manage
CREATE POLICY "Users can view own failures" ON public.failures
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own failures" ON public.failures
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own failures" ON public.failures
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own failures" ON public.failures
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Analyses: Owner can manage
CREATE POLICY "Users can view own analyses" ON public.analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON public.analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- Recommendations: Via analyses
CREATE POLICY "Users can view own recommendations" ON public.recommendations
  FOR SELECT USING (
    analysis_id IN (
      SELECT id FROM public.analyses WHERE user_id = auth.uid()
    )
  );

-- Usage logs
CREATE POLICY "Users can view own usage" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FUNCTIONS

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();