// Test Chat Widget Functionality
const testChatWidget = async () => {
  console.log('🧪 Testing Chat Widget Functionality...\n');

  // Test 1: Check if chat button exists
  const chatButton = document.querySelector('button[class*="rounded-full"][class*="w-14"][class*="h-14"]');
  console.log('1. Chat Button Found:', chatButton ? '✅ Yes' : '❌ No');
  
  if (chatButton) {
    console.log('   Button Classes:', chatButton.className);
    console.log('   Button Visible:', chatButton.offsetHeight > 0 ? '✅ Yes' : '❌ No');
    
    // Test 2: Simulate click to open chat
    console.log('\n2. Simulating Chat Button Click...');
    chatButton.click();
    
    // Wait for chat to open
    setTimeout(() => {
      // Test 3: Check for chat card
      const chatCard = document.querySelector('[class*="w-80"][class*="h-96"]');
      console.log('3. Chat Card Found:', chatCard ? '✅ Yes' : '❌ No');
      
      if (chatCard) {
        console.log('   Card Classes:', chatCard.className);
        console.log('   Card Visible:', chatCard.offsetHeight > 0 ? '✅ Yes' : '❌ No');
        
        // Test 4: Check for input field
        const inputField = document.querySelector('input[placeholder*="Ketik"]') || 
                          document.querySelector('input[placeholder*="pesan"]');
        
        console.log('4. Input Field Found:', inputField ? '✅ Yes' : '❌ No');
        
        if (inputField) {
          console.log('   Input Placeholder:', inputField.placeholder);
          console.log('   Input Classes:', inputField.className);
          console.log('   Input Visible:', inputField.offsetHeight > 0 ? '✅ Yes' : '❌ No');
          console.log('   Input Type:', inputField.type);
          
          // Test 5: Try typing in input
          console.log('\n5. Testing Input Functionality...');
          inputField.focus();
          inputField.value = 'Test message';
          inputField.dispatchEvent(new Event('input', { bubbles: true }));
          console.log('   Input Value Set:', inputField.value === 'Test message' ? '✅ Yes' : '❌ No');
        }
        
        // Test 6: Check for send button
        const sendButton = document.querySelector('button[class*="Send"]') ||
                          document.querySelector('button svg[class*="send"]') ||
                          document.querySelector('button:has(svg)');
        
        console.log('6. Send Button Found:', sendButton ? '✅ Yes' : '❌ No');
        
        if (sendButton) {
          console.log('   Send Button Classes:', sendButton.className);
          console.log('   Send Button Visible:', sendButton.offsetHeight > 0 ? '✅ Yes' : '❌ No');
        }
      }
      
      // Test 7: Check all input elements on page
      const allInputs = document.querySelectorAll('input');
      console.log('\n7. All Input Elements on Page:', allInputs.length);
      
      allInputs.forEach((input, index) => {
        console.log(`   Input ${index + 1}:`, {
          placeholder: input.placeholder || 'none',
          type: input.type || 'text',
          visible: input.offsetHeight > 0,
          classes: input.className.substring(0, 50) + '...'
        });
      });
      
    }, 1000);
  }
};

// Run test when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testChatWidget);
} else {
  testChatWidget();
}
