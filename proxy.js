// proxy.js - Module for proxying API calls

window.callAPI = async function(prompt) {
  console.log("callAPI called with prompt:", prompt);
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "proxyApiCall", prompt },
      response => {
        if (chrome.runtime.lastError) {
          console.error("callAPI error:", chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!response || response.error) {
          console.error("callAPI failed:", response?.error || "Unknown proxy error");
          reject(new Error(response?.error || "Unknown proxy error"));
        } else {
          console.log("callAPI successful:", response.data);
          resolve(response.data);
        }
      }
    );
  });
};

console.log("proxy.js loaded.");