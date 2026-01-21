// Create real test users in production database
const testUsers = [
  {
    name: 'Doni Pratama',
    email: 'doni.test2026@gmail.com',
    password: 'doni123456',
    phone: '081234567890',
    address: 'Jl. Sudirman No. 123, RT 01/RW 05, Jakarta Pusat'
  },
  {
    name: 'Sari Dewi',
    email: 'sari.test2026@gmail.com', 
    password: 'sari123456',
    phone: '081234567891',
    address: 'Jl. Gatot Subroto No. 456, RT 02/RW 03, Jakarta Selatan'
  },
  {
    name: 'Budi Santoso',
    email: 'budi.test2026@gmail.com',
    password: 'budi123456', 
    phone: '081234567892',
    address: 'Jl. Ahmad Yani No. 789, RT 05/RW 02, Bogor Tengah'
  },
  {
    name: 'Rina Wati',
    email: 'rina.test2026@gmail.com',
    password: 'rina123456',
    phone: '081234567893', 
    address: 'Jl. Diponegoro No. 321, RT 03/RW 01, Depok'
  },
  {
    name: 'Agus Setiawan',
    email: 'agus.test2026@gmail.com',
    password: 'agus123456',
    phone: '081234567894',
    address: 'Jl. Pahlawan No. 654, RT 01/RW 04, Tangerang'
  }
];

async function createTestUser(user) {
  console.log(`📝 Creating user: ${user.name}`);
  
  try {
    const response = await fetch('https://inter-media-apps.vercel.app/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        address: user.address,
        role: 'customer'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${user.name} created successfully`);
      return true;
    } else {
      console.log(`⚠️ ${user.name}: ${result.message || result.error || 'Registration failed'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${user.name}: ${error.message}`);
    return false;
  }
}

async function createAllTestUsers() {
  console.log('🚀 Creating Test Users in Production Database');
  console.log('============================================\n');
  
  let successCount = 0;
  
  for (const user of testUsers) {
    const success = await createTestUser(user);
    if (success) successCount++;
    
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 SUMMARY');
  console.log('==========');
  console.log(`✅ Successfully created: ${successCount}/${testUsers.length} users`);
  console.log(`❌ Failed: ${testUsers.length - successCount}/${testUsers.length} users`);
  
  if (successCount > 0) {
    console.log('\n👥 TEST USERS CREATED:');
    console.log('=====================');
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   📱 Phone: ${user.phone}`);
      console.log(`   📍 Address: ${user.address}`);
      console.log('');
    });
    
    console.log('🎯 NEXT STEPS:');
    console.log('==============');
    console.log('1. Check admin panel - users should appear in "Kelola User"');
    console.log('2. Test login with any of the accounts above');
    console.log('3. Make test purchases to verify shipping calculation');
    console.log('4. Check orders appear in admin reports');
  }
}

// Run the user creation
createAllTestUsers().catch(console.error);
