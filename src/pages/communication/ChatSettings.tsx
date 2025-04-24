import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroupId?: string;
}

export default function ChatSettings({ isOpen, onClose, selectedGroupId }: ChatSettingsProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("groups");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Convex mutations
  const createGroup = useMutation(api.communication.createGroup);
  const addGroupMember = useMutation(api.communication.addGroupMember);

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) return;

    setIsSubmitting(true);

    try {
      await createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || undefined,
        createdBy: user.id,
        isPrivate,
        initialMembers: [user.id, ...selectedUsers]
      });

      toast.success("Group created successfully");
      setNewGroupName("");
      setNewGroupDescription("");
      setIsPrivate(false);
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteUsers = async () => {
    if (!user || !selectedGroupId || selectedUsers.length === 0) return;

    setIsSubmitting(true);

    try {
      // Add each selected user to the group
      for (const userId of selectedUsers) {
        await addGroupMember({
          groupId: selectedGroupId,
          userId,
          role: "member",
          addedBy: user.id
        });
      }

      toast.success(`${selectedUsers.length} member(s) added to the group`);
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error("Error inviting users:", error);
      toast.error("Failed to invite users");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock user search results - in a real app, this would come from a Convex query
  const searchResults = [
    { id: "user1", name: "John Smith", email: "john@example.com" },
    { id: "user2", name: "Sarah Johnson", email: "sarah@example.com" },
    { id: "user3", name: "Mike Williams", email: "mike@example.com" },
    { id: "user4", name: "Lisa Brown", email: "lisa@example.com" },
  ].filter(u =>
    searchQuery &&
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Communication Settings</DialogTitle>
          <DialogDescription>
            Manage your chat groups and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "groups" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("groups")}
          >
            Create Group
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "invite" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("invite")}
            disabled={!selectedGroupId}
          >
            Invite Members
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "preferences" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </button>
        </div>

        {activeTab === "groups" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Create New Group</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group-description">Description (optional)</Label>
                  <Textarea
                    id="group-description"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Enter group description"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="private-group"
                    checked={isPrivate}
                    onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                  />
                  <Label htmlFor="private-group" className="cursor-pointer">
                    Make this a private group
                  </Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "invite" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Invite Members to Group</h3>
            {!selectedGroupId ? (
              <div className="text-center py-4 text-gray-500">
                Please select a group first
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="search-users">Search Users</Label>
                  <Input
                    id="search-users"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email"
                  />
                </div>

                {searchQuery && (
                  <div className="border rounded-md overflow-hidden">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No users found
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto">
                        {searchResults.map(user => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => toggleUserSelection(user.id)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedUsers.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-2">{selectedUsers.length} user(s) selected</p>
                    <div className="flex flex-wrap gap-2">
                      {searchResults
                        .filter(user => selectedUsers.includes(user.id))
                        .map(user => (
                          <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                            {user.name}
                            <button
                              className="ml-1 hover:text-red-500"
                              onClick={() => toggleUserSelection(user.id)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      }
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Notification Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="notify-all" defaultChecked />
                <Label htmlFor="notify-all" className="cursor-pointer">
                  Notify me for all messages
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="notify-mentions" defaultChecked />
                <Label htmlFor="notify-mentions" className="cursor-pointer">
                  Notify me when I'm mentioned
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="notify-sound" defaultChecked />
                <Label htmlFor="notify-sound" className="cursor-pointer">
                  Play sound for new messages
                </Label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {activeTab === "groups" && (
            <Button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          )}
          {activeTab === "invite" && (
            <Button
              onClick={handleInviteUsers}
              disabled={!selectedGroupId || selectedUsers.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Inviting..." : `Invite ${selectedUsers.length} Member${selectedUsers.length !== 1 ? 's' : ''}`}
            </Button>
          )}
          {activeTab === "preferences" && (
            <Button onClick={onClose}>
              Save Preferences
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
