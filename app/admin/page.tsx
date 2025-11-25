import { requireAdmin, getUserId } from "@/lib/auth/server";
import { getUsers, getAllowedUsers } from "./actions";
import { UserList } from "./user-list";
import { AllowedUsersList } from "./allowed-users-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Admin Dashboard",
  description: "Manage users and roles",
};

export default async function AdminPage() {
  await requireAdmin();
  const currentUserId = await getUserId();
  const [users, allowedUsers] = await Promise.all([
    getUsers(),
    getAllowedUsers()
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
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UserList users={users} currentUserId={currentUserId} />
        </TabsContent>
        <TabsContent value="beta" className="space-y-4">
          <AllowedUsersList allowedUsers={allowedUsers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
