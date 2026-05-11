import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@testpulse/types';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
}

export interface SignUpResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SignInResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface OAuthProvider {
  id: 'google' | 'github' | 'gitlab';
  redirectTo?: string;
}

export interface AuthCallbacks {
  onAuthStateChange?: (event: AuthStateChangeEvent) => void;
}

export type AuthStateChangeEvent =
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'USER_DELETED';

export interface AuthStateChangeData {
  session: Session | null;
  user: User | null;
}