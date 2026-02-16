import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  User,
  Shield,
  Bell,
  Database,
  Key,
  Plus,
  Edit,
  Calendar,
} from "lucide-react";
import AcademicYearManagement from "@/components/settings/AcademicYearManagement";
import UserManagement from "@/components/settings/UserManagement";
import MasterDataManagement from "@/components/settings/MasterDataManagement";

const Settings = () => {
  return (
    <DashboardLayout pageTitle="Settings" pageSubtitle="Manage system configuration and master data">
      <div className="space-y-6">
        {/* Mobile title */}
        <h1 className="text-2xl font-display font-bold sm:hidden">Settings</h1>

        <Tabs defaultValue="academic" className="space-y-6">
          <TabsList className="inline-flex gap-1">
            <TabsTrigger value="academic" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Academic</span>
            </TabsTrigger>
            <TabsTrigger value="master" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Master Data</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            {/* <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger> */}
          </TabsList>

          {/* Academic Years Tab */}
          <TabsContent value="academic" className="space-y-6">
            <AcademicYearManagement />
          </TabsContent>

          {/* Master Data Tab */}
          <TabsContent value="master" className="space-y-6">
            <MasterDataManagement />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Password Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Minimum password length</Label>
                    <Select defaultValue="8">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require special characters</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require numbers</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Password expiry (days)</Label>
                    <Select defaultValue="90">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="60">60</SelectItem>
                        <SelectItem value="90">90</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>OTP Fallback Login</Label>
                      <p className="text-sm text-muted-foreground">Allow SMS OTP when password fails</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Session Timeout (minutes)</Label>
                      <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="60">60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Attendance Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when cluster attendance drops below 80%</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Donation Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when donations are received</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Summary Report</Label>
                    <p className="text-sm text-muted-foreground">Receive daily attendance and activity summary</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
