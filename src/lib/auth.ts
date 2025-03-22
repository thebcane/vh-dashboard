import { createClient } from '@supabase/supabase-js';
import { AuthError, type Provider, type SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client (consider moving these to environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Sign Up
async function signUp(email: string, password: string) {
  if (typeof window === 'undefined') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Server-side sign up error:", error);
      throw error;
    }
  } else {
    console.warn("signUp function should only be called server-side");
    return null;
  }
}

// Sign In
async function signIn(email: string, password: string) {
  if (typeof window === 'undefined') {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Server-side sign in error:", error);
      throw error;
    }
  } else {
    console.warn("signIn function should only be called server-side");
    return null;
  }
}

// Sign Out
async function signOutUser() {
  if (typeof window === 'undefined') {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Server-side sign out error:", error);
      throw error;
    }
  } else {
    console.warn("signOutUser function should only be called server-side");
  }
}

// Get Session
async function getSession() {
  if (typeof window === 'undefined') {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Server-side getSession error:", error);
      throw error;
    }
  } else {
    console.warn("getSession function should only be called server-side");
    return null;
  }
}

export { signUp, signIn, signOutUser, getSession, supabase };