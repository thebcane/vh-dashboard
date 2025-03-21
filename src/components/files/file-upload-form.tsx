"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, FileIcon } from "lucide-react";
import { Project } from "@prisma/client";

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;
// Accepted file types
const ACCEPTED_FILE_TYPES = [
  // Images
  "image/jpeg", 
  "image/png", 
  "image/gif", 
  "image/webp", 
  // Documents
  "application/pdf", 
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  // Video
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  // Archives
  "application/zip",
  "application/x-rar-compressed"
];

// Define the form schema using zod
const formSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `File size must be less than 50MB`)
    .refine(file => ACCEPTED_FILE_TYPES.includes(file.type), `File type not supported`),
  projectId: z.string().optional(),
  useGoogleDrive: z.boolean().default(false),
  customFileName: z.string().optional(),
});

// Type for the form values
type FormValues = z.infer<typeof formSchema>;

// Props for the component
type FileUploadFormProps = {
  onSuccess: (file: any) => void;
};

// Helper to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUploadForm({ onSuccess }: FileUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGoogleDriveAvailable, setIsGoogleDriveAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: undefined,
      useGoogleDrive: false,
      customFileName: "",
    },
  });

  // Check if Google Drive is connected
  useEffect(() => {
    const checkGoogleDriveConnection = async () => {
      try {
        const response = await fetch("/api/files/google-drive/status");
        const data = await response.json();
        
        setIsGoogleDriveAvailable(data.connected);
      } catch (error) {
        console.error("Error checking Google Drive connection:", error);
      }
    };
    
    checkGoogleDriveConnection();
  }, []);

  // Fetch projects for the dropdown
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
      } finally {
        setIsLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue("file", file);
      
      // Set custom file name to original filename by default
      form.setValue("customFileName", file.name);
    }
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!selectedFile) return;
    
    setIsSubmitting(true);
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    if (values.projectId) {
      formData.append("projectId", values.projectId);
    }
    
    if (values.useGoogleDrive) {
      formData.append("useGoogleDrive", "true");
    }
    
    if (values.customFileName && values.customFileName !== selectedFile.name) {
      formData.append("customFileName", values.customFileName);
    }
    
    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        onSuccess(data.file);
        form.reset();
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        console.error("Failed to upload file:", data.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <div className="grid gap-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept={ACCEPTED_FILE_TYPES.join(",")}
                    className={selectedFile ? "hidden" : ""}
                  />
                  
                  {selectedFile && (
                    <div className="flex items-center p-4 border rounded-md">
                      <div className="bg-primary/10 p-2 rounded mr-3">
                        <FileIcon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <div className="font-medium truncate" title={selectedFile.name}>
                          {selectedFile.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedFile.type} · {formatFileSize(selectedFile.size)}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          form.resetField("file");
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Select a file to upload. Maximum size is 50MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {selectedFile && (
          <>
            <FormField
              control={form.control}
              name="customFileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Name (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Custom file name" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank to use the original file name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project (Optional)</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      if (value === "none") {
                        field.onChange(undefined);
                      } else {
                        field.onChange(value);
                      }
                    }}
                    defaultValue={field.value}
                    disabled={isLoadingProjects}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Associate with a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Associate this file with a project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isGoogleDriveAvailable && (
              <FormField
                control={form.control}
                name="useGoogleDrive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Upload to Google Drive</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Store this file in your connected Google Drive account.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        <div className="mt-6 flex justify-end space-x-2">
          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedFile}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </form>
    </Form>
  );
}