"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FolderPlus, Grid, List, Filter, Search, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload, Project } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { 
  FileIcon, 
  FileArchive, 
  FileImage, 
  FileText, 
  FileAudio, 
  FileVideo, 
  RefreshCw,
  AlertTriangle,
  Check
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleDriveAuthButton } from "@/components/files/google-drive-auth-button";
import { FileUploadForm } from "@/components/files/file-upload-form";

type FileWithProject = FileUpload & {
  project: Project | null;
};

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

export default function FilesPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isConnectingGoogleDrive, setIsConnectingGoogleDrive] = useState(false);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if Google Drive is connected
  useEffect(() => {
    const checkGoogleDriveConnection = async () => {
      try {
        const response = await fetch("/api/files/google-drive/status");
        const data = await response.json();
        
        setIsGoogleDriveConnected(data.connected);
      } catch (error) {
        console.error("Error checking Google Drive connection:", error);
      }
    };
    
    checkGoogleDriveConnection();
  }, []);

  // Fetch files
  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/files");
        const data = await response.json();
        
        if (data.success) {
          setFiles(data.files);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        toast({
          title: "Error",
          description: "Failed to fetch files. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFiles();
  }, [refreshKey, toast]);

  // Fetch projects for filter
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();
        
        if (data.success) {
          setProjects(data.projects);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    
    fetchProjects();
  }, []);

  // Handle file upload completion
  const handleUploadSuccess = (newFile: FileWithProject) => {
    setFiles((prevFiles) => [newFile, ...prevFiles]);
    setIsUploadDialogOpen(false);
    toast({
      title: "Success",
      description: "File uploaded successfully",
    });
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      try {
        const response = await fetch(`/api/files/${fileId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          setFiles((prevFiles) => 
            prevFiles.filter((file) => file.id !== fileId)
          );
          toast({
            title: "Success",
            description: "File deleted successfully",
          });
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        toast({
          title: "Error",
          description: "Failed to delete file. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Sync with Google Drive
  const handleSyncWithGoogleDrive = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/files/google-drive/sync", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRefreshKey((prev) => prev + 1);
        toast({
          title: "Success",
          description: "Files synced with Google Drive",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to sync with Google Drive",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error syncing with Google Drive:", error);
      toast({
        title: "Error",
        description: "Failed to sync with Google Drive. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter files based on search query, project, and tab
  const filteredFiles = files.filter((file) => {
    const matchesSearch = 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.type.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesProject = 
      selectedProject === null || file.projectId === selectedProject;
      
    const matchesTab = 
      activeTab === "all" ? true : 
      activeTab === "google-drive" ? !!file.googleDriveId : 
      activeTab === "uploaded" ? !file.googleDriveId : 
      false;
    
    return matchesSearch && matchesProject && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">
            Manage your project files and Google Drive integration
          </p>
        </div>
        <div className="flex gap-2">
          {isGoogleDriveConnected && (
            <Button 
              variant="outline" 
              onClick={handleSyncWithGoogleDrive}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sync with Google Drive
            </Button>
          )}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Upload a file to your project or Google Drive
                </DialogDescription>
              </DialogHeader>
              <FileUploadForm onSuccess={handleUploadSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Google Drive Connection Status */}
      {!isGoogleDriveConnected && (
        <Card className="border-dashed border-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-yellow-500">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Google Drive Not Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Connect your Google Drive account to sync files between Visual Harmonics Dashboard and Google Drive.
            </p>
            <GoogleDriveAuthButton 
              isConnecting={isConnectingGoogleDrive}
              onConnectStart={() => setIsConnectingGoogleDrive(true)}
              onConnectSuccess={() => {
                setIsGoogleDriveConnected(true);
                setIsConnectingGoogleDrive(false);
              }}
              onConnectError={() => {
                setIsConnectingGoogleDrive(false);
                toast({
                  title: "Connection Failed",
                  description: "Failed to connect to Google Drive. Please try again.",
                  variant: "destructive",
                });
              }}
            />
          </CardContent>
        </Card>
      )}

      {isGoogleDriveConnected && (
        <Card className="border-green-500 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-green-500">
              <Check className="mr-2 h-5 w-5" />
              Google Drive Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your Google Drive account is connected. Files will be synced automatically.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 w-full"
            placeholder="Search files..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={selectedProject || ""}
            onValueChange={(value) => setSelectedProject(value || null)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="google-drive">Google Drive</TabsTrigger>
              <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {viewMode === "grid" ? (
                  <Grid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>View</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-accent/50" : ""}
              >
                <Grid className="mr-2 h-4 w-4" />
                Grid View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-accent/50" : ""}
              >
                <List className="mr-2 h-4 w-4" />
                List View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Files Display */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading files...</p>
          </div>
        </div>
      ) : filteredFiles.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const FileTypeIcon = getFileIcon(file.type);
              
              return (
                <Card key={file.id} className="group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="mr-2 bg-primary/10 p-2 rounded">
                          <FileTypeIcon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-base truncate" title={file.name}>
                          {file.name}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>
                        {formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex justify-between w-full text-xs">
                      <div>
                        {file.project ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {file.project.name}
                          </span>
                        ) : (
                          <span></span>  
                        )}
                      </div>
                      <div>
                        {file.googleDriveId ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Google Drive
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => {
                    const FileTypeIcon = getFileIcon(file.type);
                    
                    return (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileTypeIcon className="mr-2 h-4 w-4 text-primary" />
                            <span className="truncate max-w-[200px]" title={file.name}>
                              {file.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{file.type.split('/')[1] || file.type}</TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>
                          {file.project ? file.project.name : "-"}
                        </TableCell>
                        <TableCell>
                          {file.googleDriveId ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Google Drive
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              Uploaded
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10"
                                onClick={() => handleDeleteFile(file.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Files Found</CardTitle>
            <CardDescription>
              {searchQuery || selectedProject
                ? "No files match your search criteria."
                : "You haven't uploaded any files yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}