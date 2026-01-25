const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Look for chat button
    console.log('🔍 Looking for chat button...');
    const chatButton = await page.$('.fixed.bottom-4.right-4 button');
    
    if (chatButton) {
      console.log('✅ Chat button found, clicking...');
      await chatButton.click();
      await page.waitForTimeout(2000);
      
      // Check for input field after opening chat
      const inputField = await page.$('input[placeholder*="pesan"]');
      
      if (inputField) {
        console.log('✅ Input field found!');
        const isVisible = await inputField.isIntersectingViewport();
        console.log('📍 Input field visible:', isVisible);
        
        const inputValue = await inputField.evaluate(el => el.value);
        const placeholder = await inputField.evaluate(el => el.placeholder);
        console.log('📝 Placeholder:', placeholder);
        console.log('📝 Value:', inputValue);
      } else {
        console.log('❌ Input field NOT found');
        
        // Check what's in the chat container
        const chatContent = await page.evaluate(() => {
          const chatContainer = document.querySelector('.fixed.bottom-4.right-4');
          if (chatContainer) {
            return {
              innerHTML: chatContainer.innerHTML.slice(0, 500),
              children: Array.from(chatContainer.children).map(child => ({
                tag: child.tagName,
                className: child.className,
                textContent: child.textContent?.slice(0, 100)
              }))
            };
          }
          return null;
        });
        
        console.log('🔍 Chat container content:', JSON.stringify(chatContent, null, 2));
      }
    } else {
      console.log('❌ Chat button NOT found');
      
      // Check what's at the bottom right
      const bottomRight = await page.evaluate(() => {
        const elements = document.querySelectorAll('.fixed');
        return Array.from(elements).map(el => ({
          tag: el.tagName,
          className: el.className,
          position: window.getComputedStyle(el).position,
          bottom: window.getComputedStyle(el).bottom,
          right: window.getComputedStyle(el).right
        }));
      });
      
      console.log('🔍 Fixed elements:', JSON.stringify(bottomRight, null, 2));
    }
    
    await browser.close();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
})();
