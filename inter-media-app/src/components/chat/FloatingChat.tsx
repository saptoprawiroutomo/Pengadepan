'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
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
  customerId: string;
  adminId?: string;
}

export default function FloatingChat() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session && session.user.role === 'customer') {
      // Initialize socket connection
      const socketInstance = io('http://localhost:3001');
      setSocket(socketInstance);

      // Get or create chat room
      initializeChat();

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [session]);

  useEffect(() => {
    if (socket && room) {
      socket.emit('join-room', room._id);

      socket.on('new-message', (message: Message) => {
        setMessages(prev => [...prev, message]);
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
        scrollToBottom();
      });

      return () => {
        socket.off('new-message');
      };
    }
  }, [socket, room, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const initializeChat = async () => {
    try {
      const response = await fetch('/api/chat/rooms', { method: 'POST' });
      if (response.ok) {
        const roomData = await response.json();
        setRoom(roomData);
        loadMessages(roomData._id);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !room) return;

    try {
      const response = await fetch(`/api/chat/rooms/${room._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const message = await response.json();
        socket?.emit('send-message', { roomId: room._id, message });
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

  if (!session || session.user.role !== 'customer') {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-xl z-50 rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Customer Support
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="flex flex-col h-80 p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm">
                    <p>Halo! Ada yang bisa kami bantu?</p>
                    <p>Tim support kami siap membantu Anda 24/7</p>
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
                        className={`max-w-[70%] p-2 rounded-2xl text-sm ${
                          message.senderId._id === session.user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p>{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
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
                    placeholder="Ketik pesan..."
                    className="flex-1 rounded-2xl"
                  />
                  <Button type="submit" size="sm" className="rounded-2xl">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}
