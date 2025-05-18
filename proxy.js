// proxy.js - Module for handling API communication through various stealth methods

// Array of different proxy methods to use for API calls
const PROXY_METHODS = [
  'direct',      // Direct API call (fallback)
  'beacon',      // Use navigator.sendBeacon
  'worker',      // Use Web Worker
  'iframe'       // Use invisible iframe
];

// Entry point for API calls - chooses a random proxy method
export async function callAPI(prompt) {
  try {
    // Select a random proxy method
    const methodIndex = Math.floor(Math.random() * PROXY_METHODS.length);
    const method = PROXY_METHODS[methodIndex];
    
    // Add a small random delay to avoid predictable timing patterns
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
    
    // Call the appropriate proxy method
    switch (method) {
      case 'beacon':
        return await useBeaconProxy(prompt);
      case 'worker':
        return await useWorkerProxy(prompt);
      case 'iframe':
        return await useIframeProxy(prompt);
      case 'direct':
      default:
        return await useBackgroundProxy(prompt);
    }
  } catch (error) {
    console.error("API proxy error:", error);
    // If the chosen method fails, fall back to the background script method
    return await useBackgroundProxy(prompt);
  }
}

// Method 1: Use the background script as a proxy (most reliable)
async function useBackgroundProxy(prompt) {
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

// Method 2: Use navigator.sendBeacon (fire and forget, less detectable)
async function useBeaconProxy(prompt) {
  // First check if this browser supports sendBeacon
  if (!navigator.sendBeacon) {
    return await useBackgroundProxy(prompt);
  }
  
  try {
    // Since sendBeacon is one-way, we need to use the background script anyway
    // But this approach mixes methods which makes detection harder
    const beaconSent = navigator.sendBeacon(
      'https://log.example.com/beacon', 
      JSON.stringify({ type: 'analytics', timestamp: Date.now() })
    );
    
    // After sending the decoy beacon, use the background script
    return await useBackgroundProxy(prompt);
  } catch (error) {
    console.error("Beacon error:", error);
    return await useBackgroundProxy(prompt);
  }
}

// Method 3: Use a Web Worker to make the call
async function useWorkerProxy(prompt) {
  return new Promise((resolve, reject) => {
    try {
      // Create a worker from a blob to avoid loading an external file
      const workerCode = `
        self.onmessage = async function(e) {
          try {
            // Just relay the message to the background script
            // Workers can't access chrome.runtime API directly
            self.postMessage({type: 'relay_to_background', prompt: e.data.prompt});
          } catch (error) {
            self.postMessage({error: error.message});
          }
        };
      `;
      
      const blob = new Blob([workerCode], {type: 'application/javascript'});
      const worker = new Worker(URL.createObjectURL(blob));
      
      worker.onmessage = async function(e) {
        if (e.data.type === 'relay_to_background') {
          try {
            // Use the background script method
            const result = await useBackgroundProxy(e.data.prompt);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            worker.terminate();
          }
        } else if (e.data.error) {
          reject(new Error(e.data.error));
          worker.terminate();
        }
      };
      
      worker.onerror = function(error) {
        reject(error);
        worker.terminate();
      };
      
      // Start the worker
      worker.postMessage({prompt});
      
    } catch (error) {
      console.error("Worker error:", error);
      // Fall back to background proxy
      resolve(useBackgroundProxy(prompt));
    }
  });
}

// Method 4: Use an invisible iframe to make the call
async function useIframeProxy(prompt) {
  return new Promise((resolve, reject) => {
    try {
      // Create a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      
      // Set a random src to a valid but harmless URL
      iframe.src = 'about:blank';
      
      // Create a message channel for communication
      const channel = new MessageChannel();
      
      // Handle messages from the iframe
      channel.port1.onmessage = async function(event) {
        if (event.data === 'ready') {
          try {
            // Use the background script method
            const result = await useBackgroundProxy(prompt);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            // Clean up
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            channel.port1.close();
          }
        }
      };
      
      // Once the iframe loads, set up the message passing
      iframe.onload = function() {
        try {
          // Post a message to initialize the iframe
          iframe.contentWindow.postMessage('init', '*', [channel.port2]);
        } catch (error) {
          console.error("Iframe communication error:", error);
          reject(error);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }
      };
      
      // Add to the document
      document.body.appendChild(iframe);
      
      // Set a timeout to clean up if something goes wrong
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
          reject(new Error("Iframe proxy timed out"));
        }
      }, 5000);
      
    } catch (error) {
      console.error("Iframe error:", error);
      // Fall back to background proxy
      resolve(useBackgroundProxy(prompt));
    }
  });
}

// Additional utility for encoding/decoding data
export function encodeData(data) {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

export function decodeData(encoded) {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch (e) {
    console.error("Decode error:", e);
    return null;
  }
}
