import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  User,
  Shield,
  UserCog
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserRoleManagement from "./UserRoleManagement";

export default function UserManagement() {
  // State for tabs
  const [activeTab, setActiveTab] = useState("users");

  // State for dialogs
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
  });

  // Mock users data
  const users = [
    {
      _id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "admin",
      status: "active"
    },
    {
      _id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      role: "manager",
      status: "active"
    },
    {
      _id: "3",
      firstName: "Bob",
      lastName: "Johnson",
      email: "bob@example.com",
      role: "technician",
      status: "active"
    },
  ];

  // Mock mutations

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding a new user
  const handleAddUser = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Invitation sent to:", newUser);

      toast.success(`Invitation sent to ${newUser.email}`);
      setIsAddUserOpen(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        role: "user",
      });
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Failed to send invitation");
    }
  };

  // Handle updating user role
  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      // Call the Convex mutation to update the user role
      await api.users.setUserRole({ userId, role });
      toast.success("User role updated successfully");

      // Refresh the user list
      // In a real implementation, this would trigger a refetch of the users
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Deleted user:", selectedUserId);

      toast.success("User removed successfully");
      setIsDeleteUserOpen(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error removing user:", error);
      toast.error("Failed to remove user");
    }
  };

  // Get selected user
  const selectedUser = selectedUserId
    ? users.find(user => user._id.toString() === selectedUserId)
    : null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and their access to the system
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Role Management
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="flex justify-between items-center mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite New User</DialogTitle>
                      <DialogDescription>
                        Send an invitation to a new user to join your organization.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="technician">Technician</SelectItem>
                            <SelectItem value="user">Regular User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddUser}>
                        <Mail className="mr-2 h-4 w-4" /> Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id.toString()}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {user.role === "admin" && (
                              <Shield className="h-3.5 w-3.5 text-red-600" />
                            )}
                            {user.role === "manager" && (
                              <Shield className="h-3.5 w-3.5 text-blue-600" />
                            )}
                            {user.role === "technician" && (
                              <User className="h-3.5 w-3.5 text-green-600" />
                            )}
                            <span className="capitalize">{user.role}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.status || "Active"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUserId(user._id.toString());
                                  setIsEditUserOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUserId(user._id.toString());
                                  setIsDeleteUserOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Role Management Tab */}
            <TabsContent value="roles">
              <UserRoleManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit User Role Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role and permissions for this user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select
                  defaultValue={selectedUser.role}
                  onValueChange={(value) => handleUpdateRole(selectedUser._id.toString(), value)}
                >
                  <SelectTrigger id="editRole">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="user">Regular User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="flex items-center gap-3 my-4">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteUserOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remove User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
