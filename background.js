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
    callCount: 0,
    triggerMethod: "gesture" // options: "gesture", "clipboard", "context"
  });
  
  // Create context menu item
  chrome.contextMenus.create({
    id: "analyzeSelection",
    title: "Analyze Selection",
    contexts: ["selection"]
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeSelection" && info.selectionText) {
    // Send the selected text to the content script
    chrome.tabs.sendMessage(tab.id, {
      action: "processSelection",
      selection: info.selectionText
    });
  }
});

// Set up different communication channels to avoid detection
// 1. Direct message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkStatus") {
    chrome.storage.local.get(['isEnabled', 'triggerMethod'], (data) => {
      sendResponse({ 
        isEnabled: data.isEnabled || true,
        triggerMethod: data.triggerMethod || "gesture" 
      });
    });
    return true; // Keep the messaging channel open for async response
  }
  
  // Handle API proxy request
  if (request.action === "proxyApiCall") {
    handleApiCall(request.prompt)
      .then(response => {
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
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the messaging channel open for async response
  }
});

// 2. Handle API call - implementation varies to avoid detection patterns
async function handleApiCall(prompt) {
  try {
    // Get the API key from storage
    const data = await chrome.storage.local.get(['apiKeyEncoded']);
    const apiKey = atob(data.apiKeyEncoded || API_KEY_ENCODED);
    
    // Randomize endpoint selection to avoid pattern detection
    // This could be expanded to use different proxy mechanisms
    const endpoints = [
      "https://api.mistral.ai/v1/chat/completions",
      // Additional proxies could be added here
    ];
    
    const selectedEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    
    // Add jitter to the timing to avoid detection
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 800) + 200));
    
    // Make the API call
    const response = await fetch(selectedEndpoint, {
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

// Listen for browser action clicks
chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get(['isEnabled'], (data) => {
    const newState = !(data.isEnabled);
    chrome.storage.local.set({ isEnabled: newState });
    
    // Update the icon to reflect the enabled/disabled state
    const iconState = newState ? "" : "-disabled";
    chrome.action.setIcon({
      path: {
        16: `icon-16${iconState}.png`,
        48: `icon-48${iconState}.png`,
        128: `icon-128${iconState}.png`
      }
    });
    
    // Notify the content script of the state change
    chrome.tabs.sendMessage(tab.id, {
      action: "toggleExtension",
      isEnabled: newState
    });
  });
});
