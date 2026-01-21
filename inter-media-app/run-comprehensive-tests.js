#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

async function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  try {
    // Check if MongoDB is running
    await runCommand('mongosh', ['--eval', 'db.runCommand("ping")', '--quiet'], { stdio: 'pipe' });
    console.log('✅ MongoDB is running');
  } catch (error) {
    console.log('❌ MongoDB is not running or not accessible');
    console.log('💡 Please start MongoDB with: mongod');
    return false;
  }
  
  try {
    // Check if Node.js dependencies are installed
    const fs = require('fs');
    if (!fs.existsSync('node_modules')) {
      console.log('📦 Installing dependencies...');
      await runCommand('npm', ['install']);
    }
    console.log('✅ Dependencies are installed');
  } catch (error) {
    console.log('❌ Failed to install dependencies');
    return false;
  }
  
  return true;
}

async function runDatabaseTests() {
  console.log('\n📊 Running Database Tests...\n');
  
  try {
    // Setup test environment
    await runCommand('node', ['setup-test-environment.js']);
    console.log('✅ Test environment setup completed');
    
    // Run comprehensive use case tests
    await runCommand('node', ['test-all-usecases.js']);
    console.log('✅ Database tests completed');
    
    return true;
  } catch (error) {
    console.log('❌ Database tests failed:', error.message);
    return false;
  }
}

async function startApplicationServer() {
  console.log('\n🌐 Starting Application Server...\n');
  
  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true
    });
    
    let serverReady = false;
    let output = '';
    
    server.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      if (text.includes('Ready') || text.includes('started server') || text.includes('Local:')) {
        if (!serverReady) {
          serverReady = true;
          console.log('✅ Application server is ready');
          resolve(server);
        }
      }
    });
    
    server.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      if (text.includes('Ready') || text.includes('started server') || text.includes('Local:')) {
        if (!serverReady) {
          serverReady = true;
          console.log('✅ Application server is ready');
          resolve(server);
        }
      }
    });
    
    server.on('error', reject);
    
    // Timeout after 60 seconds
    setTimeout(() => {
      if (!serverReady) {
        server.kill();
        reject(new Error('Server startup timeout'));
      }
    }, 60000);
  });
}

async function runAPITests() {
  console.log('\n🧪 Running API Tests...\n');
  
  try {
    // Wait a bit for server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await runCommand('node', ['test-api-endpoints.js']);
    console.log('✅ API tests completed');
    return true;
  } catch (error) {
    console.log('❌ API tests failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🎯 Inter Media App - Comprehensive Testing Suite\n');
  console.log('=' .repeat(60));
  
  let server = null;
  
  try {
    // Step 1: Check prerequisites
    const prereqsOk = await checkPrerequisites();
    if (!prereqsOk) {
      console.log('\n❌ Prerequisites check failed. Please fix the issues above.');
      process.exit(1);
    }
    
    // Step 2: Run database tests
    const dbTestsOk = await runDatabaseTests();
    if (!dbTestsOk) {
      console.log('\n❌ Database tests failed. Please check your database setup.');
      process.exit(1);
    }
    
    // Step 3: Start application server
    server = await startApplicationServer();
    
    // Step 4: Run API tests
    const apiTestsOk = await runAPITests();
    
    // Final results
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 FINAL TEST RESULTS');
    console.log('=' .repeat(60));
    
    if (dbTestsOk && apiTestsOk) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Your Inter Media App is working correctly');
      console.log('✅ All use cases are functioning as expected');
      console.log('\n📋 What was tested:');
      console.log('  • Database connectivity and models');
      console.log('  • User management and authentication');
      console.log('  • Product catalog and categories');
      console.log('  • Shopping cart functionality');
      console.log('  • Order management system');
      console.log('  • Service request system');
      console.log('  • Payment system');
      console.log('  • POS (Point of Sale) system');
      console.log('  • Reports and analytics');
      console.log('  • API endpoints');
      console.log('  • Page routes');
      console.log('\n🚀 Your application is ready for production!');
    } else {
      console.log('⚠️  SOME TESTS FAILED');
      console.log('❌ Please review the test results above');
      console.log('💡 Check database connection and server configuration');
    }
    
  } catch (error) {
    console.log('\n❌ Testing suite failed:', error.message);
  } finally {
    // Clean up: stop the server
    if (server) {
      console.log('\n🛑 Stopping application server...');
      server.kill();
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Testing interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Testing terminated');
  process.exit(0);
});

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
