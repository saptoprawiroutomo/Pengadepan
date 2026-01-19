'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  message: string;
  senderId: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

interface ChatRoom {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  adminId?: {
    _id: string;
    name: string;
  };
  lastMessageAt: string;
}

export default function AdminChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;
    
    if (!['admin', 'kasir'].includes(session.user.role)) {
      router.push('/');
      return;
    }

    // Initialize socket connection
    const socketInstance = io('http://localhost:3001');
    setSocket(socketInstance);

    loadRooms();

    return () => {
      socketInstance.disconnect();
    };
  }, [session, router]);

  useEffect(() => {
    if (socket && selectedRoom) {
      socket.emit('join-room', selectedRoom._id);

      socket.on('new-message', (message: Message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      return () => {
        socket.off('new-message');
      };
    }
  }, [socket, selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms');
      if (response.ok) {
        const roomsData = await response.json();
        setRooms(roomsData);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`);
      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const selectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    loadMessages(room._id);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const response = await fetch(`/api/chat/rooms/${selectedRoom._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const message = await response.json();
        socket?.emit('send-message', { roomId: selectedRoom._id, message });
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!session || !['admin', 'kasir'].includes(session.user.role)) {
    return <div className="container mx-auto px-4 py-8">Unauthorized</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chat Inbox</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat Rooms List */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {rooms.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Belum ada conversation
                </div>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room._id}
                    onClick={() => selectRoom(room)}
                    className={`p-4 cursor-pointer hover:bg-muted/50 border-b ${
                      selectedRoom?._id === room._id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{room.customerId.name}</p>
                        <p className="text-sm text-muted-foreground">{room.customerId.email}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(room.lastMessageAt).toLocaleDateString('id-ID')}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2 rounded-2xl">
          {selectedRoom ? (
            <>
              <CardHeader>
                <CardTitle>Chat dengan {selectedRoom.customerId.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[500px] p-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      Belum ada pesan dalam conversation ini
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.senderId._id === session.user.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            message.senderId._id === session.user.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">
                              {message.senderId.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {message.senderId.role}
                            </Badge>
                          </div>
                          <p>{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.createdAt).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ketik balasan..."
                      className="flex-1 rounded-2xl"
                    />
                    <Button type="submit" className="rounded-2xl">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4" />
                <p>Pilih conversation untuk mulai chat</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
