import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Clear the authentication cookie
    const cookieStore = cookies();
    cookieStore.delete("vh-auth");

    return NextResponse.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to logout"
    }, { status: 500 });
  }
}