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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }
  return data;
}

// Sign In
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
  return data;
}

// Sign Out
async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

// Get Session
async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data;
}

export { signUp, signIn, signOutUser, getSession, supabase };