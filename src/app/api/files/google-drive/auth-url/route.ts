import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';
import crypto from 'crypto';

// Google OAuth configurations
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/files/google-drive/callback`;

export async function GET() {
  try {
    // Get the current user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Generate a random state value for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    
    // Store the state temporarily to verify later
    // In production, this should be stored in a database or session
    // For now, we're using a cookie
    const stateExpiry = new Date();
    stateExpiry.setHours(stateExpiry.getHours() + 1);

    // Define the OAuth 2.0 parameters
    const oauthParams = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: state,
      include_granted_scopes: 'true',
    });

    // Construct the authorization URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${oauthParams.toString()}`;
    
    // Set the state in a cookie that will be sent with the response
    const cookieOptions = `Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60}`;
    
    const response = NextResponse.json({
      success: true,
      authUrl: authUrl,
    });
    
    response.headers.set('Set-Cookie', `google_oauth_state=${state}; ${cookieOptions}`);
    
    return response;
  } catch (error) {
    console.error("Error generating Google Drive auth URL:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate Google Drive auth URL" },
      { status: 500 }
    );
  }
}