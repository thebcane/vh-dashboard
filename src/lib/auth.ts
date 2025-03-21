import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Ultra-simplified configuration for demo with only hardcoded admin credentials
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
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

        // Only allow the hardcoded admin login for now
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
      }
      return token;
    },
  },
  debug: true, // Enable debug mode for development
});