"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./google-icon";
import { Loader2 } from "lucide-react";

interface GoogleDriveAuthButtonProps {
  isConnecting: boolean;
  onConnectStart: () => void;
  onConnectSuccess: () => void;
  onConnectError: () => void;
}

export function GoogleDriveAuthButton({
  isConnecting,
  onConnectStart,
  onConnectSuccess,
  onConnectError,
}: GoogleDriveAuthButtonProps) {
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);

  const handleConnect = async () => {
    try {
      onConnectStart();
      
      // Request auth URL from the backend
      const response = await fetch("/api/files/google-drive/auth-url");
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        setAuthUrl(data.authUrl);
        
        // Open a popup window for authentication
        const width = 600;
        const height = 600;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.innerHeight / 2 - height / 2;
        
        const authPopup = window.open(
          data.authUrl,
          "googleAuth",
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        if (authPopup) {
          setAuthWindow(authPopup);
          
          // Poll to check if auth is complete
          const checkAuthInterval = setInterval(async () => {
            if (authPopup.closed) {
              clearInterval(checkAuthInterval);
              
              // Check if auth was successful
              const statusResponse = await fetch("/api/files/google-drive/status");
              const statusData = await statusResponse.json();
              
              if (statusData.connected) {
                onConnectSuccess();
              } else {
                onConnectError();
              }
            }
          }, 1000);
        } else {
          // Popup was blocked
          onConnectError();
        }
      } else {
        onConnectError();
      }
    } catch (error) {
      console.error("Error starting Google Drive authentication:", error);
      onConnectError();
    }
  };

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isConnecting}
      className="bg-white text-gray-800 hover:bg-gray-100 border"
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <GoogleIcon className="mr-2 h-4 w-4" />
          Connect Google Drive
        </>
      )}
    </Button>
  );
}