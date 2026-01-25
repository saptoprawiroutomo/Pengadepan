# 🔧 COMMON ISSUES & QUICK FIXES
## Inter Media E-commerce - Troubleshooting

---

## ⚡ **QUICK FIXES FOR COMMON ISSUES**

### 🚀 **Startup Issues**

#### **1. Port Already in Use**
```bash
Error: listen EADDRINUSE: address already in use :::3000
```
**Fix:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### **2. MongoDB Connection Failed**
```bash
MongoNetworkError: failed to connect to server
```
**Fix:**
```bash
# Check environment variables
cat .env.local | grep MONGODB_URI

# Test connection
node -e "console.log(process.env.MONGODB_URI)"

# Restart with fresh connection
rm -rf .next/cache && npm run dev
```

#### **3. Socket Server Not Starting**
```bash
Socket.IO server failed to start
```
**Fix:**
```bash
# Check if port 3001 is free
lsof -i :3001

# Kill conflicting process
kill -9 $(lsof -t -i:3001)

# Restart socket server
node socket-server.js
```

---

### 🛒 **E-commerce Issues**

#### **1. Cart Not Updating**
**Symptoms:** Items not added to cart
**Fix:**
```typescript
// Clear cart cache
localStorage.removeItem('cart');
// Refresh page
window.location.reload();
```

#### **2. Checkout Process Stuck**
**Symptoms:** Order not created
**Debug:**
```bash
# Check order creation
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### **3. Stock Not Updating**
**Symptoms:** Stock shows wrong numbers
**Fix:**
```javascript
// Run stock sync script
node update-printer-stock.js
```

---

### 💳 **Payment Issues**

#### **1. Payment Gateway Timeout**
**Symptoms:** Payment stuck in pending
**Fix:**
```typescript
// Check payment status
const checkPayment = async (orderId) => {
  const response = await fetch(`/api/orders/${orderId}/payment-status`);
  return response.json();
};
```

#### **2. Payment Proof Upload Failed**
**Symptoms:** Image upload error
**Fix:**
```bash
# Check file size (max 5MB)
# Check file format (jpg, png, pdf only)
# Clear browser cache
```

---

### 👥 **User Management Issues**

#### **1. Login Failed**
**Symptoms:** Credentials correct but can't login
**Fix:**
```bash
# Reset user password
node -e "
const bcrypt = require('bcryptjs');
console.log('New hash:', bcrypt.hashSync('newpassword', 12));
"

# Update in database manually
```

#### **2. Session Expired Frequently**
**Symptoms:** Logged out too often
**Fix:**
```typescript
// Extend session duration in next-auth config
session: {
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

#### **3. Role Access Denied**
**Symptoms:** Admin can't access admin pages
**Fix:**
```javascript
// Check user role in database
db.users.findOne({email: "admin@intermedia.com"})

// Update role if needed
db.users.updateOne(
  {email: "admin@intermedia.com"}, 
  {$set: {role: "admin"}}
)
```

---

### 📊 **Reports & Analytics Issues**

#### **1. Reports Not Loading**
**Symptoms:** Empty or error in reports
**Fix:**
```bash
# Check sample data exists
node check-data.js

# Create sample transactions
node create-sample-transactions.js
```

#### **2. PDF Export Failed**
**Symptoms:** PDF generation error
**Fix:**
```bash
# Check dependencies
npm list @react-pdf/renderer

# Reinstall if needed
npm uninstall @react-pdf/renderer
npm install @react-pdf/renderer@latest
```

#### **3. Excel Export Issues**
**Symptoms:** Excel file corrupted
**Fix:**
```typescript
// Clear export cache
rm -rf /tmp/excel-exports/

// Regenerate export
curl -X GET "http://localhost:3000/api/reports/export-excel?type=sales"
```

---

### 💬 **Chat System Issues**

#### **1. Messages Not Sending**
**Symptoms:** Chat messages stuck
**Fix:**
```bash
# Restart socket server
pkill -f socket-server
node socket-server.js

# Check socket connection
curl http://localhost:3001
```

#### **2. Chat History Missing**
**Symptoms:** Previous messages not showing
**Fix:**
```javascript
// Check chat collection
db.chats.find({userId: "USER_ID"}).sort({createdAt: -1})

// Clear chat cache
localStorage.removeItem('chatHistory');
```

#### **3. Unread Count Wrong**
**Symptoms:** Notification badge incorrect
**Fix:**
```typescript
// Reset unread count
await fetch('/api/chat/mark-read', {
  method: 'POST',
  body: JSON.stringify({userId: session.user.id})
});
```

---

### 🏪 **POS System Issues**

#### **1. POS Transaction Failed**
**Symptoms:** Sale not recorded
**Fix:**
```bash
# Check POS endpoint
curl -X POST http://localhost:3000/api/pos/transactions \
  -H "Content-Type: application/json" \
  -d '{"items": [], "total": 0}'
```

#### **2. Receipt Not Generated**
**Symptoms:** PDF receipt error
**Fix:**
```typescript
// Test receipt generation
const testReceipt = async () => {
  const response = await fetch('/api/pos/receipt/test');
  console.log(await response.blob());
};
```

#### **3. Stock Sync Issues**
**Symptoms:** POS and online stock different
**Fix:**
```javascript
// Force stock synchronization
node -e "
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Product.updateMany({}, {$set: {lastSync: new Date()}});
  console.log('Stock sync completed');
  process.exit(0);
});
"
```

---

## 🚨 **EMERGENCY PROCEDURES**

### **Complete System Reset**
```bash
# CAUTION: This will reset all data!

# 1. Stop all processes
pkill -f "node"
pkill -f "next"

# 2. Clear all caches
rm -rf .next/
rm -rf node_modules/
rm -rf package-lock.json

# 3. Reinstall
npm install

# 4. Reset database (if needed)
node setup-database.js

# 5. Restart
npm run dev
```

### **Database Recovery**
```bash
# Backup current data
mongodump --uri="$MONGODB_URI" --out=backup/

# Restore from backup
mongorestore --uri="$MONGODB_URI" backup/

# Or reset with sample data
node setup-test-environment.js
```

### **Production Deployment Fix**
```bash
# If Vercel deployment fails

# 1. Check build locally
npm run build

# 2. Fix any TypeScript errors
npx tsc --noEmit

# 3. Check environment variables
vercel env ls

# 4. Redeploy
vercel --prod
```

---

## 📱 **Browser-Specific Issues**

### **Safari Issues**
- **Problem:** Date picker not working
- **Fix:** Use polyfill or alternative date input

### **Chrome Issues**
- **Problem:** CORS errors in development
- **Fix:** Start Chrome with `--disable-web-security` flag

### **Firefox Issues**
- **Problem:** WebSocket connection fails
- **Fix:** Check Firefox security settings

---

## 🔍 **Debugging Tools**

### **Built-in Debug Endpoints**
```bash
# Health check
curl http://localhost:3000/api/health

# Database status
curl http://localhost:3000/api/debug-data

# Session info
curl http://localhost:3000/api/debug-session

# Product count
curl http://localhost:3000/api/debug-products
```

### **Database Queries**
```javascript
// Check collections
db.runCommand("listCollections")

// Count documents
db.products.countDocuments()
db.users.countDocuments()
db.orders.countDocuments()

// Find recent orders
db.orders.find().sort({createdAt: -1}).limit(5)
```

### **Log Analysis**
```bash
# Check application logs
tail -f app.log

# Check server logs
tail -f server.log

# Check Next.js logs
tail -f .next/trace
```

---

## 📞 **Getting Help**

### **Self-Diagnosis Checklist**
- [ ] Check console for JavaScript errors
- [ ] Verify network connectivity
- [ ] Confirm environment variables are set
- [ ] Test with different browser/device
- [ ] Check if issue is reproducible
- [ ] Review recent changes made

### **Information to Collect**
- Error message (exact text)
- Steps to reproduce
- Browser and version
- Operating system
- Time when error occurred
- Screenshots if applicable

### **Quick Test Commands**
```bash
# Test all major functions
npm run test:quick

# Check API endpoints
npm run test:api

# Verify database connection
npm run test:db

# Test frontend pages
npm run test:frontend
```

---

**🎯 MOST ISSUES CAN BE RESOLVED WITH THESE QUICK FIXES**

**For complex issues, refer to the main ERROR_HANDLING_GUIDE.md**
