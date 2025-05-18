// background.js

const a1 = "bmpLdXhMa1cwNDR3bmlWeGlNbHliTTRvM1R5bXBLT1I=";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    a2: a1,
    a3: Date.now(),
    a4: 0
  });
});

chrome.runtime.onMessage.addListener((b1, b2, b3) => {
  try {
    if (b1.c1 === "d1") {
      b3({ d2: true });
      return true;
    }
    
    if (b1.c1 === "e1") {
      f1(b1.e2)
        .then(f2 => {
          b3({ f3: true, f4: f2 });
          chrome.storage.local.get(['a4'], (g1) => {
            chrome.storage.local.set({ 
              a4: (g1.a4 || 0) + 1,
              a3: Date.now()
            });
          });
        })
        .catch(f5 => {
          b3({ f3: false, f6: f5.message });
        });
      return true;
    }
  } catch (f7) {
    b3({ f3: false, f6: "h1" });
  }
});

async function f1(h2) {
  try {
    const i1 = await new Promise(i2 => {
      chrome.storage.local.get(['a2'], i2);
    });
    const i3 = atob(i1.a2 || a1);
    
    await new Promise(i4 => setTimeout(i4, Math.floor(Math.random() * 300) + 100));
    
    const i5 = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + i3
      },
      body: JSON.stringify({
        model: "mistral-medium",
        messages: [{ role: "user", content: h2 }],
        max_tokens: 800
      })
    });
    
    if (!i5.ok) {
      throw new Error(`j1 ${i5.status}`);
    }
    
    const i6 = await i5.json();
    if (i6.error) {
      throw new Error(`j2 ${i6.error.message || 'j3'}`);
    }
    
    return i6;
  } catch (j4) {
    return { j5: "j6", j7: j4.message };
  }
}