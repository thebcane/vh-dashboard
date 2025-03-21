"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Session } from "next-auth";
import { useRouter, usePathname } from "next/navigation";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/lib/auth";

type AuthContextType = {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
  isAdmin: false,
  login: async () => false,
  logout: async () => {},
});

export const AuthProvider = ({
  children,
  initialSession
}: {
  children: React.ReactNode,
  initialSession?: Session | null
}) => {
  const [session, setSession] = useState<Session | null>(initialSession || null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">(
    initialSession ? "authenticated" : "loading"
  );
  const [isAdmin, setIsAdmin] = useState(initialSession?.user?.role === "admin");
  
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (initialSession) {
      setSession(initialSession);
      setStatus("authenticated");
      setIsAdmin(initialSession.user?.role === "admin");
      return;
    }
    
    const checkSession = async () => {
      try {
        // Simple fetch to check auth status
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        
        if (data && data.user) {
          setSession(data);
          setStatus("authenticated");
          setIsAdmin(data.user.role === "admin");
        } else {
          setSession(null);
          setStatus("unauthenticated");
          setIsAdmin(false);
          
          // Redirect to login if on protected routes
          if (pathname.startsWith('/dashboard')) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setStatus("unauthenticated");
      }
    };
    
    checkSession();
  }, [pathname, router, initialSession]);

  // Login and logout functions
  const login = async (email: string, password: string) => {
    try {
      const result = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        console.error("Login failed:", result.error);
        return false;
      }
      
      // Update session
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      
      if (data && data.user) {
        setSession(data);
        setStatus("authenticated");
        setIsAdmin(data.user.role === "admin");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };
  
  const logout = async () => {
    await nextAuthSignOut({ redirect: false });
    setSession(null);
    setStatus("unauthenticated");
    setIsAdmin(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ session, status, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);