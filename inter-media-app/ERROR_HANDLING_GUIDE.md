# 🚨 ERROR HANDLING & TROUBLESHOOTING GUIDE
## Inter Media E-commerce Application

**Dokumentasi Lengkap Error dan Solusinya**

---

## 📊 **KATEGORI ERROR**

### 🔐 **1. AUTHENTICATION & AUTHORIZATION ERRORS**

#### **Error 401 - Unauthorized**
```json
{ "error": "Unauthorized", "status": 401 }
```

**Penyebab:**
- Session expired atau tidak valid
- User belum login
- Token JWT rusak/expired

**Solusi:**
```typescript
// Frontend handling
if (response.status === 401) {
  // Redirect ke login
  window.location.href = '/login';
  // Atau refresh session
  await signIn();
}
```

**Pencegahan:**
- Implement auto-refresh token
- Session timeout warning
- Proper logout handling

---

#### **Error 403 - Forbidden (Role Access)**
```json
{ "error": "Access denied. Admin role required", "status": 403 }
```

**Penyebab:**
- User role tidak sesuai (customer akses admin area)
- Permission tidak mencukupi

**Solusi:**
```typescript
// Role-based redirect
if (session?.user?.role !== 'admin') {
  router.push('/dashboard'); // Redirect ke area yang sesuai
}
```

---

### 🗄️ **2. DATABASE ERRORS**

#### **MongoDB Connection Error**
```
Error: Please define the MONGODB_URI environment variable
```

**Penyebab:**
- Environment variable tidak diset
- Connection string salah
- Network issue ke MongoDB Atlas

**Solusi:**
```bash
# Check environment variables
echo $MONGODB_URI

# Set proper connection string
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/db"
```

**Monitoring:**
```typescript
// Add connection monitoring
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
```

---

#### **Document Not Found (404)**
```json
{ "error": "Produk tidak ditemukan", "status": 404 }
```

**Penyebab:**
- ID tidak valid atau tidak ada
- Data sudah dihapus
- Query parameter salah

**Solusi:**
```typescript
// Proper ID validation
if (!mongoose.Types.ObjectId.isValid(id)) {
  return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
}

const product = await Product.findById(id);
if (!product) {
  return NextResponse.json({ error: 'Product not found' }, { status: 404 });
}
```

---

#### **Duplicate Key Error (11000)**
```
E11000 duplicate key error collection
```

**Penyebab:**
- Unique constraint violation
- Email/username sudah ada

**Solusi:**
```typescript
try {
  await User.create(userData);
} catch (error) {
  if (error.code === 11000) {
    return NextResponse.json({ 
      error: 'Email sudah terdaftar' 
    }, { status: 409 });
  }
  throw error;
}
```

---

### 🛒 **3. BUSINESS LOGIC ERRORS**

#### **Stock Insufficient Error**
```json
{ "error": "Stok Printer Canon tidak mencukupi. Tersedia: 5", "status": 400 }
```

**Penyebab:**
- Quantity melebihi stock available
- Concurrent transactions
- Stock tidak ter-update

**Solusi:**
```typescript
// Atomic stock update
const session = await mongoose.startSession();
try {
  await session.withTransaction(async () => {
    const product = await Product.findById(productId).session(session);
    
    if (product.stock < quantity) {
      throw new Error(`Stok tidak mencukupi. Tersedia: ${product.stock}`);
    }
    
    await Product.findByIdAndUpdate(
      productId, 
      { $inc: { stock: -quantity } },
      { session }
    );
  });
} finally {
  await session.endSession();
}
```

---

#### **Payment Processing Error**
```json
{ "error": "Payment gateway timeout", "status": 408 }
```

**Penyebab:**
- Midtrans/payment gateway down
- Network timeout
- Invalid payment data

**Solusi:**
```typescript
// Retry mechanism
const maxRetries = 3;
let attempt = 0;

while (attempt < maxRetries) {
  try {
    const result = await processPayment(paymentData);
    return result;
  } catch (error) {
    attempt++;
    if (attempt === maxRetries) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
  }
}
```

---

### 📡 **4. API & NETWORK ERRORS**

#### **Rate Limit Exceeded (429)**
```json
{ "error": "Too many requests", "status": 429 }
```

**Penyebab:**
- Terlalu banyak request dalam waktu singkat
- Bot/spam attack

**Solusi:**
```typescript
// Client-side rate limiting
const rateLimiter = {
  requests: [],
  isAllowed() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < 60000);
    
    if (this.requests.length >= 10) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
};
```

---

#### **CORS Error**
```
Access to fetch blocked by CORS policy
```

**Penyebab:**
- Domain tidak diizinkan
- Headers tidak sesuai
- Preflight request gagal

**Solusi:**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
};
```

---

### 🎨 **5. FRONTEND ERRORS**

#### **Hydration Mismatch**
```
Warning: Text content did not match. Server: "0" Client: "5"
```

**Penyebab:**
- Server dan client render berbeda
- Dynamic content tanpa proper handling

**Solusi:**
```typescript
// Use useEffect for client-only content
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
```

---

#### **Memory Leak Warning**
```
Warning: Can't perform a React state update on an unmounted component
```

**Penyebab:**
- setState dipanggil setelah component unmount
- Async operation tidak di-cleanup

**Solusi:**
```typescript
useEffect(() => {
  let isMounted = true;
  
  fetchData().then(data => {
    if (isMounted) {
      setData(data);
    }
  });
  
  return () => {
    isMounted = false;
  };
}, []);
```

---

### 🔌 **6. SOCKET.IO ERRORS**

#### **Connection Failed**
```
Socket.IO connection failed
```

**Penyebab:**
- Socket server tidak running
- Port blocked
- Network issue

**Solusi:**
```typescript
// Reconnection logic
const socket = io('http://localhost:3001', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  // Fallback to polling
  setConnectionStatus('offline');
});
```

---

## 🛠️ **ERROR MONITORING & LOGGING**

### **Comprehensive Error Logger**
```typescript
// lib/error-logger.ts
export class ErrorLogger {
  static async log(error: Error, context: any) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date(),
      url: window?.location?.href,
      userAgent: navigator?.userAgent,
    };
    
    // Log to database
    await fetch('/api/error-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorData);
    }
  }
}
```

### **Global Error Boundary**
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    ErrorLogger.log(error, { errorInfo, component: 'ErrorBoundary' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Oops! Terjadi kesalahan</h2>
          <button onClick={() => window.location.reload()}>
            Refresh Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🚀 **DEPLOYMENT ERRORS**

### **Vercel Build Errors**
```
Error: Build failed with exit code 1
```

**Common Issues:**
1. **TypeScript errors**: Fix all TS errors before deploy
2. **Missing dependencies**: Check package.json
3. **Environment variables**: Set in Vercel dashboard
4. **Build timeout**: Optimize build process

**Solutions:**
```bash
# Local build test
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Optimize bundle size
npm run analyze
```

### **Database Connection in Production**
```
MongoNetworkError: connection timed out
```

**Solutions:**
- Whitelist Vercel IPs in MongoDB Atlas
- Check connection string format
- Verify network access settings

---

## 📋 **ERROR PREVENTION CHECKLIST**

### **Development Phase**
- [ ] Implement proper error boundaries
- [ ] Add input validation on all forms
- [ ] Use TypeScript for type safety
- [ ] Add comprehensive logging
- [ ] Implement rate limiting
- [ ] Add proper loading states
- [ ] Handle network failures gracefully

### **Testing Phase**
- [ ] Test all error scenarios
- [ ] Verify error messages are user-friendly
- [ ] Check error logging works
- [ ] Test offline functionality
- [ ] Validate error recovery mechanisms

### **Production Phase**
- [ ] Monitor error rates
- [ ] Set up alerts for critical errors
- [ ] Regular database backups
- [ ] Performance monitoring
- [ ] Security vulnerability scanning

---

## 🎯 **QUICK REFERENCE**

| Error Code | Meaning | Common Cause | Quick Fix |
|------------|---------|--------------|-----------|
| 400 | Bad Request | Invalid input | Validate data |
| 401 | Unauthorized | Not logged in | Check session |
| 403 | Forbidden | Wrong role | Check permissions |
| 404 | Not Found | Missing resource | Verify ID/URL |
| 409 | Conflict | Duplicate data | Check uniqueness |
| 429 | Rate Limited | Too many requests | Implement delays |
| 500 | Server Error | Code/DB issue | Check logs |

---

## 📞 **SUPPORT & DEBUGGING**

### **Debug Mode Activation**
```bash
# Enable debug logging
DEBUG=* npm run dev

# Database query logging
MONGOOSE_DEBUG=true npm run dev
```

### **Health Check Endpoints**
- `/api/health` - Basic health check
- `/api/debug-data` - Database connection test
- `/api/debug-session` - Session validation test

### **Emergency Recovery**
```bash
# Reset database (CAUTION!)
node setup-database.js

# Clear cache
rm -rf .next/cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

**🏆 APLIKASI SUDAH DILENGKAPI ERROR HANDLING YANG KOMPREHENSIF**

**Status: PRODUCTION READY** ✅
