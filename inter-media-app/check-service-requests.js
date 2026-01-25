const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://saptoprawiroutomo_db_user:1234qwer@cluster0.z3wyzso.mongodb.net/intermediadb?retryWrites=true&w=majority&appName=Cluster0";

async function checkServiceRequests() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔍 Checking Service Requests...\n');
    
    const ServiceRequest = mongoose.model('ServiceRequest', new mongoose.Schema({}, { strict: false }));
    
    const count = await ServiceRequest.countDocuments();
    console.log(`📋 Total Service Requests: ${count}`);
    
    if (count > 0) {
      const samples = await ServiceRequest.find().limit(3);
      console.log('\n📝 Sample Service Requests:');
      samples.forEach((req, i) => {
        console.log(`${i+1}. ${req.serviceCode} - ${req.deviceType} - Status: ${req.status}`);
      });
    } else {
      console.log('❌ No service requests found in database');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkServiceRequests();
