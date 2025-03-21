import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

const USERS = [
  {
    email: "brendan@visualharmonics.com",
    password: "123",
    name: "Brendan Cane",
  },
  {
    email: "cameron@visualharmonics.com",
    password: "123",
    name: "Cameron Mcgugan",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      try {
        await signIn("credentials", {
          email: email,
          password: password,
          redirect: true,
        });

        return NextResponse.json({
          success: true,
          user: {
            id: user.email,
            name: user.name,
            email: user.email,
            role: "admin", // Default role for all users
          },
        });
      } catch (error: any) {
        console.error("signIn error:", error);
        return NextResponse.json({
          success: false,
          error: "Failed to sign in"
        }, { status: 500 });
      }
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