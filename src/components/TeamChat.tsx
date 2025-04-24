import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Send, X, ExternalLink, Users, Paperclip, Smile, Settings } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Mock data for initial development
// Using let instead of const so we can modify it
let MOCK_MESSAGES = [
  {
    id: "1",
    sender: "John Doe",
    senderInitial: "JD",
    avatar: "",
    content: "Hey team, just finished the installation at 123 Main St.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "2",
    sender: "Sarah Smith",
    senderInitial: "SS",
    avatar: "",
    content: "Great job! Did you take photos for the customer?",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "3",
    sender: "Mike Johnson",
    senderInitial: "MJ",
    avatar: "",
    content: "I'll be heading to the next job in Geelong West. Anyone nearby?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

// Available notification sounds
const NOTIFICATION_SOUNDS = [
  { id: 'none', name: 'None', path: '' },
  { id: 'notification1', name: 'Notification 1', path: '/sounds/11L-create_a_message_ale-1745401777480.mp3' },
  { id: 'notification2', name: 'Notification 2', path: '/sounds/11L-create_a_message_ale-1745401785232.mp3' },
  { id: 'notification3', name: 'Notification 3', path: '/sounds/11L-create_a_message_ale-1745401786476.mp3' },
  { id: 'notification4', name: 'Notification 4', path: '/sounds/11L-create_a_message_ale-1745401787676.mp3' },
];

export default function TeamChat() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState(Date.now());
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSound, setNotificationSound] = useLocalStorage('chatNotificationSound', 'notification1');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get groups and direct messages
  const groups = useQuery(api.communication.getUserGroups,
    user ? { userId: user.id } : "skip"
  ) || [];

  const directMessages = useQuery(api.communication.getDirectMessages,
    user ? { userId: user.id } : "skip"
  ) || [];

  // Default to first group or direct message
  const [selectedChatType, setSelectedChatType] = useState<"group" | "direct">("group");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

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

  // Get messages for selected chat
  const groupMessages = useQuery(
    api.communication.getGroupMessages,
    selectedChatType === "group" && selectedChatId
      ? { groupId: selectedChatId, limit: 20 }
      : "skip"
  ) || [];

  const directChatMessages = useQuery(
    api.communication.getDirectMessageHistory,
    selectedChatType === "direct" && selectedChatId && user
      ? { userId: user.id, otherUserId: selectedChatId, limit: 20 }
      : "skip"
  ) || [];

  // Get current messages based on selected chat type
  const currentMessages = selectedChatType === "group" ? groupMessages : directChatMessages;

  // Mutations
  const sendGroupMessage = useMutation(api.communication.sendGroupMessage);
  const sendDirectMessage = useMutation(api.communication.sendDirectMessage);
  const markMessagesAsRead = useMutation(api.communication.markMessagesAsRead);

  // Navigate to Communication Hub
  const goToCommunicationHub = () => {
    setIsOpen(false);
    navigate('/communication');
  };

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, isOpen]);

  // Function to play notification sound
  const playNotificationSound = () => {
    if (notificationSound === 'none') return;

    const soundPath = NOTIFICATION_SOUNDS.find(sound => sound.id === notificationSound)?.path;
    if (!soundPath) return;

    console.log('Playing sound:', soundPath);

    // Always create a new Audio element to avoid issues with reusing the same element
    const audio = new Audio(soundPath);

    // Set volume and other properties
    audio.volume = 0.7;

    // Play the sound
    audio.play().then(() => {
      console.log('Sound played successfully');
    }).catch(error => {
      console.error('Error playing notification sound:', error);

      // Fallback method for browsers with autoplay restrictions
      if (error.name === 'NotAllowedError') {
        // Create a user interaction event handler to play sound later
        const playOnInteraction = () => {
          audio.play();
          document.removeEventListener('click', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
      }
    });

    // Store reference for cleanup
    audioRef.current = audio;
  };

  // Previous unread count ref to detect new messages
  const prevUnreadCountRef = useRef(0);

  // Update unread count when new messages arrive
  useEffect(() => {
    // Calculate total unread count from all groups and direct messages
    const groupUnread = groups.reduce((total, group) => total + (group.unreadCount || 0), 0);
    const dmUnread = directMessages.reduce((total, dm) => total + (dm.unreadCount || 0), 0);
    const totalUnread = groupUnread + dmUnread;

    // Check if there are new messages
    if (totalUnread > prevUnreadCountRef.current && !isOpen) {
      // Play notification sound for new messages
      playNotificationSound();
    }

    // Update unread count
    setUnreadCount(totalUnread);
    prevUnreadCountRef.current = totalUnread;

    // Mark messages as read when chat is open
    if (isOpen && user && selectedChatId) {
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
      setLastSeenTimestamp(timestamp);
    }
  }, [groups, directMessages, isOpen, user, selectedChatId, selectedChatType, markMessagesAsRead, notificationSound]);

  // Clear unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setLastSeenTimestamp(Date.now());
    }
  }, [isOpen]);

  // Preload sounds and cleanup on unmount
  useEffect(() => {
    // Preload notification sounds
    const preloadSounds = () => {
      NOTIFICATION_SOUNDS.forEach(sound => {
        if (sound.path) {
          const audio = new Audio();
          audio.src = sound.path;
          // Just load the audio, don't play it
          audio.load();
          console.log('Preloaded sound:', sound.path);
        }
      });
    };

    // Preload sounds on first user interaction to avoid autoplay restrictions
    const handleFirstInteraction = () => {
      preloadSounds();
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);

    // Cleanup function
    return () => {
      // Cleanup audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === "" || !user || !selectedChatId) return;

    try {
      if (selectedChatType === "group") {
        await sendGroupMessage({
          groupId: selectedChatId,
          senderId: user.id,
          senderName: user.fullName || user.username || "Unknown User",
          senderAvatar: user.imageUrl,
          content: message.trim()
        });
      } else {
        await sendDirectMessage({
          senderId: user.id,
          senderName: user.fullName || user.username || "Unknown User",
          senderAvatar: user.imageUrl,
          receiverId: selectedChatId,
          content: message.trim()
        });
      }

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="default"
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X size={24} />
          ) : (
            <MessageSquare size={24} />
          )}
          {unreadCount > 0 && !isOpen && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Chat Panel - Positioned to the left of the chat button */}
      {isOpen && (
        <div className="fixed right-[80px] bottom-6 z-50 w-80 md:w-96 shadow-2xl flex flex-col" style={{ height: '450px' }}>
          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b flex-shrink-0">
              <div className="flex items-center">
                {selectedChatType === "group" ? (
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <Users className="h-3 w-3 text-blue-600" />
                    </div>
                    <CardTitle className="text-sm font-medium truncate">
                      {groups.find(g => g._id === selectedChatId)?.name || "Team Chat"}
                    </CardTitle>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={directMessages.find(dm => dm.userId === selectedChatId)?.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(directMessages.find(dm => dm.userId === selectedChatId)?.name || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-sm font-medium truncate">
                      {directMessages.find(dm => dm.userId === selectedChatId)?.name || "Chat"}
                    </CardTitle>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-2 text-gray-500 hover:text-blue-600"
                  onClick={goToCommunicationHub}
                  title="Open Communication Hub"
                >
                  <ExternalLink size={14} />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-500 hover:text-blue-600"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Chat Settings"
                >
                  <Settings size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-500 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                >
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>
          <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
            {/* Settings Dialog */}
            {showSettings && (
              <div className="p-3 border-b">
                <h4 className="text-sm font-medium mb-2">Notification Settings</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Notification Sound</label>
                    <select
                      className="w-full text-sm p-1 border rounded"
                      value={notificationSound}
                      onChange={(e) => setNotificationSound(e.target.value)}
                    >
                      {NOTIFICATION_SOUNDS.map(sound => (
                        <option key={sound.id} value={sound.id}>{sound.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        // Test the selected sound
                        if (notificationSound !== 'none') {
                          playNotificationSound();
                        }
                      }}
                    >
                      Test Sound
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Group/Chat Selector */}
            <div className="border-b p-2 flex items-center gap-1 overflow-x-auto flex-shrink-0 scrollbar-hide">
              {groups.slice(0, 5).map(group => (
                <Button
                  key={group._id}
                  variant={selectedChatType === "group" && selectedChatId === group._id ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs whitespace-nowrap"
                  onClick={() => {
                    setSelectedChatType("group");
                    setSelectedChatId(group._id);
                  }}
                >
                  <span className="truncate max-w-[80px]">{group.name}</span>
                  {group.unreadCount > 0 && (
                    <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-[10px]">
                      {group.unreadCount}
                    </Badge>
                  )}
                </Button>
              ))}
              {directMessages.slice(0, 3).map(dm => (
                <Button
                  key={dm.userId}
                  variant={selectedChatType === "direct" && selectedChatId === dm.userId ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs whitespace-nowrap"
                  onClick={() => {
                    setSelectedChatType("direct");
                    setSelectedChatId(dm.userId);
                  }}
                >
                  <span className="truncate max-w-[80px]">{dm.name}</span>
                  {dm.unreadCount > 0 && (
                    <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-[10px]">
                      {dm.unreadCount}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-3 space-y-3" style={{ height: '300px' }}>
              {currentMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                currentMessages.map((msg) => (
                  <div key={msg._id} className="flex gap-2">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      <AvatarImage src={msg.senderAvatar || ""} />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {getInitials(msg.senderName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">{msg.senderName}</span>
                        <span className="text-[10px] text-gray-500">{formatTime(msg.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-700">{msg.content}</p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {msg.attachments.map((attachment, index) => {
                            // Check if it's an image or GIF
                            const isGif = attachment.includes('giphy.com') || /\.gif$/i.test(attachment);
                            const isImage = isGif ||
                              /\.(jpe?g|png|webp)$/i.test(attachment) ||
                              attachment.startsWith('data:image/');

                            return isImage ? (
                              <div key={index} className="max-w-[120px] rounded overflow-hidden border border-gray-200">
                                <img
                                  src={attachment}
                                  alt="Image"
                                  className="w-full h-auto max-h-[80px] object-contain"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <a
                                key={index}
                                href={attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-[10px] flex items-center"
                              >
                                <Paperclip className="h-2 w-2 mr-1" />
                                Attachment
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-2 border-t">
              <div className="flex items-center gap-1 mb-1">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    title="Add Smile Emoji"
                    onClick={() => setMessage(prev => prev + '😊')}
                  >
                    <span className="text-xs">😊</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    title="Add Thumbs Up"
                    onClick={() => setMessage(prev => prev + '👍')}
                  >
                    <span className="text-xs">👍</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    title="Add Heart"
                    onClick={() => setMessage(prev => prev + '❤️')}
                  >
                    <span className="text-xs">❤️</span>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  title="Attach File"
                  onClick={() => {
                    // File upload functionality would go here
                    // For now, just show a message
                    alert('File upload is available in the full Communication Hub');
                  }}
                >
                  <Paperclip className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="min-h-[40px] resize-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                  onClick={handleSendMessage}
                  disabled={message.trim() === ""}
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}
    </>
  );
}
