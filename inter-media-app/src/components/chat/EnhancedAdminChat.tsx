'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, X, Send, User, Headphones, Users, Megaphone, History, UserPlus, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  _id: string;
  message: string;
  sender: 'user' | 'admin';
  senderName: string;
  userId: string;
  createdAt: string;
  isPromo?: boolean;
}

interface ChatRoom {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  unreadCount: number;
  lastActivity: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function EnhancedAdminChat() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load customers from database
  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  // Load chat rooms
  const loadChatRooms = async () => {
    try {
      let response = await fetch('/api/admin/chat/rooms');
      
      // If unauthorized, try debug endpoint
      if (response.status === 401) {
        response = await fetch('/api/admin/chat/rooms-debug');
      }
      
      if (response.ok) {
        const rooms = await response.json();
        setChatRooms(rooms);
      } else {
        console.error('Failed to load chat rooms:', response.status);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  // Load chat history for selected room
  const loadChatHistory = async (userId: string) => {
    try {
      let response = await fetch(`/api/chat/history?userId=${userId}`);
      
      // If unauthorized, try debug endpoint
      if (response.status === 401) {
        response = await fetch(`/api/admin/chat/history-debug?userId=${userId}`);
      }
      
      if (response.ok) {
        const history = await response.json();
        setMessages(history);
        
        // Try to mark as read (only if authenticated)
        if (response.url.includes('/api/chat/history')) {
          await fetch('/api/admin/chat/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          }).catch(() => {}); // Ignore errors
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Send message to specific customer
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      let response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedRoom,
          message: newMessage,
          senderName: session?.user?.name || 'Admin'
        })
      });

      // If unauthorized, try debug endpoint
      if (response.status === 401) {
        response = await fetch('/api/admin/chat/history-debug', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedRoom,
            message: newMessage,
            senderName: session?.user?.name || 'Admin'
          })
        });
      }

      setNewMessage('');
      loadChatHistory(selectedRoom);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Start new chat with customer
  const startNewChat = async () => {
    if (!selectedCustomer || !newMessage.trim()) return;

    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedCustomer,
          message: newMessage,
          senderName: session?.user?.name || 'Admin'
        })
      });

      setSelectedRoom(selectedCustomer);
      setNewMessage('');
      setActiveTab('chat');
      loadChatHistory(selectedCustomer);
      loadChatRooms();
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  // Broadcast promo to all customers
  const broadcastPromo = async () => {
    if (!promoMessage.trim()) {
      toast.error("Silakan masukkan pesan promo terlebih dahulu");
      return;
    }

    setIsBroadcasting(true);
    
    try {
      const response = await fetch('/api/admin/chat/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promoMessage,
          senderName: session?.user?.name || 'Admin',
          isPromo: true
        })
      });

      if (response.ok) {
        setPromoMessage('');
        toast.success("🎉 Promo berhasil dikirim ke semua pelanggan!", {
          description: "Pesan broadcast telah terkirim",
          duration: 5000,
        });
      } else {
        throw new Error('Failed to broadcast');
      }
    } catch (error) {
      console.error('Error broadcasting promo:', error);
      toast.error("Gagal mengirim broadcast", {
        description: "Terjadi kesalahan saat mengirim promo"
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  useEffect(() => {
    if (isOpen && session?.user?.role === 'admin') {
      loadCustomers();
      loadChatRooms();
    }
  }, [isOpen, session]);

  useEffect(() => {
    if (selectedRoom) {
      loadChatHistory(selectedRoom);
    }
  }, [selectedRoom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle ESC key to close chat
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[420px]">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 relative animate-bounce hover:animate-none transition-all duration-300 hover:scale-110"
          title="Buka Admin Chat"
        >
          <MessageCircle className="h-6 w-6" />
          {chatRooms.reduce((total, room) => total + room.unreadCount, 0) > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white animate-pulse">
              {chatRooms.reduce((total, room) => total + room.unreadCount, 0)}
            </Badge>
          )}
        </Button>
      ) : (
        <Card className="w-[420px] h-[500px] shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Headphones className="h-4 w-4 text-blue-600" />
              Admin Chat Center
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                title="Minimize (ESC)"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                title="Tutup Chat (ESC)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 h-[440px]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat" className="text-xs">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="new" className="text-xs">
                  <UserPlus className="h-3 w-3 mr-1" />
                  New
                </TabsTrigger>
                <TabsTrigger value="promo" className="text-xs">
                  <Megaphone className="h-3 w-3 mr-1" />
                  Promo
                </TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat" className="h-[400px] flex flex-col">
                {!selectedRoom ? (
                  <div className="flex flex-col h-full">
                    <div className="p-3 border-b">
                      <h3 className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Active Chats ({chatRooms.length})
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                    {chatRooms.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Belum ada chat aktif
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {chatRooms.map((room) => (
                          <div
                            key={room.userId}
                            onClick={() => setSelectedRoom(room.userId)}
                            className="p-2 border rounded cursor-pointer hover:bg-muted"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="font-medium text-sm truncate">{room.userName}</p>
                                <p className="text-xs text-muted-foreground truncate">{room.userEmail}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                                  {room.lastMessage}
                                </p>
                              </div>
                              {room.unreadCount > 0 && (
                                <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs flex-shrink-0">
                                  {room.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="p-3 border-b flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRoom(null)}
                      >
                        ←
                      </Button>
                      <div>
                        <p className="font-medium text-sm">
                          {chatRooms.find(r => r.userId === selectedRoom)?.userName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {chatRooms.find(r => r.userId === selectedRoom)?.userEmail}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[280px] rounded-lg px-3 py-2 text-sm break-words ${
                              message.sender === 'admin'
                                ? message.isPromo 
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-blue-500 text-white'
                                : 'bg-muted'
                            }`}
                          >
                            {message.isPromo && (
                              <div className="flex items-center gap-1 mb-1">
                                <Megaphone className="h-3 w-3" />
                                <span className="text-xs font-medium">PROMO</span>
                              </div>
                            )}
                            <p className="break-words">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">
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

                    {/* Message Input */}
                    <div className="border-t p-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ketik balasan..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1 text-sm"
                        />
                        <Button onClick={sendMessage} size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* New Chat Tab */}
              <TabsContent value="new" className="h-[400px] p-3">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Mulai Chat Baru
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Pilih Pelanggan:</label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pelanggan..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.filter(c => c.role === 'customer').map((customer) => (
                          <SelectItem key={customer._id} value={customer._id}>
                            {customer.name} ({customer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Pesan:</label>
                    <Input
                      placeholder="Halo! Ada yang bisa kami bantu?"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={startNewChat}
                    disabled={!selectedCustomer || !newMessage.trim()}
                    className="w-full"
                  >
                    Mulai Chat
                  </Button>
                </div>
              </TabsContent>

              {/* Promo Broadcast Tab */}
              <TabsContent value="promo" className="h-[400px] p-3">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  Broadcast Promo
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Pesan Promo:</label>
                    <textarea
                      placeholder="🎉 PROMO SPESIAL! Diskon 20% untuk semua produk printer. Berlaku hingga akhir bulan!"
                      value={promoMessage}
                      onChange={(e) => setPromoMessage(e.target.value)}
                      className="w-full mt-1 p-2 border rounded text-sm h-24 resize-none"
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Promo akan dikirim ke {customers.filter(c => c.role === 'customer').length} pelanggan
                  </div>

                  <Button 
                    onClick={broadcastPromo}
                    disabled={!promoMessage.trim() || isBroadcasting}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-all duration-200"
                  >
                    {isBroadcasting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Megaphone className="h-4 w-4 mr-2" />
                        Kirim Promo ke Semua
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-muted-foreground">
                    💡 Tips: Gunakan emoji dan kata-kata menarik untuk promo yang efektif
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
