import { createClient } from '@/lib/supabase/client';
import type {
  SignUpResult,
  SignInResult,
  OAuthProvider,
  AuthError,
} from './types';
import type { SignupInput, LoginInput } from '@testpulse/validators';

export class AuthService {
  private supabase = createClient();

  async signUp(input: SignupInput): Promise<SignUpResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.full_name,
          },
        },
      });

      if (error) {
        return { user: null, session: null, error: { message: error.message } };
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: { message: 'An unexpected error occurred' },
      };
    }
  }

  async signIn(input: LoginInput): Promise<SignInResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        return { user: null, session: null, error: { message: error.message } };
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: { message: 'An unexpected error occurred' },
      };
    }
  }

  async signInWithOAuth(provider: OAuthProvider['id']): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (err) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (err) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (err) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (err) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  async getUser() {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }
}

export const authService = new AuthService();