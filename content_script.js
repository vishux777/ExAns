// content_script.js - Runs in the context of web pages

// Use IIFE to avoid polluting the global scope
(function() {
  console.log("Chrome Background Theme content script loaded.");

  // Configuration
  let config = {
    isEnabled: true
  };

  // Wait for dependencies to load
  function waitForDependencies(callback) {
    const requiredFunctions = ['extractContent', 'showAnswer', 'showNotification', 'callAPI'];
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds (100ms * 50)

    const checkDependencies = setInterval(() => {
      attempts++;
      const allLoaded = requiredFunctions.every(fn => typeof window[fn] === 'function');
      if (allLoaded) {
        console.log("All dependencies loaded:", requiredFunctions);
        clearInterval(checkDependencies);
        callback();
      } else if (attempts >= maxAttempts) {
        console.error("Failed to load dependencies:", requiredFunctions.filter(fn => typeof window[fn] !== 'function'));
        clearInterval(checkDependencies);
        // Fallback: proceed with default state
        config.isEnabled = true;
        setupDoubleClickTrigger();
        setupKeyboardShortcut();
      }
    }, 100);
  }

  // Initialization with small delay to avoid detection
  setTimeout(() => {
    console.log("Initializing Chrome Background Theme...");
    waitForDependencies(initializeExtension);
  }, 1000);
  
  // Main initialization function
  function initializeExtension() {
    try {
      // Send a checkStatus message to the background script
      console.log("Sending checkStatus message...");
      chrome.runtime.sendMessage({ action: "checkStatus" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending checkStatus message:", chrome.runtime.lastError.message);
          config.isEnabled = true; // Fallback to default
          setupDoubleClickTrigger();
          setupKeyboardShortcut();
          return;
        }
        config.isEnabled = response.isEnabled !== undefined ? response.isEnabled : true;
        console.log("Extension state after checkStatus:", config.isEnabled);
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
    console.log("Setting up double-click trigger...");
    // Listen for double-click events
    document.addEventListener('dblclick', (e) => {
      console.log("Double-click detected, isEnabled:", config.isEnabled);
      if (!config.isEnabled) {
        console.log("Extension is disabled, ignoring double-click.");
        return;
      }
      
      // Only process left-click (button 0)
      if (e.button === 0) {
        console.log("Processing double-click event...");
        processPageContent();
      }
    });
    
    // Always listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("Received message in content_script.js:", request);
      if (request.action === "toggleExtension") {
        config.isEnabled = request.isEnabled;
        console.log("Updated isEnabled state:", config.isEnabled);
        sendResponse({status: "ok"});
        window.showNotification(`Extension ${config.isEnabled ? 'enabled' : 'disabled'}.`);
      }
      
      return true;
    });
  }

  // Set up keyboard shortcut for toggling
  function setupKeyboardShortcut() {
    console.log("Setting up keyboard shortcut (Ctrl+Shift+S)...");
    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey; // Use Command on Mac, Ctrl on others
      if (ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        console.log("Ctrl+Shift+S detected, sending toggleExtension message...");
        e.preventDefault();
        chrome.runtime.sendMessage({ action: "toggleExtension" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending toggleExtension message:", chrome.runtime.lastError.message);
            window.showNotification("Error toggling extension.");
            return;
          }
          if (response.status === "ok") {
            config.isEnabled = response.isEnabled;
            console.log("Toggled state:", config.isEnabled);
            window.showNotification(`Extension ${config.isEnabled ? 'enabled' : 'disabled'}.`);
          } else {
            window.showNotification("Error toggling extension.");
          }
        });
      }
    });
  }
  
  // Process the content of the current page
  async function processPageContent() {
    console.log("Processing page content...");
    try {
      // Extract content from the page
      const content = window.extractContent();
      console.log("Extracted content:", content);
      if (!content.question) {
        window.showNotification("No question content found on this page.");
        return;
      }
      
      // Construct a prompt from the extracted content
      const prompt = constructPrompt(content);
      console.log("Constructed prompt:", prompt);
      
      // Call the API through our proxy
      const result = await window.callAPI(prompt);
      console.log("API call result:", result);
      
      if (result && result.choices && result.choices[0] && result.choices[0].message) {
        // Show the answer
        window.showAnswer(result.choices[0].message.content);
      } else {
        window.showNotification("Could not retrieve an answer. Try again.");
      }
    } catch (error) {
      console.error("Error processing content:", error);
      window.showNotification("Error processing request.");
    }
  }
  
  // Construct a prompt from the extracted content
  function constructPrompt(content) {
    return "Question: " + content.question + "\n" +
      (content.options.length > 0 ? 
       "Options:\n" + content.options.map((opt, i) => (i + 1) + ". " + opt).join("\n") : "") +
      "\nPlease provide the correct answer with brief explanation.";
  }
})();