// content_script.js - Runs in the context of web pages

// Use IIFE to avoid polluting the global scope
(function() {
  // Configuration
  let config = {
    isEnabled: true
  };
  
  // Initialization with small delay to avoid detection
  setTimeout(initializeExtension, 1000);
  
  // Main initialization function
  function initializeExtension() {
    try {
      // Send a checkStatus message to the background script
      chrome.runtime.sendMessage({ action: "checkStatus" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending checkStatus message:", chrome.runtime.lastError.message);
          config.isEnabled = true; // Fallback to default
          setupDoubleClickTrigger();
          setupKeyboardShortcut();
          return;
        }
        config.isEnabled = response.isEnabled !== undefined ? response.isEnabled : true;
        setupDoubleClickTrigger();
        setupKeyboardShortcut();
      });
    } catch (error) {
      console.error("Initialization error:", error);
      config.isEnabled = true; // Fallback to default
      setupDoubleClickTrigger();
      setupKeyboardShortcut();
    }
  }
  
  // Set up double-click trigger
  function setupDoubleClickTrigger() {
    // Listen for double-click events
    document.addEventListener('dblclick', (e) => {
      if (!config.isEnabled) return;
      
      // Only process left-click (button 0)
      if (e.button === 0) {
        e.preventDefault();
        processPageContent();
      }
    });
    
    // Always listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggleExtension") {
        config.isEnabled = request.isEnabled;
        sendResponse({status: "ok"});
        showNotification(`Extension ${config.isEnabled ? 'enabled' : 'disabled'}.`);
      }
      
      return true;
    });
  }

  // Set up keyboard shortcut for toggling
  function setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey; // Use Command on Mac, Ctrl on others
      if (ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        chrome.runtime.sendMessage({ action: "toggleExtension" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending toggleExtension message:", chrome.runtime.lastError.message);
            showNotification("Error toggling extension.");
            return;
          }
          if (response.status === "ok") {
            config.isEnabled = response.isEnabled;
            showNotification(`Extension ${config.isEnabled ? 'enabled' : 'disabled'}.`);
          } else {
            showNotification("Error toggling extension.");
          }
        });
      }
    });
  }
  
  // Process the content of the current page
  async function processPageContent() {
    try {
      // Extract content from the page
      const content = extractContent();
      if (!content.question) {
        showNotification("No question content found on this page.");
        return;
      }
      
      // Call the API through our proxy
      const prompt = constructPrompt(content);
      const result = await callAPI(prompt);
      
      if (result && result.choices && result.choices[0] && result.choices[0].message) {
        // Show the answer
        showAnswer(result.choices[0].message.content);
      } else {
        showNotification("Could not retrieve an answer. Try again.");
      }
    } catch (error) {
      console.error("Error processing content:", error);
      showNotification("Error processing request.");
    }
  }
  
  // Extract content from the page while minimizing DOM operations
  function extractContent() {
    let question = '';
    const options = [];
    const visitedElements = new Set(); // Avoid duplicates
    
    try {
      // Find main content elements
      const contentSelectors = [
        'main', 'article', '.question', '.problem', '.quiz-item',
        '[role="main"]', '.content', '.question-text', '.stem'
      ];
      
      // Try each selector until we find content
      for (const selector of contentSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          for (const el of elements) {
            if (isElementVisible(el) && !visitedElements.has(el)) {
              visitedElements.add(el);
              const text = el.innerText || el.textContent;
              if (text && text.trim().length > 15) {
                question += text.trim() + '\n';
              }
            }
          }
          if (question.length > 30) break; // We found enough content
        }
      }
      
      // If we still don't have enough content, look at headings and paragraphs
      if (question.length < 30) {
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, p');
        for (const el of textElements) {
          if (isElementVisible(el) && !visitedElements.has(el)) {
            visitedElements.add(el);
            const text = el.innerText || el.textContent;
            if (text && text.trim().length > 15) {
              question += text.trim() + '\n';
            }
          }
        }
      }
      
      // Get options from radio buttons and checkboxes
      const inputs = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
      for (const input of inputs) {
        if (isElementVisible(input)) {
          const optionText = getOptionText(input);
          if (optionText) options.push(optionText);
        }
      }
      
      // Also check for options in lists
      const listItems = document.querySelectorAll('li.option, li.answer, .option, .answer-choice');
      for (const item of listItems) {
        if (isElementVisible(item) && !visitedElements.has(item)) {
          visitedElements.add(item);
          const text = item.innerText || item.textContent;
          if (text && text.trim().length > 0) {
            options.push(text.trim());
          }
        }
      }
      
      return {
        question: question.trim(),
        options: options
      };
    } catch (error) {
      console.error("Extraction error:", error);
      return { question: '', options: [] };
    }
  }
  
  // Helper function to check if an element is visible
  function isElementVisible(element) {
    if (!element) return false;
    
    // Check computed style
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || 
        style.visibility === 'hidden' || 
        style.opacity === '0' || 
        parseInt(style.width) === 0 || 
        parseInt(style.height) === 0) {
      return false;
    }
    
    // Check if element is in viewport
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    
    return true;
  }
  
  // Helper function to get the text associated with a form option
  function getOptionText(input) {
    let label = '';
    
    // Check for label element
    if (input.labels && input.labels.length) {
      label = input.labels[0].innerText || input.labels[0].textContent;
    } 
    // Check for label with 'for' attribute
    else if (input.id && document.querySelector(`label[for="${input.id}"]`)) {
      label = document.querySelector(`label[for="${input.id}"]`).innerText || 
              document.querySelector(`label[for="${input.id}"]`).textContent;
    } 
    // Check parent element for text
    else if (input.parentElement) {
      // Exclude the text from any inputs inside the parent
      const clone = input.parentElement.cloneNode(true);
      const inputs = clone.querySelectorAll('input');
      inputs.forEach(el => el.remove());
      
      label = clone.innerText || clone.textContent;
    }
    
    return label ? label.trim() : '';
  }
  
  // Construct a prompt from the extracted content
  function constructPrompt(content) {
    return "Question: " + content.question + "\n" +
      (content.options.length > 0 ? 
       "Options:\n" + content.options.map((opt, i) => (i + 1) + ". " + opt).join("\n") : "") +
      "\nPlease provide the correct answer with brief explanation.";
  }
  
  // API call function
  async function callAPI(prompt) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "proxyApiCall", prompt },
        response => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (!response || response.error) {
            reject(new Error(response?.error || "Unknown proxy error"));
          } else {
            resolve(response.data);
          }
        }
      );
    });
  }
  
  // Show answer function
  function showAnswer(answer) {
    try {
      // Create overlay container
      const overlay = document.createElement('div');
      
      // Generate a random ID
      const randomId = 'ext_' + Math.random().toString(36).substring(2, 10);
      overlay.id = randomId;
      
      // Apply styling
      overlay.style.position = 'fixed';
      overlay.style.top = '20px';
      overlay.style.right = '20px';
      overlay.style.maxWidth = '400px';
      overlay.style.maxHeight = '80vh';
      overlay.style.overflow = 'auto';
      overlay.style.backgroundColor = 'rgba(30, 30, 30, 0.85)';
      overlay.style.color = '#eee';
      overlay.style.padding = '12px';
      overlay.style.borderRadius = '5px';
      overlay.style.fontFamily = 'inherit';
      overlay.style.fontSize = '14px';
      overlay.style.lineHeight = '1.4';
      overlay.style.zIndex = '2147483647';
      overlay.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      overlay.style.transition = 'opacity 0.2s';
      overlay.style.opacity = '0';
      overlay.style.textAlign = 'left';
      
      // Create close button
      const closeBtn = document.createElement('div');
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '5px';
      closeBtn.style.right = '5px';
      closeBtn.style.width = '16px';
      closeBtn.style.height = '16px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.fontSize = '16px';
      closeBtn.style.lineHeight = '16px';
      closeBtn.style.textAlign = 'center';
      closeBtn.style.opacity = '0.7';
      closeBtn.innerHTML = '×';
      closeBtn.addEventListener('click', function() {
        overlay.style.opacity = '0';
        setTimeout(function() { 
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
        }, 200);
      });
      
      // Create content
      const content = document.createElement('div');
      content.style.marginTop = '10px';
      content.textContent = answer;
      
      // Assemble overlay
      overlay.appendChild(closeBtn);
      overlay.appendChild(content);
      document.body.appendChild(overlay);
      
      // Fade in
      setTimeout(function() { 
        overlay.style.opacity = '1'; 
      }, 10);
      
      // Auto-dismiss after 15 seconds
      setTimeout(function() {
        if (document.body.contains(overlay)) {
          overlay.style.opacity = '0';
          setTimeout(function() { 
            if (document.body.contains(overlay)) {
              document.body.removeChild(overlay);
            }
          }, 200);
        }
      }, 15000);
    } catch (error) {
      console.error("UI error:", error);
      showNotification(answer);
    }
  }
  
  // Show notification function
  function showNotification(message) {
    try {
      // Check if browser supports notifications
      if (!("Notification" in window)) {
        console.info("This browser does not support notifications");
        return;
      }
      
      // Check if we already have permission
      if (Notification.permission === "granted") {
        createNotification(message);
      } 
      // If permission is not denied, request it
      else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
          if (permission === "granted") {
            createNotification(message);
          }
        });
      }
      
      function createNotification(msg) {
        // Create a simple notification without an icon
        const notification = new Notification("Chrome Background Theme", {
          body: msg
        });
        
        // Close the notification after a few seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  }
})();