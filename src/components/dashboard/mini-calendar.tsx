"use client";

import * as React from "react";
import { addDays, format, isSameDay, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Sample data for deadlines - you would fetch this from API in a real app
const DEADLINES = [
  { id: 1, title: "Game Soundtrack: Main Theme", date: "2025-03-15", priority: "high" },
  { id: 2, title: "Commercial Jingle Draft", date: "2025-03-20", priority: "medium" },
  { id: 3, title: "Voice Over Session", date: "2025-03-25", priority: "low" },
  { id: 4, title: "Client Presentation", date: "2025-03-28", priority: "high" },
  { id: 5, title: "Sound Effects Library Update", date: "2025-04-02", priority: "medium" },
];

export function MiniCalendar() {
  const [date, setDate] = React.useState<Date>(new Date());
  const router = useRouter();

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
          <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
            {hasHighPriority && (
              <div className="h-1 w-1 rounded-full bg-red-500" />
            )}
            {hasMediumPriority && (
              <div className="h-1 w-1 rounded-full bg-amber-500" />
            )}
            {!hasHighPriority && !hasMediumPriority && (
              <div className="h-1 w-1 rounded-full bg-green-500" />
            )}
          </div>
        )}
      </div>
    );
  };

  // Calculate next deadline
  const nextDeadline = React.useMemo(() => {
    const today = new Date();
    return DEADLINES
      .filter(deadline => parseISO(deadline.date) >= today)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())[0];
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Calendar</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-xs" 
          onClick={() => router.push("/dashboard/calendar")}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>View all</span>
        </Button>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-2.5">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            components={{
              Day: dayContent,
            }}
            className="mx-auto rounded border p-3"
            disabled={{ before: new Date() }}
            showOutsideDays={false}
          />
          
          {nextDeadline && (
            <div className="mx-auto mt-2 rounded-md border p-2">
              <p className="text-xs font-medium">Next Deadline</p>
              <p className="text-sm">{nextDeadline.title}</p>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{format(parseISO(nextDeadline.date), "MMM d, yyyy")}</span>
                </div>
                <div className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  nextDeadline.priority === "high" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" :
                  nextDeadline.priority === "medium" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" :
                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                )}>
                  {nextDeadline.priority}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}