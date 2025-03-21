"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { moduleRegistry } from "@/modules/core/module-registry";
import { DashboardWidget } from "@/types/module";
import { Bar, BarChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { 
  CalendarIcon, 
  CheckCircle2, 
  Clock, 
  FilePlus2, 
  FileText, 
  LayoutDashboard, 
  LineChart, 
  ListTodo, 
  LucideIcon, 
  MailCheck, 
  MoveUpRight, 
  Pin, 
  PlusCircle, 
  Settings, 
  Siren, 
  User,
  Wallet
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface DashboardStats {
  activeProjects: number;
  pendingTasks: number;
  recentFiles: number;
  totalExpenses: number;
}

// Sample data for demo purposes
const RECENT_ACTIVITIES = [
  { id: 1, type: "project", title: "Created Game Soundtrack Demo project", time: "2 hours ago", icon: PlusCircle },
  { id: 2, type: "expense", title: "Added new expense: Studio Equipment", time: "3 hours ago", icon: Wallet },
  { id: 3, type: "file", title: "Uploaded Main Theme.wav", time: "Yesterday", icon: FilePlus2 },
  { id: 4, type: "note", title: "Added note about character themes", time: "Yesterday", icon: FileText },
  { id: 5, type: "project", title: "Updated project deadline", time: "2 days ago", icon: Clock },
  { id: 6, type: "expense", title: "Marked Software License as paid", time: "3 days ago", icon: CheckCircle2 },
];

// Sample data for upcoming deadlines
const UPCOMING_DEADLINES = [
  { id: 1, title: "Game Soundtrack: Main Theme", date: "March 15, 2025", priority: "high" },
  { id: 2, title: "Commercial Jingle Draft", date: "March 20, 2025", priority: "medium" },
  { id: 3, title: "Voice Over Session", date: "March 25, 2025", priority: "low" },
];

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    pendingTasks: 0,
    recentFiles: 0,
    totalExpenses: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState("overview");
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => setProgress(66), 500);
    
    // Get widgets from all enabled modules
    const moduleWidgets = moduleRegistry.getAllWidgets();
    setWidgets(moduleWidgets);
    
    // Fetch dashboard stats
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    
    // Fetch expense data
    const fetchExpenseData = async () => {
      try {
        const response = await fetch('/api/dashboard/expense-chart');
        const data = await response.json();
        
        if (data.success) {
          setExpenseData(data.data);
        }
      } catch (error) {
        console.error("Error fetching expense data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardStats();
    fetchExpenseData();
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Visual Harmonics Dashboard
          </p>
        </div>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="overview" aria-label="Toggle overview">
                  <LayoutDashboard className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Overview</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="analytics" aria-label="Toggle analytics view">
                  <LineChart className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Analytics</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="tasks" aria-label="Toggle tasks view">
                  <ListTodo className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </ToggleGroup>
      </div>
      
      {/* Welcome Alert */}
      <Alert>
        <MailCheck className="h-4 w-4" />
        <AlertTitle>Welcome to your dashboard!</AlertTitle>
        <AlertDescription>
          Get started by creating a new project or exploring your recent activities.
        </AlertDescription>
      </Alert>
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Projects
                </CardTitle>
                <div className="rounded-full bg-primary/10 p-1.5">
                  <FilePlus2 className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.activeProjects}</div>
                <div className="flex items-center pt-1">
                  <MoveUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                  <p className="text-xs text-emerald-500">+2 this week</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Tasks
                </CardTitle>
                <div className="rounded-full bg-amber-500/10 p-1.5">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.pendingTasks}</div>
                <div className="flex items-center pt-1">
                  <ListTodo className="mr-1 h-3 w-3 text-amber-500" />
                  <p className="text-xs text-amber-500">3 need attention</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Files</CardTitle>
                <div className="rounded-full bg-blue-500/10 p-1.5">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.recentFiles}</div>
                <div className="flex items-center pt-1">
                  <MoveUpRight className="mr-1 h-3 w-3 text-blue-500" />
                  <p className="text-xs text-blue-500">+5 new files</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <div className="rounded-full bg-emerald-500/10 p-1.5">
                  <Wallet className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : `$${stats.totalExpenses.toFixed(2)}`}
                </div>
                <div className="flex items-center pt-1">
                  <MoveUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                  <p className="text-xs text-emerald-500">Under budget</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Project Progress Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Progress</CardTitle>
                <Badge variant="outline">Game Soundtrack Demo</Badge>
              </div>
              <CardDescription className="flex justify-between items-center">
                <span>66% completed</span>
                <span className="text-xs text-muted-foreground">Due in 10 days</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className={cn("h-2")} />
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Tasks</span>
                  <div className="flex items-center mt-1">
                    <CheckCircle2 className="text-green-500 mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">8/12 Complete</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Bugs</span>
                  <div className="flex items-center mt-1">
                    <Siren className="text-red-500 mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">2 Open</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Files</span>
                  <div className="flex items-center mt-1">
                    <FileText className="text-blue-500 mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">15 Uploaded</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Calendar Widget */}
            <MiniCalendar />
            
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Your latest actions in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[236px]">
                  <div className="space-y-4">
                    {RECENT_ACTIVITIES.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-4">
                          <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                            <Icon className="h-3 w-3 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Expense Overview */}
          {expenseData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expense Analytics</CardTitle>
                <CardDescription>
                  Monthly expenses breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={cn("h-[300px]")}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseData}>
                      <XAxis 
                        dataKey="month" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <RechartsTooltip />
                      <Bar
                        dataKey="amount"
                        fill="var(--primary)"
                        radius={[4, 4, 0, 0]}
                        className="fill-primary"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Additional Analytics */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Distribution</CardTitle>
                <CardDescription>
                  Project types breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span className="text-sm">Soundtracks</span>
                      </div>
                      <span className="text-sm">60%</span>
                    </div>
                    <Progress value={60} className={cn("h-2")} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Sound Effects</span>
                      </div>
                      <span className="text-sm">25%</span>
                    </div>
                    <Progress value={25} className="h-2 bg-blue-100 dark:bg-blue-800" style={{ "--progress-color": "var(--colors-blue-500)" }} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                        <span className="text-sm">Voice Overs</span>
                      </div>
                      <span className="text-sm">15%</span>
                    </div>
                    <Progress value={15} className="h-2 bg-amber-100 dark:bg-amber-800" style={{ "--progress-color": "var(--colors-amber-500)" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Collaborators</CardTitle>
                <CardDescription>Team members active on projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  {[
                    { id: 1, name: "Sophia Chen", role: "Sound Designer", avatar: "/avatars/01.png", activity: "Active now" },
                    { id: 2, name: "Alex Johnson", role: "Composer", avatar: "/avatars/02.png", activity: "1 hour ago" },
                    { id: 3, name: "Marcus Williams", role: "Voice Director", avatar: "/avatars/03.png", activity: "3 hours ago" },
                  ].map((person) => (
                    <HoverCard key={person.id}>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={person.avatar} alt={person.name} />
                              <AvatarFallback>
                                {person.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{person.name}</p>
                              <p className="text-xs text-muted-foreground">{person.role}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {person.activity}
                          </Badge>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarImage src={person.avatar} />
                            <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">{person.name}</h4>
                            <p className="text-sm">{person.role}</p>
                            <div className="flex items-center pt-2">
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                              <span className="text-xs text-muted-foreground">
                                Joined December 2021
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Activities</CardTitle>
              <CardDescription>
                Recent actions across all modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {RECENT_ACTIVITIES.map((activity, index) => {
                  const Icon = activity.icon;
                  
                  // Add date separators
                  const showDateSeparator = index === 0 || index === 3;
                  const dateText = index === 0 ? "Today" : index === 3 ? "Yesterday" : "";
                  
                  return (
                    <div key={activity.id}>
                      {showDateSeparator && (
                        <div className="flex items-center mb-4">
                          <Separator className="flex-1" />
                          <span className="mx-2 text-xs font-medium text-muted-foreground">{dateText}</span>
                          <Separator className="flex-1" />
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "rounded-full p-2",
                          activity.type === 'project' ? "bg-primary/10" : 
                          activity.type === 'expense' ? "bg-green-100 dark:bg-green-900" : 
                          activity.type === 'file' ? "bg-blue-100 dark:bg-blue-900" : 
                          "bg-amber-100 dark:bg-amber-900"
                        )}>
                          <Icon className={cn(
                            "h-4 w-4",
                            activity.type === 'project' ? "text-primary" : 
                            activity.type === 'expense' ? "text-green-700 dark:text-green-300" : 
                            activity.type === 'file' ? "text-blue-700 dark:text-blue-300" : 
                            "text-amber-700 dark:text-amber-300"
                          )} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Module Widgets */}
      {widgets.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget, index) => {
            const WidgetComponent = widget.component;
            return (
              <Card key={index} className={`col-span-${widget.width === 'full' ? '3' : widget.width === 'half' ? '2' : '1'}`}>
                <CardHeader>
                  <CardTitle>{widget.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <WidgetComponent />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}