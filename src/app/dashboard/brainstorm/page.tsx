"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Search, Filter, FileText, Star, Trash2 } from "lucide-react";
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
import { format } from "date-fns";
import { Note, Project } from "@prisma/client";
import { NoteForm } from "@/components/brainstorm/note-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type NoteWithProject = Note & {
  project: Project | null;
};

export default function BrainstormPage() {
  const [notes, setNotes] = useState<NoteWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch notes data
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("/api/notes");
        const data = await response.json();
        
        if (data.success) {
          setNotes(data.notes);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, []);

  // Handle note creation
  const handleNoteCreated = (newNote: NoteWithProject) => {
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setIsCreateDialogOpen(false);
  };

  // Handle note deletion
  const handleDeleteNote = async (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          setNotes((prevNotes) => 
            prevNotes.filter((note) => note.id !== noteId)
          );
        }
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };

  // Filter notes based on search query and tab
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesTab = 
      activeTab === "all" ? true : 
      activeTab === "public" ? note.isPublic : 
      activeTab === "private" ? !note.isPublic : 
      activeTab === "with-project" ? !!note.projectId : 
      false;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brainstorm</h1>
          <p className="text-muted-foreground">
            Capture and organize your creative ideas
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>
                Capture your ideas, concepts, or notes for future reference.
              </DialogDescription>
            </DialogHeader>
            <NoteForm onSuccess={handleNoteCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 w-full"
            placeholder="Search notes..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
              <TabsTrigger value="with-project">With Project</TabsTrigger>
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>View</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-accent/50" : ""}
              >
                Grid View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-accent/50" : ""}
              >
                List View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notes Grid/List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-4"
        }>
          {filteredNotes.map((note) => (
            <Card key={note.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
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
                      <DropdownMenuItem onClick={() => {/* Edit functionality */}}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {/* Toggle public/private */}}>
                        {note.isPublic ? "Make Private" : "Make Public"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="text-xs">
                  {format(new Date(note.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm whitespace-pre-line line-clamp-3">
                  {note.content}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between w-full text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {note.isPublic ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Private
                      </span>
                    )}
                  </div>
                  <div>
                    {note.project && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {note.project.name}
                      </span>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Notes Found</CardTitle>
            <CardDescription>
              {searchQuery
                ? "No notes match your search criteria."
                : "You haven't created any notes yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Note
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}