import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  stock: z.number().min(0, 'Stok tidak boleh negatif'),
  weight: z.number().min(0, 'Berat tidak boleh negatif'),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
});

export const serviceRequestSchema = z.object({
  deviceType: z.enum(['printer', 'fotocopy', 'komputer', 'lainnya']),
  complaint: z.string().min(10, 'Keluhan minimal 10 karakter'),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 karakter'),
  images: z.array(z.string()).optional(),
});
