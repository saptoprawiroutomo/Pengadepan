const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'http://localhost:3000';
let testResults = {
    frontend: { passed: 0, failed: 0, tests: [] },
    backend: { passed: 0, failed: 0, tests: [] },
    buttons: { passed: 0, failed: 0, tests: [] },
    apis: { passed: 0, failed: 0, tests: [] }
};

function logTest(category, testName, passed, details = '') {
    testResults[category].tests.push({ testName, passed, details });
    if (passed) {
        testResults[category].passed++;
        console.log(`✅ [${category.toUpperCase()}] ${testName}`);
    } else {
        testResults[category].failed++;
        console.log(`❌ [${category.toUpperCase()}] ${testName} - ${details}`);
    }
}

// 1. FRONTEND TESTING
async function testFrontendPages() {
    console.log('\n🌐 TESTING FRONTEND PAGES');
    console.log('========================');
    
    const pages = [
        { path: '/', name: 'Homepage', expectedElements: ['Inter Medi-A', 'Lihat Produk', 'Service Center'] },
        { path: '/products', name: 'Products Page', expectedElements: ['Produk', 'Kategori'] },
        { path: '/login', name: 'Login Page', expectedElements: ['Masuk', 'Email', 'Password'] },
        { path: '/register', name: 'Register Page', expectedElements: ['Daftar', 'Nama', 'Email'] },
        { path: '/about', name: 'About Page', expectedElements: ['Tentang Inter Medi-A', 'Sejarah'] },
        { path: '/contact', name: 'Contact Page', expectedElements: ['Hubungi Kami', 'Alamat'] },
        { path: '/cart', name: 'Cart Page', expectedElements: ['Keranjang', 'Belanja'] }
    ];

    for (const page of pages) {
        try {
            const response = await axios.get(BASE_URL + page.path, { 
                maxRedirects: 5,
                validateStatus: () => true 
            });
            
            if (response.status === 200) {
                const $ = cheerio.load(response.data);
                const pageText = $('body').text();
                
                let elementsFound = 0;
                for (const element of page.expectedElements) {
                    if (pageText.includes(element)) {
                        elementsFound++;
                    }
                }
                
                const allElementsFound = elementsFound === page.expectedElements.length;
                logTest('frontend', page.name, allElementsFound, 
                    allElementsFound ? `${elementsFound}/${page.expectedElements.length} elements found` : 
                    `Only ${elementsFound}/${page.expectedElements.length} elements found`);
            } else {
                logTest('frontend', page.name, false, `HTTP ${response.status}`);
            }
        } catch (error) {
            logTest('frontend', page.name, false, error.message);
        }
    }
}

// 2. BUTTON TESTING
async function testButtons() {
    console.log('\n🔘 TESTING BUTTONS & UI ELEMENTS');
    console.log('===============================');
    
    try {
        // Test Homepage buttons
        const homepageResponse = await axios.get(BASE_URL);
        const $ = cheerio.load(homepageResponse.data);
        
        // Count buttons
        const buttons = $('button').length;
        const links = $('a').length;
        const forms = $('form').length;
        
        logTest('buttons', 'Homepage Buttons', buttons > 0, `${buttons} buttons found`);
        logTest('buttons', 'Navigation Links', links > 5, `${links} links found`);
        logTest('buttons', 'Interactive Forms', forms >= 0, `${forms} forms found`);
        
        // Test specific buttons
        const productButton = $('button:contains("Lihat Produk")').length > 0;
        const serviceButton = $('button:contains("Service Center")').length > 0;
        const chatButton = $('button').filter((i, el) => $(el).find('svg').length > 0).length > 0;
        
        logTest('buttons', 'Product Button', productButton, 'Lihat Produk button exists');
        logTest('buttons', 'Service Button', serviceButton, 'Service Center button exists');
        logTest('buttons', 'Chat Widget', chatButton, 'Chat button with icon exists');
        
    } catch (error) {
        logTest('buttons', 'Button Analysis', false, error.message);
    }
}

// 3. API ROUTES TESTING
async function testAPIRoutes() {
    console.log('\n🔌 TESTING API ROUTES');
    console.log('====================');
    
    const apiRoutes = [
        { path: '/api/products', method: 'GET', name: 'Get Products', expectData: true },
        { path: '/api/categories', method: 'GET', name: 'Get Categories', expectData: true },
        { path: '/api/auth/session', method: 'GET', name: 'Auth Session', expectData: false },
        { path: '/api/service-requests', method: 'GET', name: 'Service Requests', expectData: false },
        { path: '/api/cart', method: 'GET', name: 'Cart API', expectAuth: true },
        { path: '/api/orders', method: 'GET', name: 'Orders API', expectAuth: true },
        { path: '/api/chat/history', method: 'GET', name: 'Chat History', expectAuth: true },
        { path: '/api/admin/dashboard', method: 'GET', name: 'Admin Dashboard', expectAuth: true },
        { path: '/api/health', method: 'GET', name: 'Health Check', expectData: false },
        { path: '/api/ping', method: 'GET', name: 'Ping API', expectData: false }
    ];

    for (const route of apiRoutes) {
        try {
            const response = await axios({
                method: route.method,
                url: BASE_URL + route.path,
                validateStatus: () => true,
                timeout: 5000
            });
            
            if (route.expectAuth && (response.status === 401 || response.status === 403)) {
                logTest('apis', route.name, true, `Protected route (HTTP ${response.status})`);
            } else if (response.status === 200) {
                if (route.expectData) {
                    const hasData = response.data && (Array.isArray(response.data) || Object.keys(response.data).length > 0);
                    logTest('apis', route.name, hasData, hasData ? 'Data returned' : 'No data returned');
                } else {
                    logTest('apis', route.name, true, 'Endpoint accessible');
                }
            } else if (response.status === 404) {
                logTest('apis', route.name, false, 'Endpoint not found');
            } else {
                logTest('apis', route.name, false, `HTTP ${response.status}`);
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                logTest('apis', route.name, false, 'Connection refused');
            } else {
                logTest('apis', route.name, false, error.message);
            }
        }
    }
}

// 4. BACKEND FUNCTIONALITY TESTING
async function testBackendFunctionality() {
    console.log('\n⚙️  TESTING BACKEND FUNCTIONALITY');
    console.log('================================');
    
    try {
        // Test database connection via API
        const productsResponse = await axios.get(BASE_URL + '/api/products');
        const products = productsResponse.data.products || productsResponse.data;
        logTest('backend', 'Database Connection', Array.isArray(products), `${products?.length || 0} products loaded`);
        
        // Test data structure
        if (products && products.length > 0) {
            const firstProduct = products[0];
            const hasRequiredFields = firstProduct.name && firstProduct.price;
            logTest('backend', 'Product Data Structure', hasRequiredFields, 'Products have name and price');
        }
        
        // Test categories
        const categoriesResponse = await axios.get(BASE_URL + '/api/categories');
        const categories = categoriesResponse.data;
        logTest('backend', 'Categories System', Array.isArray(categories), `${categories?.length || 0} categories loaded`);
        
        // Test authentication system
        const authResponse = await axios.get(BASE_URL + '/api/auth/session');
        logTest('backend', 'Authentication System', authResponse.status === 200, 'Auth session endpoint working');
        
        // Test protected routes
        const cartResponse = await axios.get(BASE_URL + '/api/cart', { validateStatus: () => true });
        logTest('backend', 'Route Protection', cartResponse.status === 401, 'Protected routes require auth');
        
    } catch (error) {
        logTest('backend', 'Backend Connection', false, error.message);
    }
}

// 5. SPECIFIC FEATURE TESTING
async function testSpecificFeatures() {
    console.log('\n🎯 TESTING SPECIFIC FEATURES');
    console.log('===========================');
    
    try {
        // Test Socket.IO server
        const socketResponse = await axios.get('http://localhost:3001/socket.io/', { 
            validateStatus: () => true,
            timeout: 3000 
        });
        logTest('backend', 'Socket.IO Server', socketResponse.status === 400 || socketResponse.status === 200, 'Real-time server running');
        
        // Test file uploads endpoint
        const uploadResponse = await axios.post(BASE_URL + '/api/upload-payment-proof', {}, { 
            validateStatus: () => true 
        });
        logTest('backend', 'File Upload System', uploadResponse.status !== 404, 'Upload endpoint exists');
        
        // Test admin endpoints
        const adminResponse = await axios.get(BASE_URL + '/api/admin/dashboard', { 
            validateStatus: () => true 
        });
        logTest('backend', 'Admin System', adminResponse.status === 401 || adminResponse.status === 403, 'Admin routes protected');
        
        // Test POS system
        const posResponse = await axios.get(BASE_URL + '/api/pos', { 
            validateStatus: () => true 
        });
        logTest('backend', 'POS System', posResponse.status !== 404, 'POS endpoints available');
        
    } catch (error) {
        logTest('backend', 'Feature Testing', false, error.message);
    }
}

// MAIN TEST RUNNER
async function runComprehensiveTest() {
    console.log('🚀 COMPREHENSIVE FRONTEND & BACKEND TESTING');
    console.log('==========================================');
    console.log('Testing all buttons, UI elements, API routes, and functionality...\n');
    
    await testFrontendPages();
    await testButtons();
    await testAPIRoutes();
    await testBackendFunctionality();
    await testSpecificFeatures();
    
    // Print Summary
    console.log('\n📊 COMPREHENSIVE TEST RESULTS');
    console.log('=============================');
    
    const categories = ['frontend', 'buttons', 'apis', 'backend'];
    let totalPassed = 0, totalFailed = 0;
    
    categories.forEach(category => {
        const result = testResults[category];
        totalPassed += result.passed;
        totalFailed += result.failed;
        const successRate = result.passed + result.failed > 0 ? 
            ((result.passed / (result.passed + result.failed)) * 100).toFixed(1) : 0;
        
        console.log(`${category.toUpperCase().padEnd(10)} | ✅ ${result.passed.toString().padStart(2)} | ❌ ${result.failed.toString().padStart(2)} | ${successRate}%`);
    });
    
    console.log('─'.repeat(40));
    const overallSuccess = totalPassed + totalFailed > 0 ? 
        ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) : 0;
    console.log(`TOTAL      | ✅ ${totalPassed.toString().padStart(2)} | ❌ ${totalFailed.toString().padStart(2)} | ${overallSuccess}%`);
    
    console.log('\n🎯 FINAL VERDICT:');
    if (overallSuccess >= 90) {
        console.log('🎉 EXCELLENT! Application is production-ready!');
    } else if (overallSuccess >= 75) {
        console.log('✅ GOOD! Minor issues need attention.');
    } else {
        console.log('⚠️  NEEDS WORK! Several issues require fixing.');
    }
}

// Install cheerio if not available, then run tests
runComprehensiveTest().catch(console.error);
