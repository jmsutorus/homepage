import { requireAdmin, getUserId } from "@/lib/auth/server";
import { getUsers, getAllowedUsers, getAccessRequests } from "./actions";
import { UserList } from "./user-list";
import { AllowedUsersList } from "./allowed-users-list";
import { AccessRequestsList } from "./access-requests-list";
import { HapticTester } from "./haptic-tester";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HolidayManager } from "@/components/widgets/admin/holiday-manager";
import { Star, Smartphone, CalendarDays } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard",
  description: "Manage users and roles",
};

export default async function AdminPage() {
  await requireAdmin();
  const currentUserId = await getUserId();
  const [users, allowedUsers, accessRequests] = await Promise.all([
    getUsers(),
    getAllowedUsers(),
    getAccessRequests()
  ]);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and beta access.
          </p>
        </div>
        <div className="bg-muted px-4 py-2 rounded-lg text-sm font-medium">
          Total Users: {users.length}
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="beta">Beta Access</TabsTrigger>
          <TabsTrigger value="holidays">
            <CalendarDays className="h-4 w-4 mr-2" />
            Holidays
          </TabsTrigger>
          <TabsTrigger value="haptics">
            <Smartphone className="h-4 w-4 mr-2" />
            Haptics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UserList users={users} currentUserId={currentUserId} />
        </TabsContent>
        <TabsContent value="beta" className="space-y-4">
          <AllowedUsersList allowedUsers={allowedUsers} />
          <AccessRequestsList requests={accessRequests} />
        </TabsContent>
        <TabsContent value="holidays" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <CardTitle>Holidays</CardTitle>
              </div>
              <CardDescription>
                Manage holidays that appear on the calendar for all users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HolidayManager />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="haptics" className="space-y-4">
          <HapticTester />
        </TabsContent>
      </Tabs>
    </div>
  );
}
