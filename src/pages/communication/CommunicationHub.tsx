import { useState, lazy, Suspense, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "./CommunicationHub.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, MessageSquare, PlusCircle, Search,
  Image as ImageIcon, Smile, Paperclip, Send, Settings,
  CheckSquare, Plus, Filter, Loader2, Gift,
  FileVideo, File, FileText
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import ChatSettings from "./ChatSettings";
import { BasicEmojiPicker } from "@/components/ui/basic-emoji-picker";
import { FileUpload } from "@/components/ui/file-upload";
import { DynamicGifPicker } from "@/components/ui/dynamic-gif-picker";

// Lazy load the TasksPage component
const TasksPage = lazy(() => import("@/pages/tasks/TasksPage"));

// Type definitions
interface ChatGroup {
  _id: string;
  name: string;
  description?: string;
  memberCount: number;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
}

interface DirectMessage {
  userId: string;
  name: string;
  avatar?: string;
  online: boolean;
  unreadCount: number;
  lastSeen?: number;
}

interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: number;
  attachments?: string[];
}

// Mock data for initial development
const MOCK_GROUPS = [
  { id: "1", name: "Installation Team", members: 8, unread: 3 },
  { id: "2", name: "Sales Department", members: 5, unread: 0 },
  { id: "3", name: "Management", members: 3, unread: 1 },
  { id: "4", name: "Customer Support", members: 4, unread: 0 },
];

const MOCK_DIRECT_MESSAGES = [
  { id: "1", name: "John Smith", avatar: "", online: true, unread: 2 },
  { id: "2", name: "Sarah Johnson", avatar: "", online: true, unread: 0 },
  { id: "3", name: "Mike Williams", avatar: "", online: false, unread: 0 },
  { id: "4", name: "Lisa Brown", avatar: "", online: false, unread: 1 },
];

const MOCK_MESSAGES = [
  {
    id: "1",
    sender: "John Smith",
    senderInitial: "JS",
    avatar: "",
    content: "Hey team, just finished the installation at 123 Main St.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "2",
    sender: "Sarah Johnson",
    senderInitial: "SJ",
    avatar: "",
    content: "Great job! Did you take photos for the customer?",
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: "3",
    sender: "John Smith",
    senderInitial: "JS",
    avatar: "",
    content: "Yes, I've uploaded them to the customer's account. They were very happy with the installation.",
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: "4",
    sender: "Mike Williams",
    senderInitial: "MW",
    avatar: "",
    content: "I'll be heading to the next job in Geelong West. Anyone nearby?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "5",
    sender: "Lisa Brown",
    senderInitial: "LB",
    avatar: "",
    content: "I'm about 15 minutes away. Need any help?",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "6",
    sender: "Mike Williams",
    senderInitial: "MW",
    avatar: "",
    content: "That would be great! It's a double garage door installation.",
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
];

const MOCK_TASKS = [
  {
    id: "1",
    title: "Complete installation at 45 Beach Road",
    status: "in-progress",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    priority: "high"
  },
  {
    id: "2",
    title: "Follow up with customer about quote",
    status: "todo",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    priority: "medium"
  },
  {
    id: "3",
    title: "Order parts for next week's installations",
    status: "todo",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    priority: "low"
  },
  {
    id: "4",
    title: "Submit expense report",
    status: "completed",
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    priority: "medium"
  },
];

export default function CommunicationHub() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedChatType, setSelectedChatType] = useState<"group" | "direct">("group");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGif, setSelectedGif] = useState<{url: string, id: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch groups and direct messages
  const groups = useQuery(api.communication.getUserGroups,
    user ? { userId: user.id } : "skip"
  ) || [];

  const directMessages = useQuery(api.communication.getDirectMessages,
    user ? { userId: user.id } : "skip"
  ) || [];

  // Fetch messages for selected chat
  const groupMessages = useQuery(
    api.communication.getGroupMessages,
    selectedChatType === "group" && selectedChatId
      ? { groupId: selectedChatId, limit: 50 }
      : "skip"
  ) || [];

  const directChatMessages = useQuery(
    api.communication.getDirectMessageHistory,
    selectedChatType === "direct" && selectedChatId && user
      ? { userId: user.id, otherUserId: selectedChatId, limit: 50 }
      : "skip"
  ) || [];

  // Mutations
  const sendGroupMessage = useMutation(api.communication.sendGroupMessage);
  const sendDirectMessage = useMutation(api.communication.sendDirectMessage);
  const updateUserStatus = useMutation(api.communication.updateUserStatus);
  const markMessagesAsRead = useMutation(api.communication.markMessagesAsRead);

  // Set user as online when component mounts
  useEffect(() => {
    if (user) {
      updateUserStatus({ userId: user.id, isOnline: true });

      // Set user as offline when component unmounts
      return () => {
        updateUserStatus({ userId: user.id, isOnline: false });
      };
    }
  }, [user, updateUserStatus]);

  // Set initial selected chat
  useEffect(() => {
    if (groups.length > 0 && !selectedChatId) {
      setSelectedChatType("group");
      setSelectedChatId(groups[0]._id);
    } else if (directMessages.length > 0 && !selectedChatId) {
      setSelectedChatType("direct");
      setSelectedChatId(directMessages[0].userId);
    }
  }, [groups, directMessages, selectedChatId]);

  // Get the selected chat object
  const selectedGroup = groups.find(group => group._id === selectedChatId);
  const selectedDirectMessage = directMessages.find(dm => dm.userId === selectedChatId);

  // Get messages for the current chat
  const currentMessages = selectedChatType === "group" ? groupMessages : directChatMessages;

  // Scroll to bottom when messages change, but not when typing
  useEffect(() => {
    if (messagesEndRef.current && currentMessages.length > 0) {
      // Use a more controlled approach to scrolling
      const messagesContainer = messagesEndRef.current.parentElement;
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [currentMessages.length]); // Only trigger on message count changes

  // Mark messages as read when viewing a chat
  useEffect(() => {
    if (!user || !selectedChatId) return;

    const timestamp = Date.now();

    if (selectedChatType === "group") {
      markMessagesAsRead({
        userId: user.id,
        groupId: selectedChatId,
        timestamp
      });
    } else if (selectedChatType === "direct") {
      markMessagesAsRead({
        userId: user.id,
        otherUserId: selectedChatId,
        timestamp
      });
    }
  }, [selectedChatType, selectedChatId, user, markMessagesAsRead]);

  // These definitions were moved up to fix the reference error

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setSelectedGif(null); // Clear any selected GIF
    toast.success(`File selected: ${file.name}`);
  };

  const handleGifSelect = (gifUrl: string) => {
    console.log("GIF selected:", gifUrl);
    setSelectedGif({ url: gifUrl, id: "giphy" });
    setSelectedFile(null); // Clear any selected file
    toast.success("GIF selected");
  };

  const uploadFile = async (file: File): Promise<string> => {
    // In a production app, this would upload to a storage service
    // For now, we'll create a local object URL for the file
    return new Promise((resolve) => {
      setIsUploading(true);

      // Create a FileReader to read the file as a data URL
      const reader = new FileReader();

      reader.onload = (event) => {
        setIsUploading(false);
        // Use the data URL which will work reliably in the browser
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          // Fallback to object URL if FileReader fails
          const objectUrl = URL.createObjectURL(file);
          resolve(objectUrl);
        }
      };

      reader.onerror = () => {
        setIsUploading(false);
        // Fallback to object URL if FileReader fails
        const objectUrl = URL.createObjectURL(file);
        resolve(objectUrl);
      };

      // Read the file as a data URL (base64 encoded string)
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async () => {
    if (!user || !selectedChatId || (message.trim() === "" && !selectedFile && !selectedGif)) return;

    try {
      let attachments: string[] = [];

      // Upload file if selected
      if (selectedFile) {
        const fileUrl = await uploadFile(selectedFile);
        attachments.push(fileUrl);
        setSelectedFile(null);
      }

      // Add GIF if selected
      if (selectedGif) {
        attachments.push(selectedGif.url);
        setSelectedGif(null);
      }

      if (selectedChatType === "group") {
        await sendGroupMessage({
          groupId: selectedChatId,
          senderId: user.id,
          senderName: user.fullName || user.username || "Unknown User",
          senderAvatar: user.imageUrl,
          content: message.trim(),
          attachments: attachments.length > 0 ? attachments : undefined
        });
      } else {
        await sendDirectMessage({
          senderId: user.id,
          senderName: user.fullName || user.username || "Unknown User",
          senderAvatar: user.imageUrl,
          receiverId: selectedChatId,
          content: message.trim(),
          attachments: attachments.length > 0 ? attachments : undefined
        });
      }

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-blue-500";
    }
  };



  return (
    <div className="communication-hub-container flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold">Communication Hub</h1>
        <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Settings Dialog */}
      <ChatSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedGroupId={selectedChatType === "group" ? selectedChatId || undefined : undefined}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-container flex-1 flex flex-col h-full overflow-hidden">
        <div className="border-b flex-shrink-0">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="chat" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center">
              <CheckSquare className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="tab-content flex-1 flex space-x-4 mt-0 p-0 overflow-hidden">
          {/* Sidebar - Groups & Direct Messages */}
          <div className="chat-sidebar w-64 border-r pr-4 flex flex-col h-full overflow-y-auto">
            <div className="mb-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-sm text-gray-500">GROUPS</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                {groups.length === 0 ? (
                  <div className="text-center py-2 text-sm text-gray-500">
                    No groups yet
                  </div>
                ) : (
                  groups.map(group => (
                    <Button
                      key={group._id}
                      variant={selectedChatType === "group" && selectedChatId === group._id ? "secondary" : "ghost"}
                      className="w-full justify-start font-normal relative"
                      onClick={() => {
                        setSelectedChatType("group");
                        setSelectedChatId(group._id);
                      }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      <span className="truncate">{group.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">{group.memberCount}</span>
                      {group.unreadCount > 0 && (
                        <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                          {group.unreadCount}
                        </Badge>
                      )}
                    </Button>
                  ))
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-sm text-gray-500">DIRECT MESSAGES</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                {directMessages.length === 0 ? (
                  <div className="text-center py-2 text-sm text-gray-500">
                    No direct messages yet
                  </div>
                ) : (
                  directMessages.map(dm => (
                    <Button
                      key={dm.userId}
                      variant={selectedChatType === "direct" && selectedChatId === dm.userId ? "secondary" : "ghost"}
                      className="w-full justify-start font-normal relative"
                      onClick={() => {
                        setSelectedChatType("direct");
                        setSelectedChatId(dm.userId);
                      }}
                    >
                      <div className="relative mr-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={dm.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(dm.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${dm.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                      <span className="truncate">{dm.name}</span>
                      {dm.unreadCount > 0 && (
                        <Badge className="ml-auto h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                          {dm.unreadCount}
                        </Badge>
                      )}
                    </Button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-auto mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search conversations..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Chat Header */}
            <div className="border-b p-4 flex-shrink-0">
              {!selectedChatId ? (
                <div className="text-center py-2 text-gray-500">
                  Select a conversation to start chatting
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="mr-3">
                    {selectedChatType === "group" ? (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    ) : (
                      <Avatar>
                        <AvatarImage src={selectedDirectMessage?.avatar} />
                        <AvatarFallback>
                          {selectedDirectMessage ? getInitials(selectedDirectMessage.name) : "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {selectedChatType === "group"
                        ? selectedGroup?.name
                        : selectedDirectMessage?.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedChatType === "group"
                        ? `${selectedGroup?.memberCount || 0} members`
                        : (selectedDirectMessage?.online ? "Online" : "Offline")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="messages-container flex-1 overflow-y-auto p-4 space-y-3">
              {!selectedChatId ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select a conversation to view messages
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <>
                  {currentMessages.map((msg) => (
                    <div key={msg._id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={msg.senderAvatar} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {getInitials(msg.senderName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{msg.senderName}</span>
                          <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{msg.content}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {msg.attachments.map((attachment, index) => {
                              // Check if it's an image or GIF
                              const isGif = attachment.includes('giphy.com') || /\.gif$/i.test(attachment);
                              // Check if it's an image (including data URLs)
                              const isImage = isGif ||
                                /\.(jpe?g|png|webp)$/i.test(attachment) ||
                                attachment.startsWith('data:image/');
                              // Check if it's a video
                              const isVideo = /\.(mp4|webm|ogg)$/i.test(attachment) ||
                                attachment.startsWith('data:video/');
                              // Check if it's a PDF
                              const isPdf = /\.pdf$/i.test(attachment) ||
                                attachment.startsWith('data:application/pdf');

                              if (isImage) {
                                return (
                                  <div key={index} className="max-w-[300px] w-full rounded overflow-hidden border border-gray-200">
                                    {isGif ? (
                                      <div className="relative">
                                        <img
                                          src={attachment}
                                          alt="GIF"
                                          className="w-full h-auto max-h-[200px] object-contain"
                                          loading="lazy"
                                        />
                                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                          GIF
                                        </div>
                                      </div>
                                    ) : (
                                      <img
                                        src={attachment}
                                        alt="Image"
                                        className="w-full h-auto max-h-[200px] object-contain"
                                        loading="lazy"
                                      />
                                    )}
                                  </div>
                                );
                              } else if (isVideo) {
                                return (
                                  <div key={index} className="max-w-[300px] w-full rounded overflow-hidden border border-gray-200">
                                    <div className="relative bg-gray-100 p-2">
                                      <video
                                        controls
                                        className="w-full h-auto max-h-[200px]"
                                        preload="metadata"
                                      >
                                        <source src={attachment} />
                                        Your browser does not support the video tag.
                                      </video>
                                      <div className="mt-1 text-xs text-gray-500 flex items-center">
                                        <FileVideo className="h-3 w-3 mr-1" />
                                        Video Attachment
                                      </div>
                                    </div>
                                  </div>
                                );
                              } else if (isPdf) {
                                return (
                                  <a
                                    key={index}
                                    href={attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="max-w-[300px] w-full rounded overflow-hidden border border-gray-200 bg-gray-100 p-3 flex flex-col items-center hover:bg-gray-200 transition-colors"
                                  >
                                    <FileText className="h-8 w-8 text-red-500 mb-1" />
                                    <span className="text-sm font-medium">PDF Document</span>
                                    <span className="text-xs text-blue-600">Click to open</span>
                                  </a>
                                );
                              } else {
                                // Generic file attachment
                                return (
                                  <a
                                    key={index}
                                    href={attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="max-w-[300px] w-full rounded overflow-hidden border border-gray-200 bg-gray-100 p-3 flex flex-col items-center hover:bg-gray-200 transition-colors"
                                  >
                                    <File className="h-8 w-8 text-blue-500 mb-1" />
                                    <span className="text-sm font-medium">File Attachment</span>
                                    <span className="text-xs text-blue-600">Click to download</span>
                                  </a>
                                );
                              }
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="input-container p-4 border-t flex-shrink-0">
              {!selectedChatId ? (
                <div className="text-center text-gray-500 py-2">
                  Select a conversation to start chatting
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      accept="application/pdf,video/*,audio/*,text/*"
                      maxSize={10}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 px-2 py-1"
                        title="Attach Document, Video or Audio"
                      >
                        <Paperclip className="h-3 w-3" />
                        <span className="text-xs">Files</span>
                      </Button>
                    </FileUpload>

                    <FileUpload
                      onFileSelect={handleFileSelect}
                      accept="image/*"
                      maxSize={5}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 px-2 py-1"
                        title="Upload Images"
                      >
                        <ImageIcon className="h-3 w-3" />
                        <span className="text-xs">Images</span>
                      </Button>
                    </FileUpload>

                    <DynamicGifPicker onGifSelect={handleGifSelect}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 px-2 py-1"
                        title="Add GIF"
                      >
                        <Gift className="h-3 w-3" />
                        <span className="text-xs">GIFs</span>
                      </Button>
                    </DynamicGifPicker>

                    <BasicEmojiPicker onEmojiSelect={handleEmojiSelect}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 px-2 py-1"
                        title="Add Emoji"
                      >
                        <Smile className="h-3 w-3" />
                        <span className="text-xs">Emoji</span>
                      </Button>
                    </BasicEmojiPicker>

                    {selectedFile && (
                      <Badge variant="outline" className="ml-2 gap-1 flex items-center">
                        {selectedFile.name.length > 15
                          ? selectedFile.name.substring(0, 12) + '...'
                          : selectedFile.name}
                        <button
                          className="ml-1 hover:text-red-500"
                          onClick={() => setSelectedFile(null)}
                        >
                          ×
                        </button>
                      </Badge>
                    )}

                    {selectedGif && (
                      <div className="ml-2 flex items-center gap-2">
                        <Badge variant="outline" className="gap-1 flex items-center">
                          GIF selected
                          <button
                            className="ml-1 hover:text-red-500"
                            onClick={() => setSelectedGif(null)}
                          >
                            ×
                          </button>
                        </Badge>
                        <div className="w-10 h-10 rounded overflow-hidden">
                          <img
                            src={selectedGif.url}
                            alt="Selected GIF"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      // Prevent auto-focus and scrolling issues
                      autoFocus={false}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="icon"
                      className="rounded-full bg-blue-600 hover:bg-blue-700 h-10 w-10 flex-shrink-0"
                      onClick={handleSendMessage}
                      disabled={(message.trim() === "" && !selectedFile && !selectedGif) || isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="flex-1 mt-0 p-0">
          <Suspense fallback={<div className="p-8 text-center">Loading tasks...</div>}>
            <TasksPage />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
