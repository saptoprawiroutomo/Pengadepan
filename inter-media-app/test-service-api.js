const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0";

async function testServiceAPI() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔍 Testing Service Request API...\n');
    
    const ServiceRequest = mongoose.model('ServiceRequest', new mongoose.Schema({}, { strict: false }));
    
    // Test what API should return
    const requests = await ServiceRequest.find({})
      .sort({ createdAt: -1 })
      .lean();
      
    console.log(`📋 Found ${requests.length} service requests`);
    console.log('📝 Sample data structure:');
    if (requests.length > 0) {
      console.log(JSON.stringify(requests[0], null, 2));
    }
    
    // Check if userId field exists
    const withUserId = requests.filter(req => req.userId);
    console.log(`\n👤 Requests with userId: ${withUserId.length}/${requests.length}`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testServiceAPI();
