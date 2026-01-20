'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, User, Headphones, Users } from 'lucide-react';

interface Message {
  _id: string;
  message: string;
  sender: 'user' | 'admin';
  senderName: string;
  createdAt: string;
}

interface ChatRoom {
  userId: string;
  userName: string;
  lastMessage: string;
  unreadCount: number;
}

export default function AdminFloatingChat() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showRoomList, setShowRoomList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && session) {
      loadChatRooms();
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [isOpen, session?.user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startPolling = () => {
    pollIntervalRef.current = setInterval(() => {
      if (isOpen && session) {
        loadChatRooms();
        if (selectedRoom) {
          loadMessages(selectedRoom);
        }
      }
    }, 5000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const loadChatRooms = async () => {
    try {
      const response = await fetch('/api/admin/chat/rooms');
      if (response.ok) {
        const rooms = await response.json();
        setChatRooms(rooms);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const tempMessage: Message = {
      _id: Date.now().toString(),
      message: newMessage,
      sender: 'admin',
      senderName: 'Admin Support',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedRoom,
          message: newMessage,
          senderName: 'Admin Support'
        })
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectRoom = (room: ChatRoom) => {
    setSelectedRoom(room.userId);
    setShowRoomList(false);
    setMessages([]);
    loadMessages(room.userId);
    
    // Mark messages as read when room is selected
    markAsRead(room.userId);
  };

  const markAsRead = async (userId: string) => {
    try {
      await fetch('/api/admin/chat/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      // Update room list to remove unread count
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

  const backToRoomList = () => {
    setShowRoomList(true);
    setSelectedRoom(null);
    setMessages([]);
  };

  const totalUnread = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 relative"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
              {totalUnread}
            </Badge>
          )}
        </Button>
      ) : (
        <Card className="w-80 h-96 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <CardTitle className="text-sm font-medium">
              {showRoomList ? 'Chat Support' : 
                chatRooms.find(r => r.userId === selectedRoom)?.userName || 'User'}
            </CardTitle>
            <div className="flex items-center gap-1">
              {selectedRoom && !showRoomList && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={backToRoomList}
                >
                  <Users className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          {showRoomList ? (
            /* Room List */
            <div className="h-80 overflow-y-auto p-4">
              {chatRooms.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Belum ada percakapan</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatRooms.map((room) => (
                    <div
                      key={room.userId}
                      onClick={() => selectRoom(room)}
                      className="p-3 cursor-pointer hover:bg-muted/50 rounded-lg border transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <p className="font-medium text-sm">{room.userName}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {room.lastMessage}
                            </p>
                          </div>
                        </div>
                        {room.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs h-5">
                            {room.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Chat Messages */
            <>
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                        message.sender === 'admin'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {message.sender === 'admin' ? (
                          <Headphones className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.senderName}
                        </span>
                      </div>
                      <p className="break-words">{message.message}</p>
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

              <div className="border-t p-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ketik balasan..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
