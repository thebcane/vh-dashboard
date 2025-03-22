import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { userRepository } from "./repositories";
import { supabaseAdmin } from "./supabase/client";

/**
 * NextAuth configuration using Supabase for authentication
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          // Option 1: Use our repository (which uses Supabase Data API)
          const user = await userRepository.verifyPassword(
            credentials.email,
            credentials.password
          );

          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }

          // Option 2: Use Supabase Auth directly (for future implementation)
          // const { data, error } = await supabaseAdmin().auth.signInWithPassword({
          //   email: credentials.email,
          //   password: credentials.password,
          // });
          //
          // if (error) {
          //   console.error("Supabase auth error:", error);
          //   return null;
          // }
          //
          // if (data?.user) {
          //   // Get additional user data from the database
          //   const userData = await userRepository.findByEmail(data.user.email!);
          //   
          //   if (userData) {
          //     return {
          //       id: userData.id,
          //       name: userData.name,
          //       email: userData.email,
          //       role: userData.role,
          //     };
          //   }
          // }

          console.log("Invalid credentials");
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

/**
 * Future implementation: Direct Supabase Auth integration
 * This would bypass NextAuth completely and use Supabase Auth directly
 */
export const supabaseAuth = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabaseAdmin().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, userData: { name: string; role?: string }) {
    // 1. Create the auth user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin().auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error("Failed to create user");
    }

    try {
      // 2. Create the user record in our database
      await userRepository.create({
        id: authData.user.id, // Use the Supabase Auth user ID
        email: email,
        name: userData.name,
        role: userData.role || "user",
      });

      return authData;
    } catch (error) {
      // If database creation fails, clean up the auth user
      await supabaseAdmin().auth.admin.deleteUser(authData.user.id);
      throw error;
    }
  },

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabaseAdmin().auth.signOut();
    if (error) {
      throw error;
    }
    return true;
  },
};