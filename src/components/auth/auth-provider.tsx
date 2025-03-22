"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Define the auth context type
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: React.ReactNode;
  initialSession: Session | null;
}

// Create the auth provider component
export function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Create a Supabase client
  const supabase = createClientComponentClient<Database>();
  
  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        // Refresh the page on auth changes to update server components
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);
  
  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      // First, sign up with Supabase Auth
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Note: In a real application, you would need to create a user record in your database
      // This is typically done in a server-side function or API route
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign out function
  const signOut = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Redirect to the home page
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset password function
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create the context value
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}