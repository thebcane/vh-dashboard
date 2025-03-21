"use client";

import * as React from "react";
import { addDays, format, isSameDay, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DayPicker } from "react-day-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Sample data for deadlines
const DEADLINES = [
  { 
    id: 1, 
    title: "Game Soundtrack: Main Theme", 
    date: "2025-03-15", 
    time: "14:00",
    priority: "high",
    description: "Complete the final mix of the main theme for the RPG game project."
  },
  { 
    id: 2, 
    title: "Commercial Jingle Draft", 
    date: "2025-03-20", 
    time: "10:30",
    priority: "medium",
    description: "Submit the first draft of the commercial jingle for client review."
  },
  { 
    id: 3, 
    title: "Voice Over Session", 
    date: "2025-03-25", 
    time: "15:00",
    priority: "low",
    description: "Record voice overs for the animated short film characters."
  },
  { 
    id: 4, 
    title: "Client Presentation", 
    date: "2025-03-28", 
    time: "11:00",
    priority: "high",
    description: "Present the completed soundtrack to the game development team."
  },
  { 
    id: 5, 
    title: "Sound Effects Library Update", 
    date: "2025-04-02", 
    time: "09:00",
    priority: "medium",
    description: "Organize and categorize newly recorded sound effects for the library."
  },
];

export function DeadlinesCalendarWidget() {
  const [date, setDate] = React.useState<Date>(new Date());
  const [selectedDeadline, setSelectedDeadline] = React.useState<typeof DEADLINES[0] | null>(null);
  const [open, setOpen] = React.useState(false);

  // Function to get deadlines for a specific date
  const getDeadlinesForDate = (day: Date) => {
    return DEADLINES.filter(deadline => 
      isSameDay(parseISO(deadline.date), day)
    );
  };

  // Custom calendar day rendering to show deadlines
  const dayContent = (props: any) => {
    // Extract the date from props - in react-day-picker v8, it's typically in props.date
    const date = props.date;
    if (!date) return props.children || <span>{props.displayValue || props.day?.getDate()}</span>;
    
    const deadlines = getDeadlinesForDate(date);
    const hasHighPriority = deadlines.some(d => d.priority === "high");
    const hasMediumPriority = deadlines.some(d => d.priority === "medium");
    
    return (
      <div className="relative">
        <div>{props.children || props.displayValue || date.getDate()}</div>
        {deadlines.length > 0 && (
          <div className="absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5">
            {hasHighPriority && (
              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
            )}
            {hasMediumPriority && (
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            )}
            {!hasHighPriority && !hasMediumPriority && (
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            )}
          </div>
        )}
      </div>
    );
  };

  // Function to handle day click
  const handleDayClick = (day: Date) => {
    const deadlines = getDeadlinesForDate(day);
    if (deadlines.length > 0) {
      setSelectedDeadline(deadlines[0]);
      setOpen(true);
    }
  };

  // Get upcoming deadlines (next 14 days)
  const upcomingDeadlines = React.useMemo(() => {
    const today = new Date();
    const twoWeeksFromNow = addDays(today, 14);
    
    return DEADLINES
      .filter(deadline => {
        const deadlineDate = parseISO(deadline.date);
        return deadlineDate >= today && deadlineDate <= twoWeeksFromNow;
      })
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-1 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Deadlines Calendar</CardTitle>
              <CardDescription>
                View and manage your upcoming deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    if (date) {
                      setDate(date);
                      handleDayClick(date);
                    }
                  }}
                  components={{
                    Day: dayContent,
                  }}
                  className="rounded-md border"
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>High Priority</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Medium Priority</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Low Priority</span>
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Next 14 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
                    No upcoming deadlines in the next 14 days
                  </div>
                ) : (
                  upcomingDeadlines.map((deadline) => (
                    <HoverCard key={deadline.id}>
                      <HoverCardTrigger asChild>
                        <div 
                          className="flex cursor-pointer items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                          onClick={() => {
                            setSelectedDeadline(deadline);
                            setOpen(true);
                          }}
                        >
                          <div className={cn(
                            "mt-0.5 rounded-full p-1.5",
                            deadline.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                            deadline.priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" :
                            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          )}>
                            <CalendarIcon className="h-3 w-3" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{deadline.title}</p>
                            <div className="flex items-center">
                              <CalendarIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(deadline.date), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <Badge variant={
                            deadline.priority === "high" ? "destructive" :
                            deadline.priority === "medium" ? "default" :
                            "outline"
                          } className="ml-auto">
                            {deadline.priority}
                          </Badge>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">{deadline.title}</h4>
                          <p className="text-sm text-muted-foreground">{deadline.description}</p>
                          <div className="flex items-center pt-2">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Due {format(parseISO(deadline.date), "MMMM d, yyyy")} at {deadline.time}
                            </span>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
            
      {/* Deadline Details Dialog */}
      {selectedDeadline && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedDeadline.title}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant={
                    selectedDeadline.priority === "high" ? "destructive" :
                    selectedDeadline.priority === "medium" ? "default" :
                    "outline"
                  }>
                    {selectedDeadline.priority}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(parseISO(selectedDeadline.date), "MMMM d, yyyy")} at {selectedDeadline.time}
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="space-y-4 py-3">
              <p className="text-sm">{selectedDeadline.description}</p>
              
              <div className="rounded-md bg-muted p-3">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Deadline Details</p>
                    <p className="text-sm text-muted-foreground">This is a {selectedDeadline.priority} priority task scheduled for completion on {format(parseISO(selectedDeadline.date), "MMMM d, yyyy")}.</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
              <Button>Mark as Complete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}