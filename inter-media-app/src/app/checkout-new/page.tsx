'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Package, CreditCard } from 'lucide-react';

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    weight: number;
    images: string[];
  };
  qty: number;
  priceSnapshot: number;
}

interface ShippingOption {
  courier: string;
  service: string;
  cost: number;
  estimatedDays: string;
  description: string;
  type: string;
  recommended?: boolean;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    receiverName: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    postalCode: '',
    fullAddress: '',
    addressLabel: 'Rumah'
  });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [useKtpAddress, setUseKtpAddress] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [paymentInfo, setPaymentInfo] = useState<any[]>([]);
  const [shippingInfo, setShippingInfo] = useState<any>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingCache, setShippingCache] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    // Suppress extension-related errors
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.toString().includes('message channel closed')) return;
      originalError.apply(console, args);
    };

    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    fetchCart();
    fetchPaymentInfo();
    fetchAddresses();

    return () => {
      console.error = originalError;
    };
  }, [session, status, router]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
        
        // Auto select default address or KTP address
        const defaultAddress = data.addresses?.find((addr: any) => addr.isDefault);
        if (defaultAddress) {
          fillAddressForm(defaultAddress);
          // Trigger shipping calculation after address is filled
          setTimeout(() => {
            if (cart.length > 0 && defaultAddress.city) {
              debouncedCalculateShipping(cart);
            }
          }, 500);
        } else if ((session?.user as any)?.address) {
          // Use KTP address as fallback
          setUseKtpAddress(true);
          fillKtpAddress();
          // Trigger shipping calculation for KTP address
          setTimeout(() => {
            if (cart.length > 0) {
              debouncedCalculateShipping(cart);
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Set default values if fetch fails
      setAddresses([]);
    }
  };

  const fillAddressForm = (address: any) => {
    setShippingAddress({
      receiverName: address.receiverName || '',
      phone: address.phone || '',
      province: address.province || '',
      city: address.city || '',
      district: address.district || '',
      postalCode: address.postalCode || '',
      fullAddress: address.fullAddress || '',
      addressLabel: address.label || 'Rumah'
    });
    setSelectedCity(address.city || '');
  };

  const fillKtpAddress = () => {
    try {
      if (session?.user) {
        setShippingAddress({
          receiverName: session.user.name || '',
          phone: (session.user as any)?.phone || '',
          province: 'DKI Jakarta',
          city: 'Jakarta Pusat',
          district: '',
          postalCode: '',
          fullAddress: (session.user as any)?.address || '',
          addressLabel: 'KTP'
        });
        setSelectedCity('Jakarta Pusat');
      }
    } catch (error) {
      console.error('Error filling KTP address:', error);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data.items || []);
        
        if (data.items?.length > 0) {
          // Hanya hitung ongkir jika kota sudah dipilih
          if (selectedCity && cart.length > 0) {
            console.log('Auto-triggering shipping calculation on cart load');
            debouncedCalculateShipping(data.items);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentInfo = async () => {
    try {
      const response = await fetch('/api/payment-info');
      if (response.ok) {
        const data = await response.json();
        setPaymentInfo(data.paymentInfo || []);
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
    }
  };

  const calculateShipping = useCallback(async (cartItems: CartItem[]) => {
    console.log('calculateShipping called with:', { selectedCity, cartItemsLength: cartItems.length });
    
    if (!selectedCity) {
      console.log('No city selected, skipping calculation');
      return;
    }
    
    const totalWeight = cartItems.reduce((sum, item) => 
      sum + ((item.productId.weight || 1000) * item.qty), 0
    );
    
    console.log('Calculated total weight:', totalWeight);
    
    // Check cache first
    const cacheKey = `${selectedCity}-${totalWeight}`;
    if (shippingCache.has(cacheKey)) {
      console.log('Using cached result for:', cacheKey);
      const cached = shippingCache.get(cacheKey);
      setShippingOptions(cached.shippingOptions || []);
      setShippingInfo(cached);
      const recommended = cached.shippingOptions?.find((opt: ShippingOption) => opt.recommended);
      const selected = recommended || cached.shippingOptions?.[0];
      if (selected) {
        setSelectedShipping(selected);
      }
      return;
    }
    
    console.log('Making API call for shipping calculation...');
    setIsCalculatingShipping(true);
    
    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          totalWeight,
          destination: selectedCity 
        })
      });

      console.log('API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        
        // Cache the result
        setShippingCache(prev => new Map(prev.set(cacheKey, data)));
        
        setShippingOptions(data.shippingOptions || []);
        setShippingInfo(data);
        
        // Auto select recommended or cheapest option
        const recommended = data.shippingOptions?.find((opt: ShippingOption) => opt.recommended);
        const selected = recommended || data.shippingOptions?.[0];
        if (selected) {
          setSelectedShipping(selected);
          console.log('Auto-selected shipping:', selected.courier);
        }
      } else {
        console.error('Shipping calculation failed with status:', response.status);
        setShippingOptions([]);
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      setShippingOptions([]);
    } finally {
      setIsCalculatingShipping(false);
      console.log('Shipping calculation completed');
    }
  }, [selectedCity, shippingCache]);

  // Debounced shipping calculation
  const debouncedCalculateShipping = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (cartItems: CartItem[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => calculateShipping(cartItems), 300);
      };
    })(),
    [calculateShipping]
  );

  const subtotal = cart.reduce((sum, item) => sum + (item.priceSnapshot * item.qty), 0);
  const shippingCost = selectedShipping?.cost || 0;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShipping || !selectedCity) {
      alert('Lengkapi data pengiriman');
      return;
    }

    const fullShippingAddress = `${shippingAddress.receiverName} - ${shippingAddress.phone}\n${shippingAddress.fullAddress}\n${shippingAddress.district}, ${shippingAddress.city}, ${shippingAddress.province} ${shippingAddress.postalCode}`;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: fullShippingAddress,
          shippingCourier: selectedShipping.courier,
          shippingService: selectedShipping.service,
          shippingEstimate: selectedShipping.estimatedDays,
          shippingCost: selectedShipping.cost,
          paymentMethod: paymentMethod
        })
      });

      if (response.ok) {
        router.push(`/orders`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (status === 'loading' || isLoading) return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ringkasan Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.map((item) => (
              <div key={item.productId._id} className="flex justify-between py-2 border-b">
                <div>
                  <p className="font-medium">{item.productId.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.qty} x Rp {item.priceSnapshot.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Berat: {item.productId.weight || 1000}g
                  </p>
                </div>
                <p className="font-medium">
                  Rp {(item.priceSnapshot * item.qty).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkir:</span>
                <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Address Selection */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Pilih Alamat Pengiriman</h4>
                
                {/* Saved Addresses */}
                {addresses.length > 0 && (
                  <div className="space-y-2">
                    <Label>Alamat Tersimpan</Label>
                    {addresses.map((address) => (
                      <div 
                        key={address._id} 
                        className={`p-3 border rounded-lg cursor-pointer ${
                          !useKtpAddress && shippingAddress.receiverName === address.receiverName ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setUseKtpAddress(false);
                          fillAddressForm(address);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{address.receiverName} - {address.phone}</p>
                            <p className="text-sm text-muted-foreground">{address.fullAddress}</p>
                            <p className="text-sm text-muted-foreground">
                              {address.district}, {address.city}, {address.province}
                            </p>
                          </div>
                          {address.isDefault && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* KTP Address Option */}
                {(session?.user as any)?.address && (
                  <div className="space-y-2">
                    <Label>Alamat KTP</Label>
                    <div 
                      className={`p-3 border rounded-lg cursor-pointer ${
                        useKtpAddress ? 'border-green-500 bg-green-50' : ''
                      }`}
                      onClick={() => {
                        setUseKtpAddress(true);
                        fillKtpAddress();
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{session.user.name} - {(session.user as any).phone || 'No phone'}</p>
                          <p className="text-sm text-muted-foreground">{(session.user as any).address}</p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          KTP
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Address Input */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">
                  {useKtpAddress ? 'Alamat KTP (dapat diedit)' : 'Detail Alamat Pengiriman'}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receiverName">Nama Penerima</Label>
                    <Input
                      id="receiverName"
                      value={shippingAddress.receiverName}
                      onChange={(e) => setShippingAddress({...shippingAddress, receiverName: e.target.value})}
                      placeholder="Nama lengkap penerima"
                      required
                      className="rounded-2xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      placeholder="08xxxxxxxxxx"
                      required
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div>
                  <Label>Label Alamat</Label>
                  <div className="flex gap-2 mt-2">
                    {['Rumah', 'Kantor', 'Lainnya'].map((label) => (
                      <Button
                        key={label}
                        type="button"
                        variant={shippingAddress.addressLabel === label ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShippingAddress({...shippingAddress, addressLabel: label})}
                        className="rounded-2xl"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Alamat Pengiriman</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="province">Provinsi</Label>
                    <Select 
                      value={shippingAddress.province || ''} 
                      onValueChange={(value) => 
                        setShippingAddress({...shippingAddress, province: value})
                      }
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Pilih provinsi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
                        <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                        <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                        <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                        <SelectItem value="Sumatera Utara">Sumatera Utara</SelectItem>
                        <SelectItem value="Sumatera Selatan">Sumatera Selatan</SelectItem>
                        <SelectItem value="Sulawesi Selatan">Sulawesi Selatan</SelectItem>
                        <SelectItem value="Kalimantan Timur">Kalimantan Timur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="city">Kota/Kabupaten</Label>
                    <Select 
                      value={selectedCity || ''} 
                      onValueChange={(value) => {
                        console.log('City selected:', value);
                        setSelectedCity(value);
                        setShippingAddress({...shippingAddress, city: value});
                        if (cart.length > 0 && value) {
                          // Use the value directly instead of selectedCity state
                          setTimeout(() => {
                            const totalWeight = cart.reduce((sum, item) => 
                              sum + ((item.productId.weight || 1000) * item.qty), 0
                            );
                            
                            const cacheKey = `${value}-${totalWeight}`;
                            if (shippingCache.has(cacheKey)) {
                              console.log('Using cached result for:', cacheKey);
                              const cached = shippingCache.get(cacheKey);
                              setShippingOptions(cached.shippingOptions || []);
                              setShippingInfo(cached);
                              const recommended = cached.shippingOptions?.find((opt: ShippingOption) => opt.recommended);
                              const selected = recommended || cached.shippingOptions?.[0];
                              if (selected) {
                                setSelectedShipping(selected);
                              }
                            } else {
                              debouncedCalculateShipping(cart);
                            }
                          }, 100);
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Pilih kota" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jakarta Pusat">Jakarta Pusat</SelectItem>
                        <SelectItem value="Jakarta Utara">Jakarta Utara</SelectItem>
                        <SelectItem value="Jakarta Selatan">Jakarta Selatan</SelectItem>
                        <SelectItem value="Jakarta Barat">Jakarta Barat</SelectItem>
                        <SelectItem value="Jakarta Timur">Jakarta Timur</SelectItem>
                        <SelectItem value="Bogor">Bogor</SelectItem>
                        <SelectItem value="Depok">Depok</SelectItem>
                        <SelectItem value="Tangerang">Tangerang</SelectItem>
                        <SelectItem value="Bekasi">Bekasi</SelectItem>
                        <SelectItem value="Bandung">Bandung</SelectItem>
                        <SelectItem value="Cirebon">Cirebon</SelectItem>
                        <SelectItem value="Sukabumi">Sukabumi</SelectItem>
                        <SelectItem value="Surabaya">Surabaya</SelectItem>
                        <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                        <SelectItem value="Semarang">Semarang</SelectItem>
                        <SelectItem value="Malang">Malang</SelectItem>
                        <SelectItem value="Medan">Medan</SelectItem>
                        <SelectItem value="Palembang">Palembang</SelectItem>
                        <SelectItem value="Makassar">Makassar</SelectItem>
                        <SelectItem value="Balikpapan">Balikpapan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="district">Kecamatan</Label>
                    <Input
                      id="district"
                      value={shippingAddress.district}
                      onChange={(e) => setShippingAddress({...shippingAddress, district: e.target.value})}
                      placeholder="Nama kecamatan"
                      required
                      className="rounded-2xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Kode Pos</Label>
                    <Input
                      id="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                      placeholder="12345"
                      required
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fullAddress">Alamat Lengkap</Label>
                  <Textarea
                    id="fullAddress"
                    value={shippingAddress.fullAddress}
                    onChange={(e) => setShippingAddress({...shippingAddress, fullAddress: e.target.value})}
                    placeholder="Nama jalan, nomor rumah, RT/RW, patokan, dll"
                    required
                    className="rounded-2xl"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contoh: Jl. Sudirman No. 123, RT 01/RW 05, dekat Indomaret
                  </p>
                </div>
              </div>

              {/* Shipping Options */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Truck className="h-4 w-4" />
                  Pilih Ekspedisi
                </Label>
                
                {/* Weight and Distance Info */}
                {shippingInfo && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-4 text-sm">
                      <span>📦 Total Berat: <strong>{shippingInfo.weightInKg}kg</strong></span>
                      <span>📍 Jarak: <strong>{shippingInfo.distance}km</strong></span>
                      <span>🎯 Zona: <strong>{shippingInfo.zone}</strong></span>
                      {shippingCache.has(`${selectedCity}-${cart.reduce((sum, item) => sum + ((item.productId.weight || 1000) * item.qty), 0)}`) && (
                        <span className="text-green-600">⚡ Cached</span>
                      )}
                    </div>
                    {shippingInfo.recommendations?.heavyItem && (
                      <div className="mt-2 p-2 bg-orange-100 rounded text-sm text-orange-800">
                        ⚠️ {shippingInfo.recommendations.heavyItem}
                      </div>
                    )}
                  </div>
                )}
                
                {isCalculatingShipping ? (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Menghitung ongkir...
                    </div>
                  </div>
                ) : !selectedCity ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Pilih kota tujuan untuk melihat opsi pengiriman
                  </div>
                ) : shippingOptions.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-muted-foreground mb-2">
                      Tidak ada opsi pengiriman tersedia
                    </div>
                    {selectedCity && cart.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          console.log('Manual refresh shipping options');
                          debouncedCalculateShipping(cart);
                        }}
                      >
                        Refresh Opsi Pengiriman
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <RadioGroup 
                      value={selectedShipping?.courier || ''} 
                      onValueChange={(value) => {
                        console.log('Shipping selected:', value);
                        const option = shippingOptions.find(opt => opt.courier === value);
                        setSelectedShipping(option || null);
                      }}
                      className="space-y-3"
                    >
                      {shippingOptions.map((option) => (
                        <div 
                          key={option.courier} 
                          className={`relative border rounded-xl p-4 transition-all hover:shadow-sm ${
                            selectedShipping?.courier === option.courier 
                              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                              : 'border-gray-200 hover:border-gray-300'
                          } ${
                            option.type === 'kurir-toko' 
                              ? 'border-green-300 bg-green-50' 
                              : option.type === 'gosend'
                              ? 'border-orange-300 bg-orange-50'
                              : option.type === 'kargo'
                              ? 'border-purple-300 bg-purple-50'
                              : ''
                          } ${
                            option.recommended ? 'ring-2 ring-yellow-400' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem 
                              value={option.courier} 
                              id={option.courier}
                              className="mt-1"
                            />
                            <Label htmlFor={option.courier} className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">
                                      {option.courier}
                                    </h4>
                                    {option.type === 'kurir-toko' && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        🚲 Kurir Toko
                                      </span>
                                    )}
                                    {option.type === 'kargo' && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        🚛 Kargo
                                      </span>
                                    )}
                                    {option.type === 'gosend' && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        🏍️ GoSend
                                      </span>
                                    )}
                                    {option.recommended && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        ⭐ Disarankan
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    Estimasi: {option.estimatedDays} hari
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {option.description}
                                  </p>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-lg font-bold text-gray-900">
                                    Rp {option.cost.toLocaleString('id-ID')}
                                  </p>
                                  {option.type === 'kurir-toko' && (
                                    <p className="text-xs text-green-600 font-medium">
                                      Hemat & Cepat
                                    </p>
                                  )}
                                  {option.type === 'gosend' && (
                                    <p className="text-xs text-orange-600 font-medium">
                                      Super Cepat
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                    
                    {/* Shipping Info */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="text-blue-500 mt-0.5">ℹ️</div>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Informasi Pengiriman:</p>
                          <ul className="text-xs space-y-1">
                            <li>• Kurir Toko: Pengiriman same day untuk area Jakarta & 1 hari untuk Jabodetabek</li>
                            <li>• GoSend: Pengiriman super cepat 1-12 jam khusus Jabodetabek (max 20kg)</li>
                            <li>• Ekspedisi: Estimasi waktu dapat berubah tergantung kondisi</li>
                            <li>• Barang akan dikemas dengan aman dan rapi</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4" />
                  Metode Pembayaran
                </Label>
                
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Transfer Bank</p>
                          <p className="text-sm text-muted-foreground">
                            Transfer ke rekening toko, upload bukti pembayaran
                          </p>
                        </div>
                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Populer
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="ovo" id="ovo" />
                    <Label htmlFor="ovo" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">OVO</p>
                          <p className="text-sm text-muted-foreground">
                            Transfer ke nomor HP OVO toko
                          </p>
                        </div>
                        <div className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          Cepat
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="dana" id="dana" />
                    <Label htmlFor="dana" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">DANA</p>
                          <p className="text-sm text-muted-foreground">
                            Transfer ke nomor HP DANA toko
                          </p>
                        </div>
                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Cepat
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
                    selectedShipping?.type !== 'kurir-toko' ? 'opacity-50' : ''
                  }`}>
                    <RadioGroupItem 
                      value="cod" 
                      id="cod" 
                      disabled={selectedShipping?.type !== 'kurir-toko'}
                    />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Bayar di Tempat (COD)</p>
                          <p className="text-sm text-muted-foreground">
                            Bayar saat barang sampai (khusus kurir toko)
                          </p>
                        </div>
                        {selectedShipping?.type !== 'kurir-toko' && (
                          <div className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                            Tidak tersedia
                          </div>
                        )}
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Payment Info Preview */}
                {paymentMethod === 'transfer' && paymentInfo.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg mt-3">
                    <h4 className="font-medium text-sm mb-2">Rekening Tujuan Transfer:</h4>
                    {paymentInfo.filter(info => info.type === 'bank_transfer').slice(0, 1).map((info, index) => (
                      <div key={index} className="text-sm">
                        <p><strong>{info.bankName}</strong> - {info.accountNumber}</p>
                        <p>A.n: {info.accountName}</p>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-2">
                      Detail lengkap akan ditampilkan setelah checkout
                    </p>
                  </div>
                )}

                {(paymentMethod === 'ovo' || paymentMethod === 'dana') && paymentInfo.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg mt-3">
                    <h4 className="font-medium text-sm mb-2">Transfer {paymentMethod.toUpperCase()} ke:</h4>
                    {paymentInfo.filter(info => info.type === paymentMethod).slice(0, 1).map((info, index) => (
                      <div key={index} className="text-sm">
                        <p><strong>{info.phoneNumber}</strong></p>
                        <p>A.n: Toko Inter Media</p>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-2">
                      Detail lengkap akan ditampilkan setelah checkout
                    </p>
                  </div>
                )}

                {paymentMethod === 'cod' && selectedShipping?.type !== 'kurir-toko' && (
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mt-3">
                    <p className="text-sm text-orange-700">
                      COD hanya tersedia untuk pengiriman dengan Kurir Toko. 
                      Silakan pilih kurir toko atau ubah ke Transfer Bank.
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              {paymentMethod === 'transfer' && paymentInfo.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Informasi Pembayaran</h4>
                  {paymentInfo.filter(info => info.type === 'bank_transfer').map((info, index) => (
                    <div key={index} className="text-sm mb-2 last:mb-0">
                      <p><strong>{info.bankName}</strong></p>
                      <p>No. Rek: {info.accountNumber}</p>
                      <p>A.n: {info.accountName}</p>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2">
                    Setelah checkout, transfer sesuai total pembayaran dan upload bukti transfer
                  </p>
                </div>
              )}

              {(paymentMethod === 'ovo' || paymentMethod === 'dana') && paymentInfo.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Informasi Pembayaran {paymentMethod.toUpperCase()}</h4>
                  {paymentInfo.filter(info => info.type === paymentMethod).map((info, index) => (
                    <div key={index} className="text-sm mb-2 last:mb-0">
                      <p><strong>Transfer {paymentMethod.toUpperCase()} ke:</strong></p>
                      <p className="font-mono text-lg">{info.phoneNumber}</p>
                      <p>A.n: Toko Inter Media</p>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2">
                    Setelah checkout, transfer sesuai total pembayaran ke nomor {paymentMethod.toUpperCase()} di atas
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full rounded-2xl"
                disabled={!selectedShipping || !selectedCity || !shippingAddress.receiverName || !shippingAddress.phone || !shippingAddress.fullAddress || (paymentMethod === 'cod' && selectedShipping?.type !== 'kurir-toko')}
              >
                Buat Pesanan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
