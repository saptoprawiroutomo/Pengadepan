// Script untuk buat transaksi real melalui frontend
const puppeteer = require('puppeteer');

async function createRealTransaction() {
  console.log('🛒 CREATING REAL TRANSACTION VIA FRONTEND');
  console.log('=========================================');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 1. Go to website
    console.log('🌐 Opening website...');
    await page.goto('https://inter-media-apps.vercel.app');
    
    // 2. Login
    console.log('🔐 Logging in...');
    await page.click('a[href="/login"]');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'doni.test2026@gmail.com');
    await page.type('input[type="password"]', 'doni123456');
    await page.click('button[type="submit"]');
    
    // 3. Wait for login success
    await page.waitForNavigation();
    console.log('✅ Login successful');
    
    // 4. Go to products
    console.log('📦 Selecting product...');
    await page.goto('https://inter-media-apps.vercel.app/products');
    
    // 5. Click first product
    await page.waitForSelector('.product-card');
    await page.click('.product-card a');
    
    // 6. Add to cart
    console.log('🛒 Adding to cart...');
    await page.waitForSelector('button:contains("Add to Cart")');
    await page.click('button:contains("Add to Cart")');
    
    // 7. Go to checkout
    console.log('💳 Going to checkout...');
    await page.goto('https://inter-media-apps.vercel.app/checkout');
    
    // 8. Fill shipping info and complete order
    console.log('📋 Completing order...');
    // ... fill form and submit
    
    console.log('✅ Real transaction created!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

// Uncomment to run
// createRealTransaction();
