import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Shield,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

export default function RolesPermissions() {
  // State for dialogs
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isDeleteRoleOpen, setIsDeleteRoleOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Form state
  const [newRole, setNewRole] = useState<Omit<Role, 'id'>>({
    name: "",
    description: "",
    permissions: []
  });

  // Mock roles data
  const rolesData = [
    {
      id: "admin",
      name: "Admin",
      description: "Full access to all features",
      permissions: ["*"],
      isSystem: true,
    },
    {
      id: "manager",
      name: "Manager",
      description: "Access to most features except settings",
      permissions: [
        "leads:read", "leads:write",
        "contacts:read", "contacts:write",
        "accounts:read", "accounts:write",
        "quotes:read", "quotes:write",
        "workOrders:read", "workOrders:write",
        "invoices:read", "invoices:write",
      ],
      isSystem: true,
    },
    {
      id: "technician",
      name: "Technician",
      description: "Access to work orders and limited customer information",
      permissions: [
        "contacts:read",
        "accounts:read",
        "workOrders:read", "workOrders:write",
      ],
      isSystem: true,
    },
  ];

  // Mock permissions data
  const permissionsData = [
    // Leads permissions
    {
      id: "leads:read",
      name: "View Leads",
      description: "View lead information",
      module: "Leads",
    },
    {
      id: "leads:write",
      name: "Manage Leads",
      description: "Create, edit, and delete leads",
      module: "Leads",
    },

    // Contacts permissions
    {
      id: "contacts:read",
      name: "View Contacts",
      description: "View contact information",
      module: "Contacts",
    },
    {
      id: "contacts:write",
      name: "Manage Contacts",
      description: "Create, edit, and delete contacts",
      module: "Contacts",
    },

    // Work Orders permissions
    {
      id: "workOrders:read",
      name: "View Work Orders",
      description: "View work order information",
      module: "Work Orders",
    },
    {
      id: "workOrders:write",
      name: "Manage Work Orders",
      description: "Create, edit, and delete work orders",
      module: "Work Orders",
    },
  ];

  // Group permissions by module
  const permissionsByModule: Record<string, Permission[]> = {};
  permissionsData.forEach(permission => {
    if (!permissionsByModule[permission.module]) {
      permissionsByModule[permission.module] = [];
    }
    permissionsByModule[permission.module].push(permission);
  });

  // Mock mutations

  // Handle adding a new role
  const handleAddRole = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("New role created:", newRole);

      toast.success(`Role "${newRole.name}" created successfully`);
      setIsAddRoleOpen(false);
      setNewRole({
        name: "",
        description: "",
        permissions: []
      });
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Failed to create role");
    }
  };

  // Handle updating a role
  const handleUpdateRole = async () => {
    if (!selectedRoleId) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Role updated:", {
        id: selectedRoleId,
        ...newRole
      });

      toast.success(`Role "${newRole.name}" updated successfully`);
      setIsEditRoleOpen(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  // Handle deleting a role
  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Role deleted:", selectedRoleId);

      toast.success("Role deleted successfully");
      setIsDeleteRoleOpen(false);
      setSelectedRoleId(null);
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role");
    }
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    setNewRole(prev => {
      const permissions = [...prev.permissions];

      if (permissions.includes(permissionId)) {
        return {
          ...prev,
          permissions: permissions.filter(id => id !== permissionId)
        };
      } else {
        return {
          ...prev,
          permissions: [...permissions, permissionId]
        };
      }
    });
  };

  // Get selected role
  const selectedRole = selectedRoleId
    ? rolesData.find(role => role.id === selectedRoleId)
    : null;

  // Open edit dialog with role data
  const openEditDialog = (role: Role) => {
    setSelectedRoleId(role.id);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setIsEditRoleOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage user roles and their permissions
              </CardDescription>
            </div>
            <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Define a new role and its permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="roleName">Role Name</Label>
                      <Input
                        id="roleName"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        placeholder="e.g., Sales Manager"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roleDescription">Description</Label>
                      <Input
                        id="roleDescription"
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        placeholder="Brief description of this role"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="border rounded-md p-4 space-y-6 max-h-[40vh] overflow-y-auto">
                      {Object.entries(permissionsByModule).map(([module, permissions]) => (
                        <div key={module} className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700 uppercase">{module}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {permissions.map(permission => (
                              <div key={permission.id} className="flex items-start space-x-2">
                                <Checkbox
                                  id={permission.id}
                                  checked={newRole.permissions.includes(permission.id)}
                                  onCheckedChange={() => handlePermissionToggle(permission.id)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <label
                                    htmlFor={permission.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {permission.name}
                                  </label>
                                  <p className="text-xs text-gray-500">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRole}>
                    Create Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No roles defined
                  </TableCell>
                </TableRow>
              ) : (
                rolesData.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className={`h-4 w-4 ${
                          role.name === "Admin"
                            ? "text-red-600"
                            : role.name === "Manager"
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`} />
                        <span>{role.name}</span>
                        {role.isSystem && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            System
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {role.permissions.length} permissions
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
                            onClick={() => openEditDialog(role)}
                            disabled={role.isSystem}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRoleId(role.id);
                              setIsDeleteRoleOpen(true);
                            }}
                            className="text-red-600"
                            disabled={role.isSystem}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify role details and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editRoleName">Role Name</Label>
                <Input
                  id="editRoleName"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRoleDescription">Description</Label>
                <Input
                  id="editRoleDescription"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="border rounded-md p-4 space-y-6 max-h-[40vh] overflow-y-auto">
                {Object.entries(permissionsByModule).map(([module, permissions]) => (
                  <div key={module} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 uppercase">{module}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map(permission => (
                        <div key={permission.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`edit-${permission.id}`}
                            checked={newRole.permissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={`edit-${permission.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.name}
                            </label>
                            <p className="text-xs text-gray-500">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation Dialog */}
      <Dialog open={isDeleteRoleOpen} onOpenChange={setIsDeleteRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="py-4">
              <p className="font-medium">{selectedRole.name}</p>
              <p className="text-sm text-gray-500">{selectedRole.description}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteRoleOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRole}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
