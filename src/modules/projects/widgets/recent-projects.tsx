"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentProjectsWidget() {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Recently updated projects:
      </div>
      
      {/* Demo project card */}
      <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Game Soundtrack Demo</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex justify-between text-sm">
            <div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                In Progress
              </span>
            </div>
            <div className="text-muted-foreground">Due March 15, 2025</div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground mt-2">
        Demo card only. Create your first project to get started.
      </div>
    </div>
  );
}