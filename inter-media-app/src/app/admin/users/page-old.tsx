'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userFormSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.enum(['admin', 'kasir', 'customer']),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
});

type UserForm = z.infer<typeof userFormSchema>;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<UserForm>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: 'customer',
      isActive: true
    }
  });

  useEffect(() => {
    console.log('Session:', session);
    console.log('User role:', session?.user?.role);
    
    if (!session) {
      console.log('No session, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (session.user.role !== 'admin') {
      console.log('Not admin role, redirecting home');
      router.push('/');
      return;
    }

    console.log('Admin authenticated, fetching users');
    fetchUsers();
  }, [session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        console.error('Failed to fetch users:', response.status);
        return;
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (data: UserForm) => {
    try {
      const url = editingUser 
        ? `/api/admin/users/${editingUser._id}`
        : '/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // For new users, password is required
      // For editing users, password is optional
      const submitData = { ...data };
      if (editingUser && !data.password) {
        delete submitData.password;
      } else if (!editingUser && !data.password) {
        alert('Password wajib diisi untuk user baru');
        return;
      }
      
      console.log('Submitting user data:', { ...submitData, password: submitData.password ? '[HIDDEN]' : undefined });
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        fetchUsers();
        setIsDialogOpen(false);
        reset();
        setEditingUser(null);
        alert('User berhasil dibuat!');
      } else {
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          console.log('Parsed error data:', errorData);
        } catch (e) {
          console.log('Failed to parse JSON, raw text:', responseText.substring(0, 200));
          errorData = { error: 'Server error: ' + responseText.substring(0, 100) };
        }
        
        console.error('API Error:', errorData);
        alert(`Error: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      role: user.role as any,
      phone: user.phone,
      address: user.address,
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus user ini?')) {
      try {
        const response = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    reset();
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Users</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Tambah User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'Edit informasi user yang sudah ada' : 'Tambahkan user baru ke sistem'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    className="rounded-2xl"
                    placeholder="Nama lengkap"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="rounded-2xl"
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password {editingUser && '(kosongkan jika tidak diubah)'}</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="rounded-2xl"
                    placeholder="Password"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="kasir">Kasir</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && (
                    <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    className="rounded-2xl"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <Label htmlFor="isActive">Status</Label>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value?.toString()}>
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Aktif</SelectItem>
                          <SelectItem value="false">Nonaktif</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  {...register('address')}
                  className="rounded-2xl"
                  placeholder="Alamat lengkap"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="rounded-2xl">
                  {editingUser ? 'Update' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" onClick={handleDialogClose} className="rounded-2xl">
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Daftar Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'kasir' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="rounded-2xl"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user._id)}
                        className="rounded-2xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
