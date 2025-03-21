import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { AuthOptions } from "next-auth";

// Define the auth configuration
export const authConfig: AuthOptions = {
  adapter: PrismaAdapter(db),
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
        
        // In a real application, you would authenticate against the database
        // For now, we'll keep the hardcoded admin login for simplicity
        if (credentials.email === "admin@visualharmonics.com" &&
            credentials.password === "password123") {
          console.log("Admin login successful");
          return {
            id: "admin-id",
            name: "Admin User",
            email: "admin@visualharmonics.com",
            role: "admin",
          };
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user, account }: { token: JWT; user: any; account: any }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

// Create the NextAuth handler
const handler = NextAuth(authConfig);

// Export the handler functions
export const { auth, signIn, signOut } = handler;

// Export GET and POST handlers for the API route
export const GET = handler.GET;
export const POST = handler.POST;