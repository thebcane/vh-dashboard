"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Note } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

export function RecentNotesWidget() {
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentNotes = async () => {
      try {
        const response = await fetch('/api/notes/recent');
        const data = await response.json();
        
        if (data.success) {
          setRecentNotes(data.notes);
        }
      } catch (error) {
        console.error("Error fetching recent notes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentNotes();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading recent notes...</p>
      </div>
    );
  }

  if (recentNotes.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground mb-2">
          No recent notes found.
        </div>
        <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Create your first note</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-sm text-muted-foreground">
              Capture ideas and notes by clicking on the Brainstorm tab in the sidebar.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Your recent notes:
      </div>
      
      {recentNotes.map((note) => (
        <Card 
          key={note.id} 
          className="hover:bg-accent/50 cursor-pointer transition-colors"
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">{note.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-sm line-clamp-2 mb-2 text-muted-foreground">
              {note.content}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <div>
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
                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}