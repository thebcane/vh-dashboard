import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "admin@visualharmonics.com";
const ADMIN_PASSWORD = "password123";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Very simple admin authentication for demo purposes
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Set a cookie to keep user logged in
      const cookieStore = cookies();
      cookieStore.set("vh-auth", "admin-authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user: {
          id: "admin-id",
          name: "Admin User",
          email: ADMIN_EMAIL,
          role: "admin",
        }
      });
    }

    // Return error for invalid credentials
    return NextResponse.json({
      success: false,
      error: "Invalid credentials"
    }, { status: 401 });

  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Authentication failed" 
    }, { status: 500 });
  }
}