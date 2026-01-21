// Test script untuk di browser console
// Buka https://inter-media-apps.vercel.app/checkout-new
// Login dulu, lalu paste script ini di console

console.log('🧪 Testing Shipping Calculation...');

// Test API langsung
async function testShippingAPI() {
  try {
    console.log('Testing API directly...');
    const response = await fetch('/api/shipping/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        totalWeight: 2000,
        destination: 'Jakarta Pusat' 
      })
    });
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    console.log(`Options available: ${data.shippingOptions?.length || 0}`);
    
    if (data.shippingOptions?.length > 0) {
      console.log('Cheapest option:', data.shippingOptions[0]);
    }
    
  } catch (error) {
    console.error('❌ API Error:', error);
  }
}

// Test form interaction
function testFormInteraction() {
  console.log('Testing form interaction...');
  
  // Find city select
  const citySelect = document.querySelector('select[value*="Jakarta"]') || 
                    document.querySelector('[data-testid="city-select"]') ||
                    document.querySelector('select');
  
  if (citySelect) {
    console.log('✅ Found city select element');
    
    // Trigger change event
    citySelect.value = 'Jakarta Pusat';
    citySelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('Triggered city change event');
    
    // Check for loading state
    setTimeout(() => {
      const loadingElement = document.querySelector('[data-testid="shipping-loading"]') ||
                           document.querySelector('div:contains("Menghitung ongkir")');
      
      if (loadingElement) {
        console.log('✅ Loading state detected');
      } else {
        console.log('⚠️ No loading state found');
      }
    }, 100);
    
  } else {
    console.log('❌ City select not found');
    console.log('Available selects:', document.querySelectorAll('select'));
  }
}

// Run tests
testShippingAPI();
setTimeout(testFormInteraction, 1000);
