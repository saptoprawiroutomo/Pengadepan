'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Plus, Edit, Trash2, Star } from 'lucide-react';

interface Address {
  _id: string;
  label: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    birthDate: '',
    gender: '',
    idNumber: '',
    address: ''
  });
  const [addressForm, setAddressForm] = useState({
    label: 'Rumah',
    receiverName: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    postalCode: '',
    fullAddress: '',
    isDefault: false
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    // Initialize profile form with session data
    setProfileForm({
      name: session.user?.name || '',
      phone: (session.user as any)?.phone || '',
      birthDate: (session.user as any)?.birthDate || '',
      gender: (session.user as any)?.gender || '',
      idNumber: (session.user as any)?.idNumber || '',
      address: (session.user as any)?.address || ''
    });
    
    fetchAddresses();
  }, [session, status, router]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        alert('Profile berhasil diupdate');
        setIsProfileDialogOpen(false);
        // Refresh session or page
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingAddress ? `/api/addresses/${editingAddress._id}` : '/api/addresses';
      const method = editingAddress ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm)
      });

      if (response.ok) {
        fetchAddresses();
        setIsAddressDialogOpen(false);
        setEditingAddress(null);
        setAddressForm({
          label: 'Rumah',
          receiverName: '',
          phone: '',
          province: '',
          city: '',
          district: '',
          postalCode: '',
          fullAddress: '',
          isDefault: false
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true })
      });

      if (response.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Hapus alamat ini?')) {
      try {
        const response = await fetch(`/api/addresses/${addressId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchAddresses();
        }
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label,
      receiverName: address.receiverName,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      postalCode: address.postalCode,
      fullAddress: address.fullAddress,
      isDefault: address.isDefault
    });
    setIsAddressDialogOpen(true);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Profile Saya</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Informasi Profile
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Alamat Saya
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informasi Profile</CardTitle>
              <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-2xl">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Informasi Profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nama Lengkap (sesuai KTP)</Label>
                        <Input
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                          required
                          className="rounded-2xl"
                          placeholder="Nama lengkap sesuai KTP"
                        />
                      </div>
                      <div>
                        <Label>Nomor Telepon</Label>
                        <Input
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          className="rounded-2xl"
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tanggal Lahir</Label>
                        <Input
                          type="date"
                          value={profileForm.birthDate}
                          onChange={(e) => setProfileForm({...profileForm, birthDate: e.target.value})}
                          className="rounded-2xl"
                        />
                      </div>
                      <div>
                        <Label>Jenis Kelamin</Label>
                        <Select value={profileForm.gender} onValueChange={(value) => 
                          setProfileForm({...profileForm, gender: value})
                        }>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue placeholder="Pilih jenis kelamin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Nomor KTP/NIK</Label>
                      <Input
                        value={profileForm.idNumber}
                        onChange={(e) => setProfileForm({...profileForm, idNumber: e.target.value})}
                        className="rounded-2xl"
                        placeholder="16 digit nomor KTP"
                        maxLength={16}
                      />
                    </div>

                    <div>
                      <Label>Alamat KTP</Label>
                      <Textarea
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                        className="rounded-2xl"
                        placeholder="Alamat lengkap sesuai KTP"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="rounded-2xl">
                        Simpan Perubahan
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsProfileDialogOpen(false)}
                        className="rounded-2xl"
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input value={session.user?.name || '-'} disabled className="rounded-2xl" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={session.user?.email || '-'} disabled className="rounded-2xl" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nomor Telepon</Label>
                  <Input value={(session.user as any)?.phone || '-'} disabled className="rounded-2xl" />
                </div>
                <div>
                  <Label>Tanggal Lahir</Label>
                  <Input 
                    value={(session.user as any)?.birthDate ? 
                      new Date((session.user as any).birthDate).toLocaleDateString('id-ID') : '-'
                    } 
                    disabled 
                    className="rounded-2xl" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Jenis Kelamin</Label>
                  <Input value={(session.user as any)?.gender || '-'} disabled className="rounded-2xl" />
                </div>
                <div>
                  <Label>Nomor KTP/NIK</Label>
                  <Input 
                    value={(session.user as any)?.idNumber ? 
                      (session.user as any).idNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4') : '-'
                    } 
                    disabled 
                    className="rounded-2xl" 
                  />
                </div>
              </div>

              <div>
                <Label>Alamat KTP</Label>
                <Textarea 
                  value={(session.user as any)?.address || '-'} 
                  disabled 
                  className="rounded-2xl" 
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Role/Tipe Akun</Label>
                  <Input 
                    value={
                      session.user?.role === 'admin' ? 'Administrator' :
                      session.user?.role === 'kasir' ? 'Kasir' :
                      session.user?.role === 'customer' ? 'Pelanggan' :
                      session.user?.role || ''
                    } 
                    disabled 
                    className="rounded-2xl" 
                  />
                </div>
                <div>
                  <Label>Status Akun</Label>
                  <Input value="Aktif" disabled className="rounded-2xl" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">ℹ️ Informasi Penting</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Pastikan data sesuai dengan KTP untuk verifikasi identitas</li>
                  <li>• Data ini digunakan untuk pengiriman dan keperluan administrasi</li>
                  <li>• Email tidak dapat diubah, hubungi CS jika perlu mengubah email</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Alamat Pengiriman</h2>
              <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Alamat
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nama Penerima</Label>
                        <Input
                          value={addressForm.receiverName}
                          onChange={(e) => setAddressForm({...addressForm, receiverName: e.target.value})}
                          required
                          className="rounded-2xl"
                        />
                      </div>
                      <div>
                        <Label>Nomor Telepon</Label>
                        <Input
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                          required
                          className="rounded-2xl"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Label Alamat</Label>
                      <Select value={addressForm.label} onValueChange={(value) => 
                        setAddressForm({...addressForm, label: value})
                      }>
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Rumah">Rumah</SelectItem>
                          <SelectItem value="Kantor">Kantor</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Provinsi</Label>
                        <Select value={addressForm.province} onValueChange={(value) => 
                          setAddressForm({...addressForm, province: value, city: ''}) // Reset city when province changes
                        }>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue placeholder="Pilih provinsi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
                            <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                            <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                            <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                            <SelectItem value="Banten">Banten</SelectItem>
                            <SelectItem value="Yogyakarta">D.I. Yogyakarta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Kota</Label>
                        <Select 
                          value={addressForm.city} 
                          onValueChange={(value) => setAddressForm({...addressForm, city: value})}
                          disabled={!addressForm.province}
                        >
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue placeholder={addressForm.province ? "Pilih kota" : "Pilih provinsi dulu"} />
                          </SelectTrigger>
                          <SelectContent>
                            {/* DKI Jakarta */}
                            {addressForm.province === 'DKI Jakarta' && (
                              <>
                                <SelectItem value="Jakarta Pusat">Jakarta Pusat</SelectItem>
                                <SelectItem value="Jakarta Utara">Jakarta Utara</SelectItem>
                                <SelectItem value="Jakarta Selatan">Jakarta Selatan</SelectItem>
                                <SelectItem value="Jakarta Barat">Jakarta Barat</SelectItem>
                                <SelectItem value="Jakarta Timur">Jakarta Timur</SelectItem>
                                <SelectItem value="Kepulauan Seribu">Kepulauan Seribu</SelectItem>
                              </>
                            )}
                            
                            {/* Jawa Barat */}
                            {addressForm.province === 'Jawa Barat' && (
                              <>
                                <SelectItem value="Bandung">Bandung</SelectItem>
                                <SelectItem value="Bekasi">Bekasi</SelectItem>
                                <SelectItem value="Bogor">Bogor</SelectItem>
                                <SelectItem value="Depok">Depok</SelectItem>
                                <SelectItem value="Cimahi">Cimahi</SelectItem>
                                <SelectItem value="Tasikmalaya">Tasikmalaya</SelectItem>
                                <SelectItem value="Banjar">Banjar</SelectItem>
                                <SelectItem value="Sukabumi">Sukabumi</SelectItem>
                                <SelectItem value="Cirebon">Cirebon</SelectItem>
                              </>
                            )}
                            
                            {/* Jawa Tengah */}
                            {addressForm.province === 'Jawa Tengah' && (
                              <>
                                <SelectItem value="Semarang">Semarang</SelectItem>
                                <SelectItem value="Solo">Surakarta</SelectItem>
                                <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                                <SelectItem value="Magelang">Magelang</SelectItem>
                                <SelectItem value="Salatiga">Salatiga</SelectItem>
                                <SelectItem value="Pekalongan">Pekalongan</SelectItem>
                                <SelectItem value="Tegal">Tegal</SelectItem>
                              </>
                            )}
                            
                            {/* Jawa Timur */}
                            {addressForm.province === 'Jawa Timur' && (
                              <>
                                <SelectItem value="Surabaya">Surabaya</SelectItem>
                                <SelectItem value="Malang">Malang</SelectItem>
                                <SelectItem value="Batu">Batu</SelectItem>
                                <SelectItem value="Blitar">Blitar</SelectItem>
                                <SelectItem value="Kediri">Kediri</SelectItem>
                                <SelectItem value="Madiun">Madiun</SelectItem>
                                <SelectItem value="Mojokerto">Mojokerto</SelectItem>
                                <SelectItem value="Pasuruan">Pasuruan</SelectItem>
                                <SelectItem value="Probolinggo">Probolinggo</SelectItem>
                              </>
                            )}
                            
                            {/* Banten */}
                            {addressForm.province === 'Banten' && (
                              <>
                                <SelectItem value="Tangerang">Tangerang</SelectItem>
                                <SelectItem value="Tangerang Selatan">Tangerang Selatan</SelectItem>
                                <SelectItem value="Serang">Serang</SelectItem>
                                <SelectItem value="Cilegon">Cilegon</SelectItem>
                              </>
                            )}
                            
                            {/* Yogyakarta */}
                            {addressForm.province === 'Yogyakarta' && (
                              <>
                                <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                                <SelectItem value="Bantul">Bantul</SelectItem>
                                <SelectItem value="Sleman">Sleman</SelectItem>
                                <SelectItem value="Kulon Progo">Kulon Progo</SelectItem>
                                <SelectItem value="Gunung Kidul">Gunung Kidul</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Kecamatan</Label>
                        <Input
                          value={addressForm.district}
                          onChange={(e) => setAddressForm({...addressForm, district: e.target.value})}
                          required
                          className="rounded-2xl"
                        />
                      </div>
                      <div>
                        <Label>Kode Pos</Label>
                        <Input
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                          required
                          className="rounded-2xl"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Alamat Lengkap</Label>
                      <Textarea
                        value={addressForm.fullAddress}
                        onChange={(e) => setAddressForm({...addressForm, fullAddress: e.target.value})}
                        required
                        className="rounded-2xl"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                      />
                      <Label htmlFor="isDefault">Jadikan alamat utama</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="rounded-2xl">
                        {editingAddress ? 'Update' : 'Simpan'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddressDialogOpen(false)}
                        className="rounded-2xl"
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {addresses.map((address) => (
                <Card key={address._id} className={address.isDefault ? 'border-blue-500' : ''}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={address.isDefault ? 'default' : 'secondary'}>
                            {address.label}
                          </Badge>
                          {address.isDefault && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              <Star className="h-3 w-3 mr-1" />
                              Utama
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{address.receiverName} - {address.phone}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.fullAddress}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.district}, {address.city}, {address.province} {address.postalCode}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAddress(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!address.isDefault && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetDefault(address._id)}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAddress(address._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
