// background.js - Service worker that runs in the background

// Store API key securely using Chrome's storage API (obfuscated)
const API_KEY_ENCODED = "bmpLdXhMa1cwNDR3bmlWeGlNbHliTTRvM1R5bXBLT1I=";

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log("Chrome Background Theme installed. Initializing storage...");
  chrome.storage.local.set({ 
    apiKeyEncoded: API_KEY_ENCODED,
    lastUsed: Date.now(),
    isEnabled: true,
    callCount: 0
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error initializing storage:", chrome.runtime.lastError.message);
    } else {
      console.log("Storage initialized successfully.");
    }
  });
});

// Set up direct message handling with error handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message in background.js:", request);
  try {
    if (request.action === "checkStatus") {
      chrome.storage.local.get(['isEnabled'], (data) => {
        if (chrome.runtime.lastError) {
          console.error("Error in checkStatus:", chrome.runtime.lastError.message);
          sendResponse({ isEnabled: true }); // Fallback to default
          return;
        }
        const isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
        console.log("checkStatus response:", { isEnabled });
        sendResponse({ isEnabled });
      });
      return true; // Keep the messaging channel open for async response
    }
    
    if (request.action === "proxyApiCall") {
      console.log("Handling proxyApiCall with prompt:", request.prompt);
      handleApiCall(request.prompt)
        .then(response => {
          if (chrome.runtime.lastError) {
            console.error("Error in proxyApiCall response:", chrome.runtime.lastError.message);
            sendResponse({ success: false, error: "Runtime error" });
            return;
          }
          console.log("proxyApiCall successful:", response);
          sendResponse({ success: true, data: response });
          
          // Update usage metrics
          chrome.storage.local.get(['callCount'], (data) => {
            chrome.storage.local.set({ 
              callCount: (data.callCount || 0) + 1,
              lastUsed: Date.now()
            });
          });
        })
        .catch(error => {
          if (chrome.runtime.lastError) {
            console.error("Error in proxyApiCall catch:", chrome.runtime.lastError.message);
            sendResponse({ success: false, error: "Runtime error" });
            return;
          }
          console.error("proxyApiCall failed:", error.message);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep the messaging channel open for async response
    }

    if (request.action === "toggleExtension") {
      console.log("Received toggleExtension request.");
      chrome.storage.local.get(['isEnabled'], (data) => {
        const newState = !data.isEnabled;
        console.log("Toggling extension state to:", newState);
        chrome.storage.local.set({ isEnabled: newState }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving toggle state:", chrome.runtime.lastError.message);
            sendResponse({ status: "error" });
            return;
          }
          // Notify all tabs of the state change
          chrome.tabs.query({}, (tabs) => {
            console.log("Notifying all tabs of state change:", newState);
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, {
                action: "toggleExtension",
                isEnabled: newState
              }, (response) => {
                if (chrome.runtime.lastError) {
                  console.error(`Error notifying tab ${tab.id}:`, chrome.runtime.lastError.message);
                }
              });
            });
          });
          sendResponse({ status: "ok", isEnabled: newState });
        });
      });
      return true; // Keep the messaging channel open for async response
    }
  } catch (error) {
    console.error("Message listener error:", error);
    sendResponse({ success: false, error: "Message listener error" });
  }
});

// Listen for the toggle command
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-extension") {
    console.log("Toggle command received via keyboard shortcut.");
    chrome.storage.local.get(['isEnabled'], (data) => {
      const newState = !data.isEnabled;
      console.log("Toggling extension state via command to:", newState);
      chrome.storage.local.set({ isEnabled: newState }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving toggle state:", chrome.runtime.lastError.message);
          return;
        }
        // Notify all tabs of the state change
        chrome.tabs.query({}, (tabs) => {
          console.log("Notifying all tabs of state change via command:", newState);
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              action: "toggleExtension",
              isEnabled: newState
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error(`Error notifying tab ${tab.id}:`, chrome.runtime.lastError.message);
              }
            });
          });
        });
      });
    });
  }
});

// Handle API call
async function handleApiCall(prompt) {
  try {
    console.log("Initiating API call with prompt:", prompt);
    // Get the API key from storage
    const data = await new Promise((resolve) => {
      chrome.storage.local.get(['apiKeyEncoded'], resolve);
    });
    const apiKey = atob(data.apiKeyEncoded || API_KEY_ENCODED);
    console.log("API key retrieved successfully.");
    
    // Add small delay to avoid detection
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 300) + 100));
    
    // Make the API call
    console.log("Making API call to Mistral AI...");
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: "mistral-medium",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}, Status Text: ${response.statusText}`);
    }
    
    const jsonResponse = await response.json();
    if (jsonResponse.error) {
      throw new Error(`API error: ${jsonResponse.error.message || 'Unknown error'}`);
    }
    
    console.log("API call successful:", jsonResponse);
    return jsonResponse;
  } catch (e) {
    console.error("API call error:", {
      message: e.message,
      stack: e.stack,
      url: "https://api.mistral.ai/v1/chat/completions"
    });
    return { error: "API call failed", details: e.message };
  }
}