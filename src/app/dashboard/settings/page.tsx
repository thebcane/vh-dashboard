"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, BellRing, Moon, Sun, User, Lock, Bell, Globe, Shield } from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function SettingsPage() {
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Provide default user info if session is not available
  const user = session?.user || {
    name: "Admin User",
    email: "admin@visualharmonics.com",
    role: "admin"
  };
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    language: "english",
    theme: "system",
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleSave = (section?: string) => {
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`${section || 'Settings'} updated successfully`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-5 md:inline-flex h-auto">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Moon className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Globe className="mr-2 h-4 w-4" />
            Accessibility
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Manage your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/avatars/01.png" alt={user?.name || "User"} />
                    <AvatarFallback>
                      <UserCircle className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, GIF or PNG. Max size of 800K
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => handleSave('Profile')} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Language</CardTitle>
                <CardDescription>
                  Select your preferred language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    defaultValue={formData.language}
                    onValueChange={(value) => handleChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => handleSave('Language')} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Color Theme</Label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <Card className={`relative cursor-pointer border-2 ${formData.theme === 'light' ? 'border-primary' : 'border-muted'}`} 
                      onClick={() => handleChange('theme', 'light')}>
                      <CardContent className="p-4 flex flex-col items-center">
                        <Sun className="h-8 w-8 mb-2 text-primary" />
                        <span className="text-sm font-medium">Light</span>
                      </CardContent>
                    </Card>
                    <Card className={`relative cursor-pointer border-2 ${formData.theme === 'dark' ? 'border-primary' : 'border-muted'}`}
                      onClick={() => handleChange('theme', 'dark')}>
                      <CardContent className="p-4 flex flex-col items-center">
                        <Moon className="h-8 w-8 mb-2 text-primary" />
                        <span className="text-sm font-medium">Dark</span>
                      </CardContent>
                    </Card>
                    <Card className={`relative cursor-pointer border-2 ${formData.theme === 'system' ? 'border-primary' : 'border-muted'}`}
                      onClick={() => handleChange('theme', 'system')}>
                      <CardContent className="p-4 flex flex-col items-center">
                        <div className="flex mb-2">
                          <Sun className="h-8 w-8 text-primary mr-1" />
                          <Moon className="h-8 w-8 text-primary" />
                        </div>
                        <span className="text-sm font-medium">System</span>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => handleSave('Theme')} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in the app
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={formData.pushNotifications}
                    onCheckedChange={(checked) => handleChange('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="marketing-emails" className="text-base">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive marketing and promotional emails
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={formData.marketingEmails}
                    onCheckedChange={(checked) => handleChange('marketingEmails', checked)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => handleSave('Notifications')} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="security-alerts" className="text-base">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive security alerts for suspicious account activity
                    </p>
                  </div>
                  <Switch
                    id="security-alerts"
                    checked={formData.securityAlerts}
                    onCheckedChange={(checked) => handleChange('securityAlerts', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Two-Factor Authentication
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => handleSave('Security')} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="accessibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Settings</CardTitle>
                <CardDescription>
                  Customize your accessibility preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm">Small</Button>
                    <Button variant="default" size="sm">Medium</Button>
                    <Button variant="outline" size="sm">Large</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Reduce Motion</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="reduce-motion" />
                    <Label htmlFor="reduce-motion">Reduce animations and transitions</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => handleSave('Accessibility')} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}