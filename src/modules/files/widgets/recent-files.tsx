"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { FileIcon, FileArchive, FileImage, FileText, FileAudio, FileVideo } from "lucide-react";

// Helper function to get appropriate icon based on file type
const getFileIcon = (fileType: string) => {
  if (fileType.includes("image")) return FileImage;
  if (fileType.includes("audio")) return FileAudio;
  if (fileType.includes("video")) return FileVideo;
  if (fileType.includes("pdf") || fileType.includes("text")) return FileText;
  if (fileType.includes("zip") || fileType.includes("archive")) return FileArchive;
  return FileIcon;
};

// Helper to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function RecentFilesWidget() {
  const [recentFiles, setRecentFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentFiles = async () => {
      try {
        const response = await fetch('/api/files/recent');
        const data = await response.json();
        
        if (data.success) {
          setRecentFiles(data.files);
        }
      } catch (error) {
        console.error("Error fetching recent files:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentFiles();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading recent files...</p>
      </div>
    );
  }

  if (recentFiles.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground mb-2">
          No recent files found.
        </div>
        <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Connect to Google Drive</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-sm text-muted-foreground">
              Upload and manage files by connecting to Google Drive via the Files tab.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Your recent files:
      </div>
      
      {recentFiles.map((file) => {
        const FileTypeIcon = getFileIcon(file.type);
        
        return (
          <Card 
            key={file.id} 
            className="hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => window.open(file.url, '_blank')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <FileTypeIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="font-medium truncate" title={file.name}>
                    {file.name}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>
                      {formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {recentFiles.length > 0 && (
        <div className="text-center mt-2">
          <a 
            href="/dashboard/files" 
            className="text-sm text-primary hover:underline"
          >
            View all files
          </a>
        </div>
      )}
    </div>
  );
}