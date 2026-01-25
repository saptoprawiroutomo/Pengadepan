const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let adminToken = '';
let testUserId = '';
let testProductId = '';
let testCategoryId = '';
let testOrderId = '';

// Test Results Storage
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(testName, passed, details = '') {
    testResults.tests.push({ testName, passed, details });
    if (passed) {
        testResults.passed++;
        console.log(`✅ ${testName}`);
    } else {
        testResults.failed++;
        console.log(`❌ ${testName} - ${details}`);
    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. Test User Registration
async function testUserRegistration() {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, {
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
            phone: '081234567890'
        });
        
        testUserId = response.data.user?.id;
        logTest('User Registration', response.status === 201, response.data.message);
        return true;
    } catch (error) {
        logTest('User Registration', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 2. Test User Login
async function testUserLogin() {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'testuser@example.com',
            password: 'password123'
        });
        
        authToken = response.data.token;
        logTest('User Login', response.status === 200 && authToken, response.data.message);
        return true;
    } catch (error) {
        logTest('User Login', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 3. Test Admin Login
async function testAdminLogin() {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@intermedia.com',
            password: 'admin123'
        });
        
        adminToken = response.data.token;
        logTest('Admin Login', response.status === 200 && adminToken, response.data.message);
        return true;
    } catch (error) {
        logTest('Admin Login', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 4. Test Category CRUD
async function testCategoryCRUD() {
    try {
        // Create Category
        const createResponse = await axios.post(`${BASE_URL}/api/categories`, {
            name: 'Test Category',
            description: 'Test category description'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        testCategoryId = createResponse.data.category?.id || createResponse.data.category?._id;
        logTest('Create Category', createResponse.status === 201, 'Category created successfully');
        
        // Read Categories
        const readResponse = await axios.get(`${BASE_URL}/api/categories`);
        logTest('Read Categories', readResponse.status === 200 && readResponse.data.categories?.length > 0, 'Categories fetched');
        
        // Update Category
        if (testCategoryId) {
            const updateResponse = await axios.put(`${BASE_URL}/api/categories/${testCategoryId}`, {
                name: 'Updated Test Category',
                description: 'Updated description'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            logTest('Update Category', updateResponse.status === 200, 'Category updated');
        }
        
        return true;
    } catch (error) {
        logTest('Category CRUD', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 5. Test Product CRUD
async function testProductCRUD() {
    try {
        // Create Product
        const createResponse = await axios.post(`${BASE_URL}/api/products`, {
            name: 'Test Product',
            description: 'Test product description',
            price: 100000,
            stock: 50,
            category: testCategoryId,
            image: 'https://via.placeholder.com/300'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        testProductId = createResponse.data.product?.id || createResponse.data.product?._id;
        logTest('Create Product', createResponse.status === 201, 'Product created successfully');
        
        // Read Products
        const readResponse = await axios.get(`${BASE_URL}/api/products`);
        logTest('Read Products', readResponse.status === 200 && readResponse.data.products?.length > 0, 'Products fetched');
        
        // Update Product
        if (testProductId) {
            const updateResponse = await axios.put(`${BASE_URL}/api/products/${testProductId}`, {
                name: 'Updated Test Product',
                price: 150000,
                stock: 75
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            logTest('Update Product', updateResponse.status === 200, 'Product updated');
        }
        
        return true;
    } catch (error) {
        logTest('Product CRUD', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 6. Test Cart Operations
async function testCartOperations() {
    try {
        // Add to Cart
        const addResponse = await axios.post(`${BASE_URL}/api/cart/add`, {
            productId: testProductId,
            quantity: 2
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        logTest('Add to Cart', addResponse.status === 200, 'Product added to cart');
        
        // Get Cart
        const getResponse = await axios.get(`${BASE_URL}/api/cart`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        logTest('Get Cart', getResponse.status === 200 && getResponse.data.items?.length > 0, 'Cart items fetched');
        
        // Update Cart
        const updateResponse = await axios.put(`${BASE_URL}/api/cart/update`, {
            productId: testProductId,
            quantity: 3
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        logTest('Update Cart', updateResponse.status === 200, 'Cart updated');
        
        return true;
    } catch (error) {
        logTest('Cart Operations', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 7. Test Order Creation
async function testOrderCreation() {
    try {
        const response = await axios.post(`${BASE_URL}/api/orders`, {
            items: [{
                product: testProductId,
                quantity: 2,
                price: 150000
            }],
            shippingAddress: {
                street: 'Jl. Test No. 123',
                city: 'Jakarta',
                postalCode: '12345',
                province: 'DKI Jakarta'
            },
            paymentMethod: 'transfer'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        testOrderId = response.data.order?.id || response.data.order?._id;
        logTest('Create Order', response.status === 201, 'Order created successfully');
        return true;
    } catch (error) {
        logTest('Create Order', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 8. Test Order Management
async function testOrderManagement() {
    try {
        // Get Orders (User)
        const userOrdersResponse = await axios.get(`${BASE_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        logTest('Get User Orders', userOrdersResponse.status === 200, 'User orders fetched');
        
        // Get All Orders (Admin)
        const adminOrdersResponse = await axios.get(`${BASE_URL}/api/admin/orders`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Get All Orders (Admin)', adminOrdersResponse.status === 200, 'All orders fetched');
        
        // Update Order Status
        if (testOrderId) {
            const updateResponse = await axios.put(`${BASE_URL}/api/admin/orders/${testOrderId}`, {
                status: 'processing'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            logTest('Update Order Status', updateResponse.status === 200, 'Order status updated');
        }
        
        return true;
    } catch (error) {
        logTest('Order Management', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 9. Test Reports
async function testReports() {
    try {
        // Sales Report
        const salesResponse = await axios.get(`${BASE_URL}/api/admin/reports/sales`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Sales Report', salesResponse.status === 200, 'Sales report generated');
        
        // Transaction Report
        const transactionResponse = await axios.get(`${BASE_URL}/api/admin/reports/transactions`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Transaction Report', transactionResponse.status === 200, 'Transaction report generated');
        
        // Product Report
        const productResponse = await axios.get(`${BASE_URL}/api/admin/reports/products`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Product Report', productResponse.status === 200, 'Product report generated');
        
        return true;
    } catch (error) {
        logTest('Reports', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 10. Test Messages/Chat
async function testMessaging() {
    try {
        // Send Message
        const sendResponse = await axios.post(`${BASE_URL}/api/messages`, {
            content: 'Test message from user',
            type: 'user'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        logTest('Send Message', sendResponse.status === 201, 'Message sent successfully');
        
        // Get Messages
        const getResponse = await axios.get(`${BASE_URL}/api/messages`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        logTest('Get Messages', getResponse.status === 200, 'Messages fetched');
        
        // Admin Reply
        const replyResponse = await axios.post(`${BASE_URL}/api/admin/messages/reply`, {
            userId: testUserId,
            content: 'Test reply from admin',
            type: 'admin'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Admin Reply', replyResponse.status === 201, 'Admin reply sent');
        
        return true;
    } catch (error) {
        logTest('Messaging', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 11. Test POS System
async function testPOSSystem() {
    try {
        // POS Sale
        const posResponse = await axios.post(`${BASE_URL}/api/pos/sale`, {
            items: [{
                product: testProductId,
                quantity: 1,
                price: 150000
            }],
            paymentMethod: 'cash',
            customerName: 'Walk-in Customer'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('POS Sale', posResponse.status === 201, 'POS sale completed');
        
        // POS Reports
        const posReportResponse = await axios.get(`${BASE_URL}/api/pos/reports`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('POS Reports', posReportResponse.status === 200, 'POS reports generated');
        
        return true;
    } catch (error) {
        logTest('POS System', false, error.response?.data?.message || error.message);
        return false;
    }
}

// Main Test Runner
async function runComprehensiveTest() {
    console.log('🚀 Starting Comprehensive Test Suite for Inter Media App\n');
    
    // Wait for app to be ready
    await delay(2000);
    
    // Run all tests
    await testUserRegistration();
    await delay(500);
    
    await testUserLogin();
    await delay(500);
    
    await testAdminLogin();
    await delay(500);
    
    await testCategoryCRUD();
    await delay(500);
    
    await testProductCRUD();
    await delay(500);
    
    await testCartOperations();
    await delay(500);
    
    await testOrderCreation();
    await delay(500);
    
    await testOrderManagement();
    await delay(500);
    
    await testReports();
    await delay(500);
    
    await testMessaging();
    await delay(500);
    
    await testPOSSystem();
    
    // Print Results
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    testResults.tests.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        console.log(`${status} ${test.testName}${test.details ? ' - ' + test.details : ''}`);
    });
    
    // Cleanup - Delete test category (optional)
    if (testCategoryId && adminToken) {
        try {
            await axios.delete(`${BASE_URL}/api/categories/${testCategoryId}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('\n🧹 Test data cleaned up');
        } catch (error) {
            console.log('\n⚠️ Could not clean up test data');
        }
    }
}

// Run the test
runComprehensiveTest().catch(console.error);
