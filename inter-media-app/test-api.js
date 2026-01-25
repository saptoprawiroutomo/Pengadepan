// Test API endpoint directly
async function testAPI() {
  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': document.cookie // Include session cookie
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'testuser@example.com',
        password: '123456',
        role: 'customer'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    if (text) {
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
      } catch (e) {
        console.log('Not valid JSON');
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Run test
testAPI();
