"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Project = {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
};

export default function ProjectsPage() {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "soundtrack",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      
      if (!res.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await res.json();
      
      if (data.success) {
        setProjects(data.projects);
      } else {
        console.error("Error fetching projects:", data.message);
        toast.error("Failed to load projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        throw new Error('Failed to create project');
      }
      
      const data = await res.json();
      
      if (data.success) {
        // Refresh the projects list
        fetchProjects();
        
        // Show success notification
        toast.success("Project created successfully");
        setOpen(false);
        
        // Reset form
        setFormData({
          name: "",
          description: "",
          type: "soundtrack",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
        });
      } else {
        console.error("Error creating project:", data.message);
        toast.error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  // Format date for display (YYYY-MM-DD to MMM DD, YYYY)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get status badge variant based on project status
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in progress':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'completed':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'archived':
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project to track your audio production work.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Game Soundtrack"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Fantasy RPG soundtrack with 10 tracks"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type <span className="text-destructive">*</span></Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soundtrack">Soundtrack</SelectItem>
                      <SelectItem value="soundEffect">Sound Effects</SelectItem>
                      <SelectItem value="ambience">Ambience</SelectItem>
                      <SelectItem value="foley">Foley</SelectItem>
                      <SelectItem value="voiceOver">Voice Over</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date <span className="text-destructive">*</span></Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Loading state */}
        {loading && (
          <Card className="col-span-full p-8 flex justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading projects...</p>
            </div>
          </Card>
        )}

        {/* Projects from database */}
        {!loading && projects.map((project) => (
          <Card key={project.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Type:</span>
                <span className="text-sm capitalize">{project.type}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Status:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusBadge(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Due Date:</span>
                <span className="text-sm">{formatDate(project.endDate)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = `/dashboard/projects/${project.id}`}>View Details</Button>
            </CardFooter>
          </Card>
        ))}
        
        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <Card className="col-span-full p-8">
            <div className="text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4 mx-auto w-fit">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first project to get started</p>
              <Button onClick={() => setOpen(true)}>Create New Project</Button>
            </div>
          </Card>
        )}
        
        {/* Create new project card */}
        {!loading && projects.length > 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Create a Project</CardTitle>
              <CardDescription>
                Add another project to your collection
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Create a new project to organize your audio work
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => setOpen(true)}>Create Project</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}