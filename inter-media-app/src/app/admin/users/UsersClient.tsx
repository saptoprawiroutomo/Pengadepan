'use client';

import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';

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
      
      const submitData = { ...data };
      if (editingUser && !data.password) {
        delete submitData.password;
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        fetchUsers();
        setIsDialogOpen(false);
        reset();
        setEditingUser(null);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error saving user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'kasir' | 'customer',
      phone: user.phone || '',
      address: user.address || '',
      isActive: user.isActive,
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    console.log('Deleting user with ID:', id);
    console.log('ID length:', id.length);
    console.log('ID chars:', id.split('').map(c => c.charCodeAt(0)));
    
    if (!confirm('Yakin ingin menghapus user ini?')) return;

    try {
      const cleanId = id.trim();
      console.log('Clean ID:', cleanId, 'Length:', cleanId.length);
      
      const response = await fetch(`/api/admin/users/${cleanId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || 'Failed to delete user'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    }
  };

  const openAddDialog = () => {
    setEditingUser(null);
    reset({
      name: '',
      email: '',
      password: '',
      role: 'customer',
      phone: '',
      address: '',
      isActive: true
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Kelola Users</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="rounded-2xl">
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
                        placeholder="Email"
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
                        placeholder="Nomor telepon"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Alamat</Label>
                      <Input
                        id="address"
                        {...register('address')}
                        className="rounded-2xl"
                        placeholder="Alamat"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded"
                        />
                      )}
                    />
                    <Label>User Aktif</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="rounded-2xl"
                    >
                      Batal
                    </Button>
                    <Button type="submit" className="rounded-2xl">
                      {editingUser ? 'Update' : 'Simpan'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
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
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="rounded-2xl"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('User object:', user);
                          console.log('User._id:', user._id);
                          handleDelete(user._id);
                        }}
                        className="rounded-2xl text-red-600 hover:text-red-700"
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
