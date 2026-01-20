'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, User, Headphones } from 'lucide-react';

interface Message {
  _id: string;
  message: string;
  sender: 'user' | 'admin';
  senderName: string;
  createdAt: string;
}

export default function FloatingChat() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && session) {
      loadChatHistory();
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [isOpen, session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startPolling = () => {
    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      loadChatHistory();
    }, 3000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const loadChatHistory = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/chat/history?userId=${session.user.id}`);
      if (response.ok) {
        const history = await response.json();
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setIsConnected(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !session) return;

    const tempMessage: Message = {
      _id: Date.now().toString(),
      message: newMessage,
      sender: 'user',
      senderName: session.user.name || 'User',
      createdAt: new Date().toISOString()
    };

    // Add to local state immediately
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    // Send to server
    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          message: newMessage,
          senderName: session.user.name
        })
      });
      setIsConnected(true);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsConnected(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!session) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => window.location.href = '/login'}
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 relative"
        >
          <MessageCircle className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">💬</span>
          </div>
        </Button>
      ) : (
        <Card className="w-80 h-96 shadow-xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Chat Support</CardTitle>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  <Headphones className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p>Halo! Ada yang bisa kami bantu?</p>
                  <p className="text-xs mt-1">Tim support siap membantu Anda</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        message.sender === 'user'
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
                      <p>{message.message}</p>
                      <p className="text-xs opacity-50 mt-1">
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

            {/* Input Area */}
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ketik pesan..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Tekan Enter untuk kirim pesan
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
