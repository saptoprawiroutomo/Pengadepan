// Test Chat Widget Input Field
console.log('🧪 Testing Chat Widget Input Field...\n');

// Test 1: Check if chat widget is rendered
const chatButton = document.querySelector('[data-slot="button"]');
console.log('1. Chat Button Found:', chatButton ? '✅ Yes' : '❌ No');

if (chatButton) {
  console.log('   Button Text:', chatButton.textContent);
  console.log('   Button Classes:', chatButton.className);
}

// Test 2: Simulate click to open chat
if (chatButton) {
  console.log('\n2. Simulating Chat Button Click...');
  chatButton.click();
  
  // Wait a bit for chat to open
  setTimeout(() => {
    // Test 3: Check for input field
    const inputField = document.querySelector('input[placeholder*="pesan"]') || 
                      document.querySelector('input[placeholder*="Ketik"]') ||
                      document.querySelector('textarea[placeholder*="pesan"]');
    
    console.log('3. Input Field Found:', inputField ? '✅ Yes' : '❌ No');
    
    if (inputField) {
      console.log('   Input Type:', inputField.tagName);
      console.log('   Placeholder:', inputField.placeholder);
      console.log('   Classes:', inputField.className);
      console.log('   Visible:', inputField.offsetHeight > 0 ? '✅ Yes' : '❌ No');
    }
    
    // Test 4: Check for chat container
    const chatContainer = document.querySelector('[data-slot="card"]') ||
                         document.querySelector('.fixed.bottom-4.right-4');
    
    console.log('4. Chat Container Found:', chatContainer ? '✅ Yes' : '❌ No');
    
    if (chatContainer) {
      console.log('   Container Classes:', chatContainer.className);
      console.log('   Container Visible:', chatContainer.offsetHeight > 0 ? '✅ Yes' : '❌ No');
    }
    
    // Test 5: Check all input elements
    const allInputs = document.querySelectorAll('input, textarea');
    console.log('\n5. All Input Elements Found:', allInputs.length);
    
    allInputs.forEach((input, index) => {
      console.log(`   Input ${index + 1}:`, {
        tag: input.tagName,
        type: input.type || 'text',
        placeholder: input.placeholder || 'none',
        visible: input.offsetHeight > 0
      });
    });
    
  }, 1000);
}

// Test 6: Check if user is logged in
setTimeout(() => {
  console.log('\n6. Session Check...');
  fetch('/api/debug-session')
    .then(res => res.json())
    .then(data => {
      console.log('   Session Status:', data.authenticated ? '✅ Logged In' : '❌ Not Logged In');
      if (data.user) {
        console.log('   User Role:', data.user.role);
        console.log('   User Name:', data.user.name);
      }
    })
    .catch(err => console.log('   Session Error:', err.message));
}, 2000);
