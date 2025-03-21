import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get URL params from the callback request
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    
    // Check for errors in the OAuth callback
    if (error) {
      console.error("Google OAuth error:", error);
      return new Response(`
        <html>
          <head>
            <title>Authentication Failed</title>
            <script>
              setTimeout(() => {
                window.close();
              }, 2000);
            </script>
          </head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif;">
            <div style="text-align: center;">
              <h2>Authentication Failed</h2>
              <p>There was an error connecting to Google Drive.</p>
              <p>This window will close automatically in 2 seconds.</p>
            </div>
          </body>
        </html>
      `, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
    
    // Validate state parameter
    const storedState = request.cookies.get("google_oauth_state")?.value;
    
    if (!storedState || storedState !== state) {
      console.error("Invalid state parameter");
      return new Response(`
        <html>
          <head>
            <title>Authentication Failed</title>
            <script>
              setTimeout(() => {
                window.close();
              }, 2000);
            </script>
          </head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif;">
            <div style="text-align: center;">
              <h2>Authentication Failed</h2>
              <p>Invalid authentication state. Please try again.</p>
              <p>This window will close automatically in 2 seconds.</p>
            </div>
          </body>
        </html>
      `, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
    
    // Get the authorization code provided by Google
    if (!code) {
      console.error("No authorization code provided");
      return new Response(`
        <html>
          <head>
            <title>Authentication Failed</title>
            <script>
              setTimeout(() => {
                window.close();
              }, 2000);
            </script>
          </head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif;">
            <div style="text-align: center;">
              <h2>Authentication Failed</h2>
              <p>No authorization code provided. Please try again.</p>
              <p>This window will close automatically in 2 seconds.</p>
            </div>
          </body>
        </html>
      `, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
    
    // Get the current user session
    const session = await auth();
    
    if (!session?.user) {
      return new Response(`
        <html>
          <head>
            <title>Authentication Failed</title>
            <script>
              setTimeout(() => {
                window.close();
              }, 2000);
            </script>
          </head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif;">
            <div style="text-align: center;">
              <h2>Authentication Failed</h2>
              <p>User not authenticated. Please log in and try again.</p>
              <p>This window will close automatically in 2 seconds.</p>
            </div>
          </body>
        </html>
      `, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
    
    // Exchange authorization code for tokens
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const clientId = process.env.GOOGLE_CLIENT_ID || 'your-client-id';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret';
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/files/google-drive/callback`;
    
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    
    const tokenData = await response.json();
    
    if (!response.ok) {
      console.error("Error exchanging code for tokens:", tokenData);
      return new Response(`
        <html>
          <head>
            <title>Authentication Failed</title>
            <script>
              setTimeout(() => {
                window.close();
              }, 2000);
            </script>
          </head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif;">
            <div style="text-align: center;">
              <h2>Authentication Failed</h2>
              <p>Error exchanging authorization code for tokens.</p>
              <p>This window will close automatically in 2 seconds.</p>
            </div>
          </body>
        </html>
      `, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
    
    // Calculate token expiry time
    const expiresIn = tokenData.expires_in || 3600; // Default to 1 hour
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);
    
    // Store the tokens in the user record
    await db.user.update({
      where: {
        id: session.user.id
      },
      data: {
        googleDriveAccessToken: tokenData.access_token,
        googleDriveRefreshToken: tokenData.refresh_token,
        googleDriveTokenExpiry: expiryDate,
        accounts: {
          upsert: {
            where: { userId: session.user.id },
            create: { userId: session.user.id },
            update: {}
            
          }
        }
      },
    });
    
    // Create a successful response to close the window
    return new Response(`
      <html>
        <head>
          <title>Authentication Successful</title>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </head>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif;">
          <div style="text-align: center;">
            <h2>Authentication Successful</h2>
            <p>Your Google Drive is now connected.</p>
            <p>This window will close automatically in 2 seconds.</p>
          </div>
        </body>
      </html>
    `, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error handling Google OAuth callback:", error);
    return new Response(`
      <html>
        <head>
          <title>Authentication Failed</title>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </head>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif;">
          <div style="text-align: center;">
            <h2>Authentication Failed</h2>
            <p>An unexpected error occurred.</p>
            <p>This window will close automatically in 2 seconds.</p>
          </div>
        </body>
      </html>
    `, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  }
}
