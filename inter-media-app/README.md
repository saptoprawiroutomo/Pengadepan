# Inter Medi-A - E-Commerce & Service Center

Aplikasi web full-stack untuk e-commerce dan sistem servis perangkat printer, fotocopy, dan komputer.

## 🚀 Features

### 🛒 E-Commerce
- **Product Catalog**: Browse produk dengan kategori dan search
- **Shopping Cart**: Add/remove items dengan quantity control
- **Checkout**: Order dengan alamat pengiriman dan payment method
- **Order Tracking**: Status tracking dari pending hingga delivered

### 🏪 POS System
- **Point of Sale**: Sistem kasir untuk transaksi langsung
- **Stock Management**: Update stok otomatis dengan atomic transactions
- **Receipt Printing**: Generate PDF struk penjualan
- **Transaction History**: Riwayat transaksi POS

### 🔧 Service Management
- **Service Request**: Customer bisa request servis perangkat
- **Service Tracking**: Status tracking dari received hingga delivered
- **Cost Management**: Input biaya jasa dan sparepart
- **Invoice Generation**: Generate PDF invoice servis

### 📊 Reports & Analytics
- **Sales Report**: Laporan penjualan dengan filter tanggal
- **Service Report**: Laporan servis dengan breakdown status
- **Stock Report**: Laporan stok dengan status indicators
- **Top Products**: Laporan produk terlaris
- **PDF Export**: Export semua laporan ke PDF

### 💬 Realtime Chat
- **Customer Support**: Floating chat widget untuk customer
- **Admin Inbox**: Dashboard chat untuk admin/kasir
- **Real-time Messaging**: Socket.IO untuk komunikasi instant
- **Message Persistence**: Semua chat tersimpan di database

### 👥 User Management
- **Multi-Role System**: Admin, Kasir, Customer
- **Authentication**: NextAuth dengan credentials provider
- **Authorization**: Role-based access control (RBAC)
- **Profile Management**: Edit profile dan password

## 🛠 Tech Stack

### Frontend
- **Next.js 14+** - React framework dengan App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **React Hook Form** - Form handling dengan validation

### Backend
- **Next.js API Routes** - Server-side API
- **NextAuth** - Authentication
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time communication

### Additional Libraries
- **Zod** - Schema validation
- **bcryptjs** - Password hashing
- **react-pdf** - PDF generation
- **Lucide React** - Icons

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Git

### Setup Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd inter-media-app
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI="mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0"
NEXTAUTH_SECRET="inter-media-nextauth-secret-2024-strong-key"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
SOCKET_PORT=3001
```

4. **Seed Database**
```bash
npm run dev
# In another terminal:
curl -X POST http://localhost:3000/api/seed
```

5. **Run Development Server**
```bash
npm run dev
```

Aplikasi akan berjalan di:
- **Frontend**: http://localhost:3000
- **Socket.IO Server**: http://localhost:3001

## 🔑 Default Accounts

Setelah seed data:

### Admin
- **Email**: admin@intermedia.com
- **Password**: admin123
- **Access**: Full system access

### Kasir
- **Email**: kasir@intermedia.com  
- **Password**: kasir123
- **Access**: POS, Service management

### Customer
- Register melalui `/register`

## 📱 Usage

### Customer Flow
1. **Browse Products** - Lihat katalog produk di `/products`
2. **Add to Cart** - Tambahkan produk ke keranjang
3. **Checkout** - Proses pembelian di `/checkout`
4. **Track Orders** - Monitor status di `/orders`
5. **Request Service** - Request servis di `/service/request`
6. **Chat Support** - Gunakan floating chat widget

### Admin/Kasir Flow
1. **Login** - Masuk dengan akun admin/kasir
2. **Manage Products** - CRUD produk di `/admin/products`
3. **POS Transactions** - Transaksi kasir di `/kasir/pos`
4. **Service Management** - Kelola servis di `/admin/services`
5. **View Reports** - Lihat laporan di `/admin/reports`
6. **Chat Inbox** - Balas chat customer di `/admin/chat`

## 🗂 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── kasir/             # Kasir pages
│   └── ...                # Public pages
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   └── chat/              # Chat components
├── lib/                   # Utilities
│   ├── db.ts              # Database connection
│   ├── validations.ts     # Zod schemas
│   └── utils-server.ts    # Server utilities
├── models/                # Mongoose models
└── types/                 # TypeScript types
```

## 🔒 Security Features

- **Password Hashing**: bcrypt dengan salt rounds 12
- **JWT Tokens**: Secure session management
- **RBAC**: Role-based access control
- **Input Validation**: Zod schema validation
- **CSRF Protection**: NextAuth built-in protection
- **Atomic Transactions**: MongoDB transactions untuk data consistency

## 📊 Database Schema

### Collections
- **users** - User accounts dengan roles
- **categories** - Product categories
- **products** - Product catalog
- **carts** - Shopping carts
- **orders** - Customer orders
- **salestransactions** - POS transactions
- **servicerequests** - Service requests
- **chatrooms** - Chat rooms
- **chatmessages** - Chat messages
- **auditlogs** - System audit logs

## 🚀 Deployment

### Build Production
```bash
npm run build
npm start
```

### Environment Variables
Pastikan semua environment variables sudah diset untuk production:
- Database connection string
- NextAuth secret & URL
- Cloudinary credentials (optional)
- Socket.IO port

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Untuk bantuan dan support:
- **Email**: support@intermedia.com
- **Chat**: Gunakan floating chat widget di aplikasi
- **Issues**: Create GitHub issue untuk bug reports

---

**Inter Medi-A** - Solusi Terpercaya untuk Kebutuhan Printer & Komputer Anda
