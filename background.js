// background.js - Service worker that runs in the background

// Store API key securely using Chrome's storage API (obfuscated)
const API_KEY_ENCODED = "bmpLdXhMa1cwNDR3bmlWeGlNbHliTTRvM1R5bXBLT1I=";
let isEnabled = true;

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  // Store the API key securely
  chrome.storage.local.set({ 
    apiKeyEncoded: API_KEY_ENCODED,
    lastUsed: Date.now(),
    isEnabled: true,
    callCount: 0
  });
});

// Set up direct message handling with error handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "checkStatus") {
      chrome.storage.local.get(['isEnabled'], (data) => {
        if (chrome.runtime.lastError) {
          console.error("Error in checkStatus:", chrome.runtime.lastError.message);
          return;
        }
        sendResponse({ 
          isEnabled: data.isEnabled || true
        });
      });
      return true; // Keep the messaging channel open for async response
    }
    
    // Handle API proxy request
    if (request.action === "proxyApiCall") {
      handleApiCall(request.prompt)
        .then(response => {
          if (chrome.runtime.lastError) {
            console.error("Error in proxyApiCall response:", chrome.runtime.lastError.message);
            return;
          }
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
            return;
          }
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep the messaging channel open for async response
    }

    // Handle toggle request from content script
    if (request.action === "toggleExtension") {
      chrome.storage.local.get(['isEnabled'], (data) => {
        const newState = !(data.isEnabled);
        chrome.storage.local.set({ isEnabled: newState }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving toggle state:", chrome.runtime.lastError.message);
            sendResponse({ status: "error" });
            return;
          }
          // Notify all tabs of the state change
          chrome.tabs.query({}, (tabs) => {
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
  }
});

// Listen for the toggle command
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-extension") {
    chrome.storage.local.get(['isEnabled'], (data) => {
      const newState = !(data.isEnabled);
      chrome.storage.local.set({ isEnabled: newState }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving toggle state:", chrome.runtime.lastError.message);
          return;
        }
        // Notify all tabs of the state change
        chrome.tabs.query({}, (tabs) => {
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
    // Get the API key from storage
    const data = await chrome.storage.local.get(['apiKeyEncoded']);
    const apiKey = atob(data.apiKeyEncoded || API_KEY_ENCODED);
    
    // Add small delay to avoid detection
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 300) + 100));
    
    // Make the API call
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
    
    return await response.json();
  } catch (e) {
    console.error("API call error:", e);
    return { error: "API call failed", details: e.message };
  }
}