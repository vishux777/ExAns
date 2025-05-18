// content_script.js - Runs in the context of web pages

// Use IIFE to avoid polluting the global scope
(function() {
  // Configuration - will be loaded from extension storage
  let config = {
    isEnabled: true,
    triggerMethod: "gesture" // 'gesture', 'clipboard', 'context'
  };
  
  // Dynamically import modules using Chrome's extension URL scheme
  // This helps avoid detection by splitting functionality
  const loadModule = async (moduleName) => {
    const url = chrome.runtime.getURL(moduleName);
    return await import(url);
  };

  // References to our modules - will be loaded asynchronously
  let extractorModule;
  let uiModule;
  let proxyModule;
  
  // Initialize everything with a random delay to avoid detection
  setTimeout(initializeExtension, Math.random() * 2000 + 1000);
  
  // Main initialization function
  async function initializeExtension() {
    try {
      // Load configuration from storage
      chrome.storage.local.get(['isEnabled', 'triggerMethod'], (data) => {
        config.isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
        config.triggerMethod = data.triggerMethod || "gesture";
        
        // After loading config, proceed with module loading
        loadModules();
      });
    } catch (error) {
      console.error("Initialization error:", error);
    }
  }
  
  // Load all required modules
  async function loadModules() {
    try {
      // Load modules dynamically with small delays between each load
      extractorModule = await loadModule('extractor.js');
      await new Promise(r => setTimeout(r, Math.random() * 300 + 50));
      
      uiModule = await loadModule('ui.js');
      await new Promise(r => setTimeout(r, Math.random() * 300 + 50));
      
      proxyModule = await loadModule('proxy.js');
      
      // After loading all modules, set up the trigger mechanisms
      setupTriggers();
    } catch (error) {
      console.error("Module loading error:", error);
    }
  }
  
  // Set up the trigger mechanisms based on configuration
  function setupTriggers() {
    // Always listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggleExtension") {
        config.isEnabled = request.isEnabled;
        sendResponse({status: "ok"});
      }
      
      if (request.action === "processSelection" && config.isEnabled) {
        processContent(request.selection);
        sendResponse({status: "processing"});
      }
      
      return true;
    });
    
    // Set up gesture-based trigger (default)
    if (config.triggerMethod === "gesture") {
      setupGestureTrigger();
    }
    
    // Set up clipboard-based trigger
    if (config.triggerMethod === "clipboard") {
      setupClipboardTrigger();
    }
    
    // Context menu trigger is handled by the background script
  }
  
  // Gesture-based trigger using a specific mouse pattern
  function setupGestureTrigger() {
    // Gesture tracking variables
    let gesturePoints = [];
    let isRecording = false;
    let gestureTimeout;
    
    // Start recording when middle mouse button is pressed
    document.addEventListener('mousedown', (e) => {
      if (!config.isEnabled) return;
      
      // Middle mouse button (button 1)
      if (e.button === 1) {
        isRecording = true;
        gesturePoints = [{x: e.clientX, y: e.clientY, time: Date.now()}];
        
        // Clear any existing timeout
        if (gestureTimeout) clearTimeout(gestureTimeout);
      }
    });
    
    // Record mouse movements while middle mouse is held
    document.addEventListener('mousemove', (e) => {
      if (!config.isEnabled || !isRecording) return;
      
      // Only record points at a reasonable interval to avoid too many points
      const lastPoint = gesturePoints[gesturePoints.length - 1];
      if (Date.now() - lastPoint.time > 50) {
        gesturePoints.push({x: e.clientX, y: e.clientY, time: Date.now()});
      }
    });
    
    // End recording when middle mouse button is released
    document.addEventListener('mouseup', (e) => {
      if (!config.isEnabled || !isRecording) return;
      
      if (e.button === 1) {
        isRecording = false;
        gesturePoints.push({x: e.clientX, y: e.clientY, time: Date.now()});
        
        // Process the gesture
        if (isZGesture(gesturePoints)) {
          processPageContent();
        }
        
        // Reset after a delay
        gestureTimeout = setTimeout(() => {
          gesturePoints = [];
        }, 1000);
      }
    });
  }
  
  // Check if the gesture resembles a "Z" pattern
  function isZGesture(points) {
    if (points.length < 4) return false;
    
    // Simplify the gesture to 3 main points (start, middle, end)
    const start = points[0];
    const middle = points[Math.floor(points.length / 2)];
    const end = points[points.length - 1];
    
    // Calculate if it resembles a "Z" pattern
    // First, check if the points form a horizontal line, then diagonal, then horizontal
    const isHorizontalFirst = Math.abs(middle.y - start.y) < 50 && (middle.x - start.x) > 50;
    const isDiagonal = (end.y - middle.y) > 50 && Math.abs(end.x - middle.x) > 50;
    const isOppositeDirection = (middle.x - start.x) * (end.x - middle.x) < 0;
    
    return isHorizontalFirst && isDiagonal && isOppositeDirection;
  }
  
  // Clipboard-based trigger
  function setupClipboardTrigger() {
    // Listen for clipboard events when the page is focused
    document.addEventListener('paste', (e) => {
      if (!config.isEnabled) return;
      
      // Check if the clipboard content contains a specific trigger phrase
      const clipboardText = e.clipboardData.getData('text');
      if (clipboardText.includes("?analyze")) {
        e.preventDefault(); // Prevent the actual paste
        
        // Process the page content
        processPageContent();
      }
    });
  }
  
  // Process the content of the current page
  async function processPageContent() {
    try {
      if (!extractorModule) {
        console.error("Extractor module not loaded");
        return;
      }
      
      // Extract content from the page
      const content = extractorModule.extractContent();
      if (!content.question) {
        uiModule.showNotification("No question content found on this page.");
        return;
      }
      
      // Call the API through our proxy
      const prompt = constructPrompt(content);
      const result = await proxyModule.callAPI(prompt);
      
      if (result && result.choices && result.choices[0] && result.choices[0].message) {
        // Show the answer using our stealth UI
        uiModule.showAnswer(result.choices[0].message.content);
      } else {
        uiModule.showNotification("Could not retrieve an answer. Try again.");
      }
    } catch (error) {
      console.error("Error processing content:", error);
      uiModule.showNotification("Error processing request.");
    }
  }
  
  // Process specific content (usually from selection)
  async function processContent(text) {
    try {
      if (!text) return;
      
      // Create a prompt from the selected text
      const prompt = "Analyze the following text and provide insights:\n\n" + text;
      
      // Call the API through our proxy
      const result = await proxyModule.callAPI(prompt);
      
      if (result && result.choices && result.choices[0] && result.choices[0].message) {
        // Show the answer using our stealth UI
        uiModule.showAnswer(result.choices[0].message.content);
      } else {
        uiModule.showNotification("Could not retrieve insights. Try again.");
      }
    } catch (error) {
      console.error("Error processing selection:", error);
      uiModule.showNotification("Error processing request.");
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
