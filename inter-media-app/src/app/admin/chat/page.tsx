'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Send, 
  User, 
  Headphones, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Message {
  _id: string;
  userId: string;
  message: string;
  sender: 'user' | 'admin';
  senderName: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatRoom {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function AdminChatPage() {
  const { data: session } = useSession();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      loadChatRooms();
      // Start polling for new messages
      const interval = setInterval(loadChatRooms, 5000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom);
      markAsRead(selectedRoom);
      // Poll for new messages in selected room
      const interval = setInterval(() => loadMessages(selectedRoom), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRooms = async () => {
    try {
      const response = await fetch('/api/admin/chat/rooms');
      if (response.ok) {
        const rooms = await response.json();
        setChatRooms(rooms);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/history?userId=${userId}`);
      if (response.ok) {
        const history = await response.json();
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async (userId: string) => {
    try {
      await fetch('/api/admin/chat/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      // Update local state
      setChatRooms(prev => 
        prev.map(room => 
          room.userId === userId 
            ? { ...room, unreadCount: 0 }
            : room
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedRoom,
          message: newMessage,
          senderName: 'Admin Support'
        })
      });

      if (response.ok) {
        const newMsg: Message = {
          _id: Date.now().toString(),
          userId: selectedRoom,
          message: newMessage,
          sender: 'admin',
          senderName: 'Admin Support',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        
        // Update chat room last message
        setChatRooms(prev =>
          prev.map(room =>
            room.userId === selectedRoom
              ? {
                  ...room,
                  lastMessage: newMessage,
                  lastMessageTime: new Date().toISOString()
                }
              : room
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (session?.user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only admin can access chat support panel.</p>
        </div>
      </div>
    );
  }

  const totalUnread = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Chat Support</h1>
          <p className="text-muted-foreground">Kelola percakapan dengan pelanggan</p>
        </div>
        {totalUnread > 0 && (
          <Badge variant="destructive" className="ml-auto">
            {totalUnread} pesan baru
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat Rooms List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Percakapan Aktif</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading...
                </div>
              ) : chatRooms.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Belum ada percakapan</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chatRooms.map((room) => (
                    <div
                      key={room.userId}
                      onClick={() => setSelectedRoom(room.userId)}
                      className={`p-4 cursor-pointer hover:bg-muted/50 border-b transition-colors ${
                        selectedRoom === room.userId ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <p className="font-medium text-sm">{room.userName}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {room.lastMessage}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${
                              room.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            <Clock className="h-3 w-3 text-muted-foreground" />
                          </div>
                          {room.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs h-5">
                              {room.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          {selectedRoom ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {chatRooms.find(r => r.userId === selectedRoom)?.userName || 'User'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Online</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col h-[400px] p-0">
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.sender === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {message.sender === 'admin' ? (
                              <Headphones className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            <span className="text-xs opacity-70">
                              {message.senderName}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-50 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ketik balasan..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Pilih percakapan untuk mulai chat</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
