"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signIn, signOutUser, getSession } from "@/lib/auth"; // Corrected import

type AuthContextType = {
  session: any | null; //Using any to avoid defining the full session object
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
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: any | null;
}) => {
  const [session, setSession] = useState<any | null>(initialSession || null);
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
        const data = await getSession();

        if (data && data.session) {
          setSession(data.session); //Correctly getting the nested session.
          setStatus("authenticated");
          setIsAdmin(data.session.user?.role === "admin"); //Access user role
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

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn(email, password); // Call signIn

      if (!result) {
        console.error("Login failed");
        return false;
      }
        const data = await getSession();

        if (data && data.session) {
          setSession(data.session);
          setStatus("authenticated");
          setIsAdmin(data.session.user?.role === "admin");
          return true;
        }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try{
        await signOutUser();
        setSession(null);
        setStatus("unauthenticated");
        setIsAdmin(false);
        router.push('/login');
    } catch (error) {
        console.error("Logout error", error)
    }

  };

  return (
    <AuthContext.Provider value={{ session, status, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);