'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@/lib/validations';
import { z } from 'zod';
import { toast } from 'sonner';

type ProductForm = z.infer<typeof productSchema>;

interface Product {
  _id: string;
  name: string;
  slug: string;
  categoryId: { _id: string; name: string };
  price: number;
  stock: number;
  weight: number; // Add weight field
  images?: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        console.error('Failed to fetch products:', response.status);
        return;
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (!response.ok) {
        console.error('Failed to fetch categories:', response.status);
        return;
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const onSubmit = async (data: ProductForm) => {
    try {
      // Convert images to base64
      const imagePromises = selectedImages.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      const imageBase64Array = await Promise.all(imagePromises);
      
      const productData = {
        ...data,
        images: imageBase64Array
      };
      
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct._id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        fetchProducts();
        handleDialogClose();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        toast.error(`Error: ${errorData.error || 'Gagal menyimpan produk'}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Terjadi kesalahan saat menyimpan produk');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    
    // Load existing images
    if (product.images && product.images.length > 0) {
      setImagePreview(product.images);
    }
    
    reset({
      name: product.name,
      categoryId: product.categoryId?._id || product.category?._id || '',
      price: product.price,
      stock: product.stock,
      weight: product.weight || 0, // Add weight field
      description: product.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    toast('Yakin ingin menghapus produk ini?', {
      action: {
        label: 'Ya',
        onClick: async () => {
          try {
            const response = await fetch(`/api/admin/products/${id}`, {
              method: 'DELETE',
            });
            
            if (response.ok) {
              fetchProducts();
              toast.success('Produk berhasil dihapus');
            } else {
              toast.error('Gagal menghapus produk');
            }
          } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Terjadi kesalahan');
          }
        }
      },
      cancel: {
        label: 'Batal',
        onClick: () => {}
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Batasi maksimal 5 gambar
    if (files.length > 5) {
      toast('Maksimal 5 gambar per produk');
      return;
    }
    
    setSelectedImages(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setSelectedImages([]);
    setImagePreview([]);
    reset();
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Produk</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Ubah informasi produk yang sudah ada' : 'Tambahkan produk baru ke katalog'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    className="rounded-2xl"
                    placeholder="Masukkan nama produk"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="categoryId">Kategori</Label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.categoryId && (
                    <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Harga</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    className="rounded-2xl"
                    placeholder="0"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="stock">Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    className="rounded-2xl"
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="weight">Berat (gram)</Label>
                  <Input
                    id="weight"
                    type="number"
                    {...register('weight', { valueAsNumber: true })}
                    className="rounded-2xl"
                    placeholder="0"
                  />
                  {errors.weight && (
                    <p className="text-sm text-destructive mt-1">{errors.weight.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  className="rounded-2xl"
                  placeholder="Deskripsi produk (opsional)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="images">Gambar Produk</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="rounded-2xl"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Pilih maksimal 5 gambar produk (JPG, PNG)
                </p>
                
                {imagePreview.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {imagePreview.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="rounded-2xl">
                  {editingProduct ? 'Update' : 'Simpan'}
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
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Berat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categoryId?.name || product.category?.name || 'Uncategorized'}</TableCell>
                  <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.weight || 0}g</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="rounded-2xl"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
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
