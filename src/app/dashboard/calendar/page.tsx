"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Check, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { DeadlinesCalendarWidget } from "@/modules/calendar/widgets/deadlines-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your deadlines and schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Deadline
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="deadlines" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="month">Month View</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="deadlines" className="space-y-4">
          <DeadlinesCalendarWidget />
        </TabsContent>
        
        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Month View</CardTitle>
              <CardDescription>
                View your schedule for the entire month
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="flex w-full justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  className="rounded-md border"
                />
              </div>
              
              <div className="mt-8 w-full max-w-md space-y-4">
                <h3 className="text-lg font-medium">
                  Events for {format(date, "MMMM d, yyyy")}
                </h3>
                
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Team Meeting</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        <span>10:00 AM - 11:00 AM</span>
                      </div>
                    </div>
                    <Badge>Meeting</Badge>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Project Review</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        <span>2:00 PM - 3:30 PM</span>
                      </div>
                    </div>
                    <Badge variant="secondary">Review</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Tasks</CardTitle>
              <CardDescription>
                Manage your daily tasks and to-dos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="new-task">New Task</Label>
                    <Input
                      id="new-task"
                      placeholder="Enter a new task..."
                    />
                  </div>
                  
                  <div className="grid gap-1.5">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="due-date"
                          variant={"outline"}
                          className={cn(
                            "w-[130px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(date) => date && setDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid gap-1.5">
                    <Label htmlFor="priority">Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="priority" className="w-[110px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="mb-0.5">Add Task</Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border">
                      <Check className="h-3 w-3 text-primary opacity-0 transition-opacity hover:opacity-100" />
                    </div>
                    <span className="flex-1">Finish soundtrack draft</span>
                    <Badge>High</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border">
                      <Check className="h-3 w-3 text-primary opacity-0 transition-opacity hover:opacity-100" />
                    </div>
                    <span className="flex-1">Send invoice to client</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border">
                      <Check className="h-3 w-3 text-primary opacity-0 transition-opacity hover:opacity-100" />
                    </div>
                    <span className="flex-1">Update project documentation</span>
                    <Badge variant="secondary">Low</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}