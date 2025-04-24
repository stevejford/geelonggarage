import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useClerk } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Search, UserCog } from "lucide-react";

export default function UserRoleManagement() {
  const { users } = useClerk();
  const [clerkUsers, setClerkUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Get roles from Convex
  const roles = useQuery(api.settings.getRoles) || [];

  // Get user roles from Convex
  const userRoles = useQuery(api.users.getAllUserRoles);

  // Mutation to update user role
  const updateUserRole = useMutation(api.users.setUserRole);

  // Load users from Clerk
  useEffect(() => {
    const loadUsers = async () => {
      try {
        if (users) {
          const userList = await users.getUserList();
          setClerkUsers(userList);
        }
      } catch (error) {
        console.error("Error loading users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [users]);

  // Handle role change
  const handleRoleChange = async (userId: string, role: string) => {
    try {
      // Find the user in Clerk
      const user = await users?.getUser(userId);

      if (user) {
        // Update the user's public metadata in Clerk
        await user.update({
          publicMetadata: { role },
        });

        // Also update in Convex if needed
        try {
          await updateUserRole({ userId, role });
        } catch (convexError) {
          console.error("Error updating role in Convex:", convexError);
          // Continue since Clerk update was successful
        }

        toast({
          title: "Role Updated",
          description: "User role has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search query
  const filteredUsers = clerkUsers.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.emailAddresses[0]?.emailAddress.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || email.includes(query);
  });

  // Get role for a user
  const getUserRole = (user: any) => {
    // First try to get role from Clerk metadata
    if (user.publicMetadata?.role) {
      return user.publicMetadata.role;
    }

    // Fallback to Convex roles if available
    if (userRoles) {
      const userRole = userRoles.find(ur => ur.userId === user.id);
      if (userRole?.role) return userRole.role;
    }

    // Default role
    return "user";
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "technician":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          User Role Management
        </CardTitle>
        <CardDescription>
          Assign roles to users to control their access to different parts of the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Users table */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      {searchQuery ? "No users match your search" : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const userRole = getUserRole(user);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-2">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.emailAddresses[0]?.emailAddress || "No email"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleBadgeColor(userRole)}>
                            {userRole}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={userRole}
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="technician">Technician</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
